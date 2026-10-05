import { parseCalendar } from "./lib.js";
export function validateFeed(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw Error(
      "Paste the Secret address in iCal format from Google Calendar.",
    );
  }
  if (
    url.protocol !== "https:" ||
    url.hostname !== "calendar.google.com" ||
    url.port ||
    url.username ||
    url.password ||
    !url.pathname.startsWith("/calendar/ical/") ||
    !url.pathname.endsWith("/basic.ics") ||
    url.search ||
    url.hash
  )
    throw Error(
      "Use a Google Calendar iCal address beginning with https://calendar.google.com/calendar/ical/.",
    );
  return url.href;
}
async function readBounded(response, limit) {
  const reader = response.body.getReader();
  let size = 0,
    chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > limit) {
      await reader.cancel();
      throw Error(
        "This calendar is too large to sync. Export a smaller calendar instead.",
      );
    }
    chunks.push(value);
  }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(result);
}
export async function syncGoogle(env, owner, connection) {
  const feed = validateFeed(connection.url);
  const response = await fetch(feed, {
    redirect: "error",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok)
    throw Error(
      "Google Calendar could not be read. Check the private iCal address and try again.",
    );
  const ics = await readBounded(response, 2 * 1024 * 1024);
  const parsed = parseCalendar(ics, connection.timezone || "America/New_York");
  const statements = [
    env.DB.prepare(
      "DELETE FROM events WHERE owner = ? AND id LIKE 'gcal-%'",
    ).bind(owner),
  ];
  for (const e of parsed.events) {
    const hash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(owner + "|" + e.source),
    );
    const id =
      "gcal-" +
      [...new Uint8Array(hash)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    statements.push(
      env.DB.prepare(
        "INSERT INTO events (id,owner,title,start,end,mood) VALUES (?,?,?,?,?,?)",
      ).bind(id, owner, e.title, e.start, e.end, e.mood),
    );
  }
  await env.DB.batch(statements);
  const updated = {
    ...connection,
    lastSync: new Date().toISOString(),
    count: parsed.events.length,
    skipped: parsed.skipped,
  };
  await env.BUCKET.put(
    "connections/" + owner + "/google",
    JSON.stringify(updated),
  );
  return {
    connected: true,
    lastSync: updated.lastSync,
    count: updated.count,
    skipped: updated.skipped,
  };
}
