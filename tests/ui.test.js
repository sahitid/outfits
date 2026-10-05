import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { build } from "esbuild";
test("React closet supports styling, saved outfits, per-mood vibes, and photo-first upload", async (t) => {
  const bundle = await build({
    stdin: {
      contents: `import React from 'react';import {createRoot} from 'react-dom/client';import App from './components/closet-app.jsx';const root=createRoot(document.getElementById('app'));root.render(<App/>);window.cleanup=()=>root.unmount();`,
      resolveDir: process.cwd(),
      loader: "jsx",
    },
    bundle: true,
    write: false,
    platform: "browser",
    format: "iife",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
  });
  const dom = new JSDOM('<html><body><div id="app"></div></body></html>', {
      url: "https://closet.test",
      runScripts: "outside-only",
      pretendToBeVisual: true,
    }),
    w = dom.window;
  t.after(() => {
    w.cleanup?.();
    w.close();
  });
  w.scrollTo = () => {};
  w.matchMedia = () => ({
    matches: false,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  });
  w.ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
  w.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  w.HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
  w.Headers = Headers;
  const tools = new Map();
  w.document.modelContext = {
    registerTool(t) {
      tools.set(t.name, t);
    },
  };
  let outfits = [],
    settings = {};
  w.fetch = async (path, opts = {}) => {
    let data;
    if (path === "/api/closet")
      data = {
        garments: [],
        outfits,
        events: [],
        settings,
        user: { email: "alice@example.test", name: "Alice" },
      };
    else if (path === "/api/connections")
      data = { ai: false, google: { connected: false } };
    else if (path.startsWith("/api/weather"))
      data = { temperature: 20, rain: 0, description: "Clear skies", days: [] };
    else if (path === "/api/recommend")
      data = {
        pieces: ["demo-1", "demo-8"],
        mood: "casual",
        title: "Soft campus look",
        reason: "One soft color and balanced proportions.",
        details: [],
        engine: "style-rules",
      };
    else if (path === "/api/outfits") {
      data = { id: "saved", ...JSON.parse(opts.body) };
      outfits.push(data);
    } else if (path === "/api/settings") {
      const patch = JSON.parse(opts.body);
      settings = { ...settings, ...patch };
      data = settings;
    } else throw Error("Unexpected " + path);
    return { ok: true, json: async () => data };
  };
  w.eval(bundle.outputFiles[0].text);
  const wait = () => new Promise((r) => setTimeout(r, 80));
  await wait();
  await wait();
  const btn = (text) =>
    [...w.document.querySelectorAll("button")].find((b) =>
      b.textContent.trim().startsWith(text),
    );
  assert.equal(w.document.querySelectorAll(".garment-tile").length, 12);
  btn("Find my pairing").click();
  await wait();
  assert.equal(
    w.document.querySelectorAll(".fit-stage .garment-art").length,
    2,
  );
  btn("Save outfit").click();
  await wait();
  assert(w.document.querySelector("dialog").open);
  w.document
    .querySelector("dialog form")
    .dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  await wait();
  btn("My outfits").click();
  await wait();
  assert.match(w.document.body.textContent, /Soft campus look/);
  btn("My vibes").click();
  await wait();
  assert.equal(w.document.querySelectorAll(".vibe-photo").length, 6);
  assert.equal(
    w.document.querySelectorAll('a[href*="pinterest.com"]').length,
    6,
  );
  assert(tools.has("open_vibe_picker"));
  assert.throws(
    () => tools.get("open_vibe_picker").execute({ mood: "bad" }),
    /Invalid/,
  );
  tools.get("open_vibe_picker").execute({ mood: "professional" });
  await wait();
  assert.match(w.document.body.textContent, /For professional/);
  btn("My closet").click();
  await wait();
  btn("Add clothing").click();
  await wait();
  assert.match(w.document.querySelector("dialog").textContent, /One photo/);
  assert.equal(
    w.document.querySelectorAll("dialog input[type=file]").length,
    2,
  );
  assert(!w.document.querySelector('dialog input[maxlength="80"]'));
  w.cleanup();
  w.close();
});
