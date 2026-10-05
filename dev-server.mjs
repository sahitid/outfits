import http from "node:http";
import next from "next";
import { DatabaseSync } from "node:sqlite";
import { mkdir, readFile, writeFile, unlink, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import worker from "./worker.js";
// Local-only adapter. Never included in the production Worker artifact.
await mkdir(".local/photos", { recursive: true });
const sqlite = new DatabaseSync(".local/closet.sqlite");
sqlite.exec(
  "CREATE TABLE IF NOT EXISTS _local_migrations (name TEXT PRIMARY KEY)",
);
for (const name of (await readdir("drizzle"))
  .filter((n) => n.endsWith(".sql"))
  .sort()) {
  if (
    sqlite
      .prepare("SELECT name FROM _local_migrations WHERE name = ?")
      .get(name)
  )
    continue;
  sqlite.exec("BEGIN");
  try {
    sqlite.exec(await readFile("drizzle/" + name, "utf8"));
    sqlite.prepare("INSERT INTO _local_migrations (name) VALUES (?)").run(name);
    sqlite.exec("COMMIT");
  } catch (e) {
    sqlite.exec("ROLLBACK");
    throw e;
  }
}
const prepare = (sql, args = []) => ({
  bind(...values) {
    return prepare(sql, values);
  },
  async all() {
    return { results: sqlite.prepare(sql).all(...args) };
  },
  async first() {
    return sqlite.prepare(sql).get(...args) || null;
  },
  async run() {
    return sqlite.prepare(sql).run(...args);
  },
});
const filename = (key) =>
  ".local/photos/" + createHash("sha256").update(key).digest("hex");
const env = {
  DB: {
    prepare,
    async batch(statements) {
      sqlite.exec("BEGIN");
      try {
        const result = [];
        for (const statement of statements) result.push(await statement.run());
        sqlite.exec("COMMIT");
        return result;
      } catch (e) {
        sqlite.exec("ROLLBACK");
        throw e;
      }
    },
  },
  BUCKET: {
    async put(key, value, options = {}) {
      const bytes =
        typeof value === "string"
          ? Buffer.from(value)
          : value instanceof ArrayBuffer
            ? Buffer.from(value)
            : Buffer.from(await new Response(value).arrayBuffer());
      await writeFile(filename(key), bytes);
      await writeFile(filename(key) + ".json", JSON.stringify(options));
    },
    async get(key) {
      try {
        const bytes = await readFile(filename(key)),
          metadata = JSON.parse(
            await readFile(filename(key) + ".json", "utf8"),
          );
        return {
          body: bytes,
          httpMetadata: metadata.httpMetadata,
          text: async () => bytes.toString("utf8"),
        };
      } catch (e) {
        if (e.code === "ENOENT") return null;
        throw e;
      }
    },
    async delete(key) {
      for (const f of [filename(key), filename(key) + ".json"])
        await unlink(f).catch((e) => {
          if (e.code !== "ENOENT") throw e;
        });
    },
  },
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};
const port = Number(process.env.PORT || 3000),
  app = next({ dev: true, hostname: "127.0.0.1", port });
await app.prepare();
const handler = app.getRequestHandler();
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://127.0.0.1:" + port);
      if (url.pathname.startsWith("/api/")) {
        if (
          !["127.0.0.1:" + port, "localhost:" + port].includes(req.headers.host)
        ) {
          res.writeHead(403);
          res.end("Local development only");
          return;
        }
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers))
          if (value)
            headers.set(key, Array.isArray(value) ? value.join(",") : value);
        headers.set("oai-authenticated-user-id", "local-development");
        headers.set("oai-authenticated-user-email", "you@local.test");
        let body;
        if (!["GET", "HEAD"].includes(req.method)) {
          const chunks = [];
          let size = 0;
          for await (const chunk of req) {
            size += chunk.length;
            if (size > 5 * 1024 * 1024) {
              res.writeHead(413);
              res.end("Upload too large");
              return;
            }
            chunks.push(chunk);
          }
          body = Buffer.concat(chunks);
        }
        const request = new Request("http://" + req.headers.host + req.url, {
          method: req.method,
          headers,
          body,
        });
        const response = await worker.fetch(request, env);
        res.writeHead(response.status, Object.fromEntries(response.headers));
        res.end(Buffer.from(await response.arrayBuffer()));
        return;
      }
      if (
        ["/signin-with-chatgpt", "/signout-with-chatgpt"].includes(url.pathname)
      ) {
        res.writeHead(302, { location: "/" });
        res.end();
        return;
      }
      await handler(req, res);
    } catch (e) {
      console.error(e.message);
      res.writeHead(500, { "content-type": "application/json" });
      res.end(
        JSON.stringify({ error: "Local server error. Check the terminal." }),
      );
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log("Form ready at http://127.0.0.1:" + port),
  );
