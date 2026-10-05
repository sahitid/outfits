"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Plus,
  Sparkles,
  CalendarDays,
  CloudSun,
  LockKeyhole,
  Settings2,
  LayoutGrid,
  Bookmark,
  X,
  Camera,
  Heart,
  MapPin,
  RefreshCw,
  Search,
  LoaderCircle,
  Trash2,
  Check,
  ExternalLink,
  Unplug,
  Sun,
  CloudRain,
  GraduationCap,
  ImagePlus,
  Info,
} from "lucide-react";
import {
  MOODS,
  TYPES,
  LABELS,
  COLORS,
  PATTERNS,
  FITS,
  LENGTHS,
  AESTHETICS,
  DEFAULT_VIBES,
  DEFAULT_LOCATION,
  samplePieces,
  legacySamples,
  STYLE_SOURCES,
} from "../catalog";

const cx = (...parts) => parts.filter(Boolean).join(" ");
const title = (s) =>
  String(s || "")
    .replace(/-/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
async function api(path, options = {}) {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  const response = await fetch("/api/" + path, { ...options, headers });
  const data = await response
    .json()
    .catch(() => ({
      error: "Could not load this right now. Please try again.",
    }));
  if (!response.ok)
    throw Error(data.error || "Something went wrong. Please try again.");
  return data;
}
const post = (path, data, method = "POST") =>
  api(path, { method, body: JSON.stringify(data) });
function Hanger({ size = 22, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M10 6a2 2 0 1 1 3 1.7c-.6.3-1 .7-1 1.3v2l9 6a1.2 1.2 0 0 1-.7 2H3.7A1.2 1.2 0 0 1 3 17l9-6" />
    </svg>
  );
}
function Art({ piece }) {
  if (!piece) return null;
  return (
    <div className="garment-art">
      {piece.atlas !== undefined ? (
        <div
          role="img"
          aria-label={piece.name}
          className={cx("atlas-art", piece.legacy && "legacy")}
          style={{
            "--x": `${((piece.atlas % 4) * 100) / 3}%`,
            "--y": `${Math.floor(piece.atlas / 4) * (piece.legacy ? 100 : 50)}%`,
          }}
        />
      ) : (
        <img
          src={"/api/images/" + encodeURIComponent(piece.id)}
          alt={piece.name}
          draggable={false}
        />
      )}
    </div>
  );
}
function VibeArt({ index }) {
  return (
    <div
      className="vibe-art"
      style={{
        "--x": `${(index % 3) * 50}%`,
        "--y": `${Math.floor(index / 3) * 100}%`,
      }}
    />
  );
}
function Button({ children, primary, soft, className, ...props }) {
  return (
    <button
      className={cx(
        "btn",
        primary && "btn-primary",
        soft && "btn-soft",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
function Busy({ label = "One moment…" }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LoaderCircle size={17} className="spinner" />
      {label}
    </span>
  );
}
function Empty({ icon: Icon = Hanger, title: heading, children }) {
  return (
    <div className="rounded-xl border border-dashed border-[#cbd5bd] bg-leaf/40 px-6 py-14 text-center">
      <Icon size={38} className="mx-auto mb-4 text-[#94a47e]" />
      <h2 className="text-2xl font-medium">{heading}</h2>
      <div className="mt-3 text-sm leading-relaxed text-muted">{children}</div>
    </div>
  );
}
function Select({ label, value, onChange, values }) {
  return (
    <label className="field">
      {label}
      <select
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {values.map((v) => (
          <option
            key={typeof v === "string" ? v : v.id}
            value={typeof v === "string" ? v : v.id}
          >
            {typeof v === "string" ? LABELS[v] || title(v) : v.label}
          </option>
        ))}
      </select>
    </label>
  );
}
function Dialog({ heading, kicker = "YOUR CLOSET", children, onClose }) {
  const ref = useRef();
  useEffect(() => {
    const d = ref.current;
    if (!d.open) d.showModal();
    const cancel = (e) => {
      e.preventDefault();
      onClose();
    };
    d.addEventListener("cancel", cancel);
    return () => d.removeEventListener("cancel", cancel);
  }, [onClose]);
  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        if (e.target === ref.current) {
          const r = e.target.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className="p-6 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{kicker}</p>
            <h2 className="mt-2 text-3xl font-medium">{heading}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

function GarmentTile({ piece, selected, onSelect, onDetails, stageRef, grid }) {
  const dragged = useRef(false);
  const [moving, setMoving] = useState(false);
  const reduced = useReducedMotion();
  return (
    <div
      className={cx("garment-tile", grid && "grid-view", moving && "dragged")}
    >
      <Hanger className="garment-hanger" />
      <motion.div
        className="garment-visual"
        drag
        dragSnapToOrigin
        dragMomentum={false}
        whileHover={
          reduced ? {} : { rotate: piece.atlas % 2 === 0 ? -3 : 3, y: -3 }
        }
        whileDrag={{ scale: 1.09, rotate: 5, zIndex: 90 }}
        transition={{ type: "spring", stiffness: 310, damping: 19 }}
        onDragStart={() => {
          dragged.current = true;
          setMoving(true);
          stageRef.current?.classList.add("drag-target");
        }}
        onDragEnd={(_, info) => {
          setMoving(false);
          stageRef.current?.classList.remove("drag-target");
          const r = stageRef.current?.getBoundingClientRect();
          if (
            r &&
            info.point.x >= r.left + scrollX &&
            info.point.x <= r.right + scrollX &&
            info.point.y >= r.top + scrollY &&
            info.point.y <= r.bottom + scrollY
          )
            onSelect(piece.id, true);
          setTimeout(() => {
            dragged.current = false;
          }, 120);
        }}
      >
        <button
          aria-label={`Add ${piece.name} to outfit`}
          aria-pressed={selected}
          className="h-full w-full cursor-grab active:cursor-grabbing"
          onClick={() => {
            if (!dragged.current) onSelect(piece.id);
          }}
        >
          <Art piece={piece} />
        </button>
      </motion.div>
      <div
        className={cx(
          "relative rounded-lg border bg-white/85 p-2.5",
          selected ? "border-[#819665]" : "border-line",
        )}
      >
        <button
          className="w-full text-left pr-4"
          onClick={() => onSelect(piece.id)}
        >
          <span className="block truncate text-xs font-medium sm:text-sm">
            {piece.name}
          </span>
          <span className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
            <span
              className="h-2 w-2 rounded-full border border-black/10"
              style={{ background: COLORS[piece.color] }}
            />
            {LABELS[piece.subtype] || title(piece.category)}
          </span>
        </button>
        <button
          onClick={() => onDetails(piece)}
          aria-label={`Details for ${piece.name}`}
          className="absolute right-1 top-1 rounded px-1.5 py-1 text-muted hover:bg-leaf"
        >
          ···
        </button>
        {selected && (
          <Check
            size={13}
            className="absolute bottom-2.5 right-2 text-[#658047]"
          />
        )}
      </div>
    </div>
  );
}

export default function ClosetApp() {
  const [data, setData] = useState({
    garments: [],
    outfits: [],
    events: [],
    settings: { location: DEFAULT_LOCATION },
    user: null,
  });
  const [view, setView] = useState("closet"),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const [mood, setMood] = useState("casual"),
    [filter, setFilter] = useState("all"),
    [subfilter, setSubfilter] = useState("all"),
    [query, setQuery] = useState(""),
    [grid, setGrid] = useState(false);
  const [selection, setSelection] = useState([]),
    [result, setResult] = useState(null),
    [pairing, setPairing] = useState(false),
    [useAI, setUseAI] = useState(true),
    [connections, setConnections] = useState({
      ai: false,
      google: { connected: false },
    }),
    [weather, setWeather] = useState(null),
    [weatherError, setWeatherError] = useState(""),
    [modal, setModal] = useState(null),
    [selectedDate, setSelectedDate] = useState(dayKey());
  const stageRef = useRef(),
    variant = useRef(0),
    toastTimer = useRef(),
    requestVersion = useRef(0);
  const pieces = data.garments.length ? data.garments : samplePieces,
    isDemo = !data.garments.length;
  const find = (id) =>
    data.garments.find((p) => p.id === id) ||
    samplePieces.find((p) => p.id === id) ||
    legacySamples.find((p) => p.id === id);
  const notify = useCallback((text) => {
    setMessage(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setMessage(""), 4500);
  }, []);
  const close = useCallback(() => setModal(null), []);
  const refreshData = useCallback(async () => {
    const d = await api("closet");
    setData(d);
    return d;
  }, []);
  const refreshConnections = useCallback(async () => {
    const c = await api("connections");
    setConnections(c);
    return c;
  }, []);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [d, c] = await Promise.all([api("closet"), api("connections")]);
        if (!alive) return;
        setData(d);
        setConnections(c);
        if (
          c.google.connected &&
          Date.now() - Date.parse(c.google.lastSync) > 15 * 60 * 1000
        ) {
          try {
            const g = await post("google/sync", {});
            if (alive) {
              setConnections((p) => ({ ...p, google: g }));
              await refreshData();
            }
          } catch (e) {
            if (alive) notify(e.message);
          }
        }
      } catch (e) {
        if (alive) setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [notify, refreshData]);
  const loc = data.settings.location || DEFAULT_LOCATION;
  const loadWeather = useCallback(async () => {
    try {
      setWeatherError("");
      const w = await api(`weather?lat=${loc.lat}&lon=${loc.lon}`);
      setWeather(w);
    } catch (e) {
      setWeather(null);
      setWeatherError(e.message);
    }
  }, [loc.lat, loc.lon]);
  useEffect(() => {
    loadWeather();
    const interval = setInterval(loadWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadWeather]);
  const go = (v) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const choose = (id, onlyAdd = false) => {
    setResult(null);
    setSelection((previous) => {
      if (previous.includes(id))
        return onlyAdd ? previous : previous.filter((x) => x !== id);
      const piece = find(id);
      return [
        ...previous.filter((x) => find(x)?.category !== piece.category),
        id,
      ];
    });
  };
  const recommend = async ({ daily = false, date = selectedDate } = {}) => {
    const request = ++requestVersion.current;
    setPairing(true);
    try {
      const eventMood = daily
        ? data.events
            .filter((e) => dayKey(new Date(e.start)) === date)
            .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))[0]?.mood
        : null;
      const activeMood = eventMood || mood;
      const forecast = weather?.days?.find((d) => d.date === date);
      const r = await post("recommend", {
        sample: isDemo,
        mood: activeMood,
        weather: weather
          ? {
              temperature: forecast?.high ?? weather.temperature,
              rain: forecast?.rain ?? weather.rain,
            }
          : null,
        date,
        variant: daily ? 0 : ++variant.current,
        useAI: useAI && connections.ai,
      });
      if (request !== requestVersion.current) return;
      setResult(r);
      setSelection(r.pieces);
      setMood(activeMood);
    } catch (e) {
      notify(e.message);
    } finally {
      if (request === requestVersion.current) setPairing(false);
    }
  };
  const saveSettings = async (patch) => {
    const settings = await post("settings", patch, "PUT");
    setData((d) => ({ ...d, settings }));
    return settings;
  };
  useEffect(() => {
    if (!loading && view === "today")
      recommend({ daily: true, date: selectedDate });
  }, [view, selectedDate, loading, weather]);
  useEffect(() => {
    if (!document.modelContext?.registerTool) return;
    const control = new AbortController();
    const register = (t) => {
      try {
        Promise.resolve(
          document.modelContext.registerTool(t, { signal: control.signal }),
        ).catch(() => {});
      } catch {}
    };
    register({
      name: "read_closet",
      description: "Read wardrobe clothing and saved outfits.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: () => ({
        garments: pieces,
        sample: isDemo,
        outfits: data.outfits,
      }),
    });
    register({
      name: "open_vibe_picker",
      description:
        "Open aesthetic preferences for an outfit mood. Does not save changes.",
      inputSchema: {
        type: "object",
        properties: { mood: { type: "string", enum: MOODS.map((m) => m.id) } },
        required: ["mood"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: (input) => {
        if (!MOODS.some((m) => m.id === input?.mood))
          throw Error("Invalid mood");
        setMood(input.mood);
        setView("vibes");
        return { view: "vibes", mood: input.mood };
      },
    });
    return () => control.abort();
  }, [pieces, data.outfits, isDemo]);
  const nav = [
    ["closet", "My closet", Hanger],
    ["vibes", "My vibes", Heart],
    ["outfits", "My outfits", Bookmark],
    ["today", "For today", CloudSun],
    ["calendar", "My calendar", CalendarDays],
  ];
  const filtered = pieces.filter(
    (p) =>
      (filter === "all" || p.category === filter) &&
      (subfilter === "all" || p.subtype === subfilter) &&
      p.name.toLowerCase().includes(query.toLowerCase()),
  );
  const activeVibes = data.settings.vibes?.[mood] ?? DEFAULT_VIBES[mood] ?? [];
  const weatherLabel = weather
    ? `${Math.round((weather.temperature * 9) / 5 + 32)}°F · ${weather.description}`
    : "Philadelphia forecast";
  const stage = (
    <aside className="card p-5 xl:p-6 lg:sticky lg:top-6">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-leaf p-2.5 text-[#738956]">
          <Sparkles size={22} />
        </span>
        <div>
          <h2 className="text-lg font-semibold">A little outfit magic</h2>
          <p className="mt-1 text-xs text-muted">
            Your clothes. Your kind of cute.
          </p>
        </div>
      </div>
      <div className="my-5 border-t border-line" />
      <p className="eyebrow mb-3">What's the mood?</p>
      <select
        className="input"
        aria-label="Outfit mood"
        value={mood}
        onChange={(e) => {
          setMood(e.target.value);
          setResult(null);
        }}
      >
        {MOODS.map((m) => (
          <option value={m.id} key={m.id}>
            {m.label}
          </option>
        ))}
      </select>
      <div className="my-3 flex flex-wrap items-center gap-1.5">
        {activeVibes.map((v) => (
          <span
            key={v}
            className="rounded-full bg-rose px-2.5 py-1 text-xs text-[#936b79]"
          >
            {AESTHETICS.find((a) => a.id === v)?.name}
          </span>
        ))}
        <button className="link ml-1 text-xs" onClick={() => go("vibes")}>
          Edit vibes
        </button>
      </div>
      <div
        ref={stageRef}
        className="fit-stage relative min-h-[260px] rounded-xl border border-dashed border-[#cbd5bd] p-4"
      >
        <p className="eyebrow text-[11px]">The fit check</p>
        {selection.length ? (
          <div className="grid grid-cols-2 gap-2 pt-4">
            {selection.map((id) => {
              const p = find(id);
              return (
                p && (
                  <div key={id} className="relative">
                    <div className="aspect-square">
                      <Art piece={p} />
                    </div>
                    <button
                      className="absolute right-0 top-0 rounded-full bg-white p-1 shadow-sm"
                      aria-label={`Remove ${p.name}`}
                      onClick={() => choose(id)}
                    >
                      <X size={14} />
                    </button>
                    <p className="truncate text-center text-xs text-muted">
                      {p.name}
                    </p>
                  </div>
                )
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center">
            <Hanger size={46} className="mx-auto text-[#bdc9ad]" />
            <h3 className="mt-5 text-base font-medium">
              Good things go together.
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Pull a piece off the rail,
              <br />
              or find a new favorite pairing.
            </p>
          </div>
        )}
        <p className="mt-4 flex items-center justify-center gap-1 text-xs text-[#94a084]">
          <Plus size={12} />
          Drop a piece here
        </p>
      </div>
      {result && (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">{result.title}</h3>
            <span className="shrink-0 rounded bg-leaf px-2 py-1 text-[11px]">
              {result.engine === "ai" ? "AI styled" : "Style theory"}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {result.reason}
          </p>
          <button
            className="link mt-2 text-xs"
            onClick={() => setModal({ type: "theory" })}
          >
            Why these work together
          </button>
        </div>
      )}
      <label className="my-4 flex items-center justify-between gap-2 text-xs text-muted">
        <span>
          Use AI stylist {connections.ai ? "" : "· connection needed"}
        </span>
        <input
          type="checkbox"
          checked={useAI && connections.ai}
          onChange={(e) => {
            if (!connections.ai) {
              go("settings");
              return;
            }
            setUseAI(e.target.checked);
          }}
          aria-label="Use AI stylist"
          className="accent-[#314b38]"
        />
      </label>
      <Button
        primary
        className="w-full"
        disabled={pairing || loading}
        onClick={() => recommend()}
      >
        {pairing ? (
          <Busy label="Styling your look…" />
        ) : (
          <>
            <Sparkles size={17} />
            {result ? "Find another pairing" : "Find my pairing"}
          </>
        )}
      </Button>
      <div className="mt-4 flex items-center justify-between text-sm">
        <button
          className="text-muted"
          onClick={() => {
            setSelection([]);
            setResult(null);
          }}
        >
          Start fresh
        </button>
        <button
          className="flex items-center gap-1.5 text-muted disabled:opacity-40"
          disabled={
            !selection.some((id) => find(id)?.category === "tops") ||
            !selection.some((id) => find(id)?.category === "bottoms")
          }
          onClick={() => setModal({ type: "save" })}
        >
          <Bookmark size={14} />
          Save outfit
        </button>
      </div>
    </aside>
  );
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[215px] flex-col border-r border-line bg-white px-5 py-8 lg:flex">
        <a
          href="/"
          className="flex items-center gap-2.5 px-2 text-[34px] font-semibold tracking-[-2px]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink pb-1 pr-1 font-serif text-[36px] font-normal italic text-white">
            f.
          </span>
          form<span className="self-start pt-1 text-xs tracking-normal">®</span>
        </a>
        <p className="eyebrow mt-6 px-2 text-[10px] tracking-[.1em]">
          YOUR EVERYDAY, STYLED
        </p>
        <nav className="mt-10 space-y-1.5" aria-label="Main navigation">
          {nav.map(([v, label, Icon]) => (
            <button
              key={v}
              onClick={() => go(v)}
              className={cx("nav-item w-full", view === v && "nav-active")}
            >
              <Icon size={20} />
              {label}
              {v === "closet" && (
                <span className="ml-auto rounded bg-[#dfe8d1] px-1.5 py-.5 text-xs">
                  {pieces.length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="mt-auto">
          <div className="mx-3 my-7">
            <Sparkles size={21} className="text-[#9eaf86]" />
            <p className="mt-3 text-sm leading-relaxed text-[#99a28e]">
              A little less deciding.
              <br />A little more you.
            </p>
          </div>
          <button
            className={cx(
              "nav-item w-full",
              view === "settings" && "nav-active",
            )}
            onClick={() => go("settings")}
          >
            <Settings2 size={20} />
            Connections
          </button>
          <button
            className="mt-5 flex w-full items-center gap-3 border-t border-line pt-5 text-left"
            onClick={() => setModal({ type: "account" })}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose text-sm text-[#a16b7c]">
              {(data.user?.name || data.user?.email || "F")
                .slice(0, 1)
                .toUpperCase()}
            </span>
            <span className="min-w-0">
              <strong className="block truncate text-sm font-medium">
                {data.user?.name?.split(" ")[0] || "Your closet"}
              </strong>
              <span className="block truncate text-xs text-muted">
                Private, just for you
              </span>
            </span>
          </button>
        </div>
      </aside>
      <div className="lg:ml-[215px]">
        <header className="flex h-[74px] items-center justify-between border-b border-line bg-white/70 px-5 text-sm md:px-9">
          <p className="text-muted">
            Your wardrobe <span className="mx-2 text-[#c3cbb8]">/</span>
            <span className="text-ink">
              {nav.find((n) => n[0] === view)?.[1] || "Connections"}
            </span>
          </p>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 text-xs text-muted sm:flex">
              <LockKeyhole size={13} />
              Private closet
            </span>
            <button
              className="icon-btn"
              onClick={() => go("settings")}
              aria-label="Connections"
            >
              <Settings2 size={19} />
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-[1560px] px-4 pb-28 pt-7 sm:px-7 md:px-9 lg:pb-10">
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              {error}{" "}
              <button className="underline" onClick={() => location.reload()}>
                Reload
              </button>
            </div>
          )}
          {view === "closet" && (
            <>
              <div className="mb-7 flex flex-wrap items-center justify-between gap-5">
                <div>
                  <p className="eyebrow">GOOD STYLE STARTS HERE</p>
                  <h1 className="mt-3 text-4xl font-medium tracking-[-1.5px] sm:text-[42px]">
                    Your closet. More you.
                  </h1>
                  <p className="mt-3 text-sm text-muted sm:text-base">
                    Cute combinations, hiding in plain sight.
                  </p>
                </div>
                <Button primary onClick={() => setModal({ type: "upload" })}>
                  <Plus size={18} />
                  Add clothing
                </Button>
              </div>
              <div className="mb-8 flex flex-wrap items-center gap-4 rounded-xl border border-[#e1e6d6] bg-[#edf2e4] p-5">
                <span className="rounded-full bg-[#e2ebd3] p-3 text-[#7b905d]">
                  <CloudSun size={28} />
                </span>
                <div className="min-w-[180px] flex-1">
                  <p className="eyebrow text-[11px]">
                    {loc.name} · your daily edit
                  </p>
                  <h2 className="mt-1.5 text-lg font-medium">{weatherLabel}</h2>
                  <p className="mt-1 text-sm text-[#899777]">
                    From Locust Walk to your last plan of the day.
                  </p>
                </div>
                <Button
                  onClick={() => go("today")}
                  className="border-[#bdcba8] bg-transparent"
                >
                  Style my day
                  <Sparkles size={16} />
                </Button>
              </div>
              <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
                <section>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="section-title">
                        Your wardrobe{" "}
                        <span className="ml-2 rounded bg-leaf px-2 py-1 text-xs font-normal">
                          {pieces.length}
                        </span>
                      </h2>
                      <p className="mt-2 text-sm text-muted">
                        {loading
                          ? "Opening your closet…"
                          : isDemo
                            ? "A cute sample rail. Add your own pieces to make it yours."
                            : "All your pieces, with a little more possibility."}
                      </p>
                    </div>
                    <div className="flex rounded-lg border border-line bg-white p-1">
                      <button
                        className={cx("rounded p-2", !grid && "bg-leaf")}
                        aria-label="Hanger view"
                        onClick={() => setGrid(false)}
                      >
                        <Hanger size={17} />
                      </button>
                      <button
                        className={cx("rounded p-2", grid && "bg-leaf")}
                        aria-label="Grid view"
                        onClick={() => setGrid(true)}
                      >
                        <LayoutGrid size={17} />
                      </button>
                    </div>
                  </div>
                  <div className="my-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1">
                      {["all", "tops", "bottoms", "layers"].map((f) => (
                        <button
                          key={f}
                          className={cx(
                            "rounded-lg px-3 py-2 text-sm",
                            filter === f
                              ? "bg-ink text-white"
                              : "text-muted hover:bg-leaf",
                          )}
                          onClick={() => {
                            setFilter(f);
                            setSubfilter("all");
                          }}
                        >
                          {f === "all" ? "All pieces" : title(f)}
                        </button>
                      ))}
                    </div>
                    <label className="flex w-40 items-center gap-2 rounded-lg border border-line bg-white px-3 py-2">
                      <Search size={15} className="text-muted" />
                      <input
                        aria-label="Find a piece"
                        placeholder="Find a piece"
                        className="min-w-0 w-full bg-transparent text-xs outline-none"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>
                  </div>
                  {filter !== "all" && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      <button
                        className={cx(
                          "chip text-xs",
                          subfilter === "all" && "chip-selected",
                        )}
                        onClick={() => setSubfilter("all")}
                      >
                        All {filter}
                      </button>
                      {TYPES[filter].map((s) => (
                        <button
                          key={s}
                          className={cx(
                            "chip text-xs",
                            subfilter === s && "chip-selected",
                          )}
                          onClick={() => setSubfilter(s)}
                        >
                          {LABELS[s]}
                        </button>
                      ))}
                    </div>
                  )}
                  {filtered.length ? (
                    <div className="hanger-grid">
                      {filtered.map((p) => (
                        <GarmentTile
                          key={p.id}
                          piece={p}
                          selected={selection.includes(p.id)}
                          onSelect={choose}
                          onDetails={(piece) =>
                            setModal({ type: "details", piece })
                          }
                          stageRef={stageRef}
                          grid={grid}
                        />
                      ))}
                    </div>
                  ) : (
                    <Empty title="A little room for something new.">
                      No pieces match this filter.
                    </Empty>
                  )}
                  <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted">
                    <Hanger size={14} />
                    Pull a piece off its hanger, or tap to add it to your look.
                  </p>
                </section>
                {stage}
              </div>
            </>
          )}
          {view === "vibes" && (
            <Vibes
              mood={mood}
              setMood={setMood}
              settings={data.settings}
              saveSettings={saveSettings}
              notify={notify}
            />
          )}
          {view === "outfits" && (
            <>
              <PageHeading
                eyebrow="GOOD COMBINATIONS, KEPT"
                title="Your outfit collection."
                subtitle="The looks you love, ready for a repeat."
                action={
                  <Button primary onClick={() => go("closet")}>
                    <Plus size={17} />
                    Build an outfit
                  </Button>
                }
              />
              {data.outfits.length ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {data.outfits.map((o) => (
                    <article key={o.id} className="card overflow-hidden">
                      <div className="outfit-art bg-[#eef2e7] p-6">
                        {o.pieces.map((id) => (
                          <Art key={id} piece={find(id)} />
                        ))}
                      </div>
                      <div className="p-5">
                        <h2 className="text-lg font-semibold">{o.name}</h2>
                        <p className="mt-2 text-sm text-muted">
                          {MOODS.find((m) => m.id === o.mood)?.label}
                          {o.pieces.some((id) => /^(demo|sample)-/.test(id))
                            ? " · Sample pieces"
                            : ""}
                        </p>
                        <div className="mt-5 flex justify-between">
                          <Button
                            onClick={() => {
                              setSelection(o.pieces);
                              setMood(o.mood);
                              setResult(null);
                              go("closet");
                            }}
                          >
                            Try this look
                          </Button>
                          <button
                            className="icon-btn"
                            aria-label={`Delete ${o.name}`}
                            onClick={() =>
                              setModal({ type: "deleteOutfit", outfit: o })
                            }
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <Empty icon={Bookmark} title="Your next favorite starts here.">
                  Save a pairing from your closet to keep it for another day.
                </Empty>
              )}
            </>
          )}
          {view === "today" && (
            <>
              <PageHeading
                eyebrow="A LITTLE LESS DECIDING"
                title="Made for your day."
                subtitle="Your plans, the forecast, and your favorite version of you."
                action={
                  <Button onClick={() => setModal({ type: "location" })}>
                    <MapPin size={16} />
                    {loc.name}
                  </Button>
                }
              />
              <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
                {Array.from({ length: 7 }, (_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() + i);
                  const key = dayKey(d);
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDate(key)}
                      className={cx(
                        "min-w-[64px] rounded-lg border px-4 py-2.5 text-xs",
                        selectedDate === key
                          ? "border-ink bg-ink text-white"
                          : "border-line bg-white text-muted",
                      )}
                    >
                      {d.toLocaleDateString(undefined, { weekday: "short" })}
                      <b className="mt-1.5 block text-xl font-medium">
                        {d.getDate()}
                      </b>
                    </button>
                  );
                })}
              </div>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,1fr)]">
                <div>
                  <Weather
                    weather={weather}
                    error={weatherError}
                    location={loc}
                    date={selectedDate}
                    refresh={loadWeather}
                  />
                  <div className="card mt-5 p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="eyebrow">
                          {MOODS.find((m) => m.id === mood)?.label}
                          {isDemo ? " · sample look" : ""}
                        </p>
                        <h2 className="mt-2 text-2xl font-medium">
                          {pairing
                            ? "Finding your kind of cute…"
                            : result?.title || "Your daily pairing"}
                        </h2>
                      </div>
                      <button
                        className="icon-btn"
                        aria-label="Refresh pairing"
                        onClick={() => recommend()}
                        disabled={pairing}
                      >
                        <RefreshCw
                          size={18}
                          className={pairing ? "spinner" : ""}
                        />
                      </button>
                    </div>
                    {selection.length ? (
                      <div className="outfit-art my-5 rounded-lg bg-paper p-6 sm:min-h-[300px]">
                        {selection.map((id) => (
                          <Art key={id} piece={find(id)} />
                        ))}
                      </div>
                    ) : (
                      <p className="my-10 subtle">
                        {pairing
                          ? "Matching your wardrobe to the day ahead."
                          : "Add a top and bottom to get started."}
                      </p>
                    )}
                    {result && (
                      <>
                        <p className="subtle">{result.reason}</p>
                        <p className="mt-3 text-sm text-[#6f815d]">
                          {result.tips}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {result.details?.map((d) => (
                            <span
                              key={d.label}
                              className="rounded-full bg-leaf px-3 py-1.5 text-xs"
                            >
                              {d.label}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button onClick={() => go("closet")}>Make it mine</Button>
                      <Button
                        primary
                        disabled={selection.length < 2}
                        onClick={() =>
                          setModal({ type: "save", date: selectedDate })
                        }
                      >
                        <Bookmark size={16} />
                        Save this look
                      </Button>
                    </div>
                  </div>
                </div>
                <aside className="card self-start p-6">
                  <h2 className="text-xl font-semibold">On the agenda</h2>
                  <p className="mt-2 text-xs text-muted">
                    {connections.google.connected
                      ? "Google Calendar connected"
                      : "Add plans to style around your day"}
                  </p>
                  <Agenda
                    events={data.events.filter(
                      (e) => dayKey(new Date(e.start)) === selectedDate,
                    )}
                  />
                  <Button
                    className="mt-5 w-full"
                    onClick={() => go("calendar")}
                  >
                    My calendar
                  </Button>
                  <div className="mt-6 border-t border-line pt-5">
                    <p className="eyebrow mb-3">Today's mood</p>
                    <select
                      className="input"
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                    >
                      {MOODS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <button className="link mt-3" onClick={() => recommend()}>
                      Style for this mood
                    </button>
                  </div>
                </aside>
              </div>
            </>
          )}
          {view === "calendar" && (
            <CalendarView
              events={data.events}
              google={connections.google}
              connect={() => setModal({ type: "google" })}
              add={() => setModal({ type: "event" })}
              importFile={() => setModal({ type: "import" })}
              sync={async () => {
                try {
                  const g = await post("google/sync", {});
                  setConnections((c) => ({ ...c, google: g }));
                  await refreshData();
                  notify(
                    `Synced ${g.count} plans${g.skipped ? `; ${g.skipped} unsupported or past events skipped` : ""}.`,
                  );
                } catch (e) {
                  notify(e.message);
                }
              }}
              remove={(event) => setModal({ type: "deleteEvent", event })}
            />
          )}
          {view === "settings" && (
            <SettingsView
              connections={connections}
              weather={weather}
              weatherError={weatherError}
              location={loc}
              connectGoogle={() => setModal({ type: "google" })}
              connectAI={() => setModal({ type: "ai" })}
              editLocation={() => setModal({ type: "location" })}
              disconnect={async (type) => {
                try {
                  await api(type + "/connect", { method: "DELETE" });
                  await refreshConnections();
                  await refreshData();
                  notify("Disconnected.");
                } catch (e) {
                  notify(e.message);
                }
              }}
            />
          )}
          <footer className="mt-9 flex flex-wrap justify-between gap-3 border-t border-line pt-5 text-xs text-[#9ca690]">
            <span>Less “nothing to wear.” More you.</span>
            <span>A closet for your everyday ✳</span>
          </footer>
        </main>
      </div>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-line bg-white px-1 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 lg:hidden"
        aria-label="Mobile navigation"
      >
        {nav.map(([v, label, Icon]) => (
          <button
            key={v}
            onClick={() => go(v)}
            className={cx(
              "flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-lg px-1 py-2 text-[11px]",
              view === v ? "bg-leaf text-ink" : "text-muted",
            )}
          >
            <Icon size={19} />
            {label.replace("My ", "")}
          </button>
        ))}
      </nav>
      {message && (
        <div
          className="toast fixed bottom-24 left-1/2 z-[100] w-max max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-xl bg-ink px-5 py-3 text-sm leading-relaxed text-white shadow-xl lg:bottom-6"
          role="status"
        >
          {message}
        </div>
      )}
      {modal && (
        <Dialog
          heading={
            {
              upload: "One photo. We’ll take it from here.",
              save: "Keep this combination.",
              details: modal.piece?.name,
              theory: "Why this pairing works.",
              google: "Connect Google Calendar.",
              ai: "Meet your AI stylist.",
              location: "Dress for your forecast.",
              event: "What’s on the agenda?",
              import: "Bring your calendar along.",
              account: "A closet, all yours.",
              deleteOutfit: "Remove this outfit?",
              deleteEvent: "Remove this plan?",
              deletePiece: "Remove this piece?",
            }[modal.type]
          }
          kicker={modal.type === "upload" ? "PHOTO → CLOSET" : "YOUR FORM"}
          onClose={close}
        >
          {modal.type === "upload" && (
            <UploadForm
              ai={connections.ai}
              onAIConnected={refreshConnections}
              onSaved={async (p) => {
                setData((d) => ({ ...d, garments: [p, ...d.garments] }));
                setSelection((s) =>
                  s.filter((id) => !/^(demo|sample)-/.test(id)),
                );
                close();
                notify("Added to your closet. A new possibility.");
              }}
            />
          )}
          {modal.type === "save" && (
            <SaveForm
              mood={mood}
              selection={selection}
              date={modal.date}
              result={result}
              onSaved={(o) => {
                setData((d) => ({ ...d, outfits: [o, ...d.outfits] }));
                close();
                notify("Saved. One less decision for later.");
              }}
            />
          )}
          {modal.type === "details" && (
            <>
              <div className="mx-auto mb-6 aspect-square max-w-[240px]">
                <Art piece={modal.piece} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ["Type", LABELS[modal.piece.subtype] || modal.piece.category],
                  ["Color", title(modal.piece.color)],
                  ["Pattern", title(modal.piece.pattern || "solid")],
                  ["Fit", title(modal.piece.fit || "Not set")],
                  [
                    "Moods",
                    modal.piece.moods
                      .map((m) => MOODS.find((x) => x.id === m)?.label)
                      .join(", "),
                  ],
                  [
                    "Warmth",
                    ["", "Light", "Everyday", "Cozy"][modal.piece.warmth] +
                      " (estimated)",
                  ],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="mb-1 text-xs text-muted">{k}</p>
                    <p>{v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between gap-3">
                {modal.piece.atlas === undefined ? (
                  <button
                    className="text-sm text-[#a16565]"
                    onClick={() =>
                      setModal({ type: "deletePiece", piece: modal.piece })
                    }
                  >
                    Remove piece
                  </button>
                ) : (
                  <span className="text-xs text-muted">Sample piece</span>
                )}
                <Button
                  primary
                  onClick={() => {
                    choose(modal.piece.id, true);
                    close();
                    go("closet");
                  }}
                >
                  Add to outfit
                </Button>
              </div>
            </>
          )}
          {modal.type === "theory" && (
            <div className="space-y-5">
              {result?.details?.map((d) => (
                <div key={d.label}>
                  <h3 className="font-medium">{d.label}</h3>
                  <p className="subtle mt-1">{d.why}</p>
                </div>
              ))}
              <p className="subtle">
                These are starting points, not rules about what you can wear.
                Your taste comes first.
              </p>
              <div className="border-t border-line pt-4">
                <p className="eyebrow mb-3">Style reading</p>
                {STYLE_SOURCES.map((s) => (
                  <a
                    className="link mb-2 block"
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    key={s.url}
                  >
                    {s.title}
                  </a>
                ))}
              </div>
            </div>
          )}
          {modal.type === "ai" && (
            <AIConnect
              onConnected={async () => {
                await refreshConnections();
                close();
                notify(
                  "AI connected. Photo recognition and styling are ready.",
                );
              }}
            />
          )}
          {modal.type === "google" && (
            <GoogleConnect
              onConnected={async (g) => {
                setConnections((c) => ({ ...c, google: g }));
                await refreshData();
                close();
                notify(`Google Calendar connected. ${g.count} plans synced.`);
              }}
            />
          )}
          {modal.type === "location" && (
            <LocationForm
              current={loc}
              onSelect={async (location) => {
                await saveSettings({ location });
                close();
                notify("Forecast location updated.");
              }}
            />
          )}
          {modal.type === "event" && (
            <EventForm
              onSaved={(e) => {
                setData((d) => ({ ...d, events: [...d.events, e] }));
                close();
                notify("Plan added.");
              }}
            />
          )}
          {modal.type === "import" && (
            <ImportForm
              onImported={async (count) => {
                await refreshData();
                close();
                notify(`${count} plans imported.`);
              }}
            />
          )}
          {modal.type === "account" && (
            <>
              <p className="subtle">
                {data.user?.email
                  ? "Signed in as " + data.user.email
                  : "Sign in with ChatGPT to save your closet."}
              </p>
              <p className="subtle mt-3">
                Your photos, outfits, and style preferences stay with your
                private account.
              </p>
              <a
                className="btn mt-6"
                href={
                  data.user
                    ? "/signout-with-chatgpt?return_to=%2F"
                    : "/signin-with-chatgpt?return_to=%2F"
                }
                target="_top"
              >
                {data.user ? "Sign out" : "Sign in with ChatGPT"}
              </a>
            </>
          )}
          {modal.type.startsWith("delete") && (
            <ConfirmDelete
              type={modal.type}
              onConfirm={async () => {
                if (modal.type === "deletePiece") {
                  await api("garments/" + encodeURIComponent(modal.piece.id), {
                    method: "DELETE",
                  });
                  setSelection((s) => s.filter((id) => id !== modal.piece.id));
                }
                if (modal.type === "deleteOutfit")
                  await api("outfits/" + encodeURIComponent(modal.outfit.id), {
                    method: "DELETE",
                  });
                if (modal.type === "deleteEvent")
                  await api("events/" + encodeURIComponent(modal.event.id), {
                    method: "DELETE",
                  });
                await refreshData();
                close();
                notify("Removed.");
              }}
              onCancel={close}
            />
          )}
        </Dialog>
      )}
    </div>
  );
}

function PageHeading({ eyebrow, title: heading, subtitle, action }) {
  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-5">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-medium tracking-[-1.5px]">
          {heading}
        </h1>
        <p className="mt-3 text-sm text-muted sm:text-base">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
function Vibes({ mood, setMood, settings, saveSettings, notify }) {
  const [busy, setBusy] = useState(false);
  const selected = settings.vibes?.[mood] ?? DEFAULT_VIBES[mood] ?? [];
  const toggle = async (id) => {
    let next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    if (next.length > 3)
      return notify("Choose up to three vibes for each mood.");
    setBusy(true);
    try {
      await saveSettings({ vibes: { [mood]: next } });
      notify("Your vibe is saved.");
    } catch (e) {
      notify(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeading
        eyebrow="A LITTLE MOODBOARD MOMENT"
        title="What feels like you?"
        subtitle="Different plans, different energy. Pick up to three vibes for each mood."
      />
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {MOODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMood(m.id)}
            className={cx("chip shrink-0", mood === m.id && "chip-selected")}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          For{" "}
          <strong className="font-medium text-ink">
            {MOODS.find((m) => m.id === mood)?.label.toLowerCase()}
          </strong>
          , your vibe is{" "}
          {selected
            .map((id) =>
              AESTHETICS.find((a) => a.id === id)?.name.toLowerCase(),
            )
            .join(" + ") || "open to anything"}
          .
        </p>
        <span className="text-xs text-muted">
          {selected.length} / 3 selected
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        {AESTHETICS.map((a) => (
          <article
            key={a.id}
            className={cx(
              "overflow-hidden rounded-xl border-2 bg-white transition",
              selected.includes(a.id)
                ? "border-[#7e9369]"
                : "border-transparent shadow-sm",
            )}
          >
            <button
              className="relative block w-full text-left"
              aria-pressed={selected.includes(a.id)}
              disabled={busy}
              onClick={() => toggle(a.id)}
            >
              <VibeArt index={a.image} />
              <span
                className={cx(
                  "absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border shadow-sm",
                  selected.includes(a.id)
                    ? "border-ink bg-ink text-white"
                    : "border-white bg-white/90",
                )}
              >
                {selected.includes(a.id) ? (
                  <Check size={15} />
                ) : (
                  <Plus size={15} />
                )}
              </span>
              <div className="p-4 sm:p-5">
                <h2 className="text-base font-semibold sm:text-lg">{a.name}</h2>
                <p className="mt-1.5 text-xs leading-relaxed text-muted sm:text-sm">
                  {a.sub}
                </p>
                <div className="mt-3 flex gap-1.5">
                  {a.colors.map((c) => (
                    <span
                      key={c}
                      className="h-4 w-4 rounded-full border border-black/10"
                      style={{ background: COLORS[c] }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </button>
            <div className="flex items-center justify-between border-t border-line px-4 py-3 sm:px-5">
              <a
                href={a.pinterest}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-[#9c5968]"
              >
                Explore on Pinterest
                <ExternalLink size={12} />
              </a>
              <span className="hidden text-[11px] text-muted sm:block">
                Outfit inspiration
              </span>
            </div>
          </article>
        ))}
      </div>
      <div className="card mt-6 flex items-center justify-between gap-5 p-5">
        <div>
          <h3 className="text-base font-medium">A little print mixing?</h3>
          <p className="subtle mt-1">
            Favor shared-color prints over the quieter one-print-and-solid
            approach.
          </p>
        </div>
        <input
          aria-label="Allow bolder print mixing"
          type="checkbox"
          className="h-5 w-5 shrink-0 accent-[#314b38]"
          checked={!!settings.boldPatterns}
          onChange={async (e) => {
            try {
              await saveSettings({ boldPatterns: e.target.checked });
            } catch (err) {
              notify(err.message);
            }
          }}
        />
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Original illustrative moodboards, with links to explore each aesthetic
        on Pinterest. Selected vibes guide your pairings; Pinterest activity is
        not synced.
      </p>
    </>
  );
}

function Weather({ weather, error, location, date, refresh }) {
  const d = weather?.days?.find((d) => d.date === date);
  const temp = d?.high ?? weather?.temperature,
    rain = d?.rain ?? weather?.rain;
  const Icon = rain > 30 ? CloudRain : Sun;
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#dee7d1] bg-[#edf2e3] p-6">
      <div>
        <p className="eyebrow">{location.name} · forecast</p>
        {weather ? (
          <>
            <h2 className="mt-2 text-4xl font-medium">
              {Math.round((temp * 9) / 5 + 32)}°F
              {d && (
                <span className="ml-2 text-lg text-[#8d9c7a]">
                  / {Math.round((d.low * 9) / 5 + 32)}°
                </span>
              )}
            </h2>
            <p className="mt-2 text-sm text-[#7f8f6b]">
              {d?.description || weather.description} · {Math.round(rain)}% rain
            </p>
            <p className="mt-2 text-xs text-[#899777]">
              Live forecast · Open-Meteo
            </p>
          </>
        ) : (
          <>
            <p className="my-3 subtle">{error || "Loading live weather…"}</p>
            {error && (
              <button className="link" onClick={refresh}>
                Try again
              </button>
            )}
          </>
        )}
      </div>
      <Icon size={55} strokeWidth={1} className="shrink-0 text-[#93a772]" />
    </div>
  );
}
function Agenda({ events }) {
  return (
    <div className="mt-5">
      {events.length ? (
        [...events]
          .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
          .map((e) => (
            <div
              key={e.id}
              className="my-5 border-l-2 border-[#b7c99d] py-1 pl-4"
            >
              <h3 className="text-sm font-medium tracking-normal">{e.title}</h3>
              <p className="mt-2 text-xs text-muted">
                {new Date(e.start).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}{" "}
                · {MOODS.find((m) => m.id === e.mood)?.label}
              </p>
            </div>
          ))
      ) : (
        <p className="subtle">
          A little room for spontaneity. Add a plan to style around your
          schedule.
        </p>
      )}
    </div>
  );
}
function CalendarView({
  events,
  google,
  connect,
  add,
  importFile,
  sync,
  remove,
}) {
  const [busy, setBusy] = useState(false);
  return (
    <>
      <PageHeading
        eyebrow="STYLE AROUND YOUR LIFE"
        title="Your day, considered."
        subtitle="From the first lecture to the last plan."
        action={
          <Button primary onClick={add}>
            <Plus size={17} />
            Add a plan
          </Button>
        }
      />
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-line bg-white p-5">
        <span className="rounded-xl bg-leaf p-3">
          <CalendarDays size={23} />
        </span>
        <div className="flex-1">
          <h2 className="font-medium">Google Calendar</h2>
          <p className="mt-1 text-sm text-muted">
            {google.connected
              ? `Connected · refreshed ${new Date(google.lastSync).toLocaleString()}`
              : "Read-only calendar connection for daily styling."}
          </p>
        </div>
        <Button
          onClick={
            google.connected
              ? async () => {
                  setBusy(true);
                  try {
                    await sync();
                  } finally {
                    setBusy(false);
                  }
                }
              : connect
          }
          disabled={busy}
        >
          {busy ? (
            <Busy label="Syncing…" />
          ) : google.connected ? (
            <>
              <RefreshCw size={15} />
              Refresh
            </>
          ) : (
            "Connect calendar"
          )}
        </Button>
        <button className="link" onClick={importFile}>
          Import .ics
        </button>
      </div>
      {events.length ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper text-xs text-muted">
                <tr>
                  <th className="px-5 py-4 font-medium">PLAN</th>
                  <th className="px-5 py-4 font-medium">WHEN</th>
                  <th className="px-5 py-4 font-medium">MOOD</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {[...events]
                  .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
                  .map((e) => (
                    <tr key={e.id} className="border-t border-line">
                      <td className="min-w-[180px] px-5 py-4">
                        {e.title}
                        {e.id.startsWith("gcal-") && (
                          <span className="mt-1 block text-xs text-muted">
                            Google Calendar
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        {new Date(e.start).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                        <span className="mt-1 block text-xs text-muted">
                          {new Date(e.start).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="whitespace-nowrap rounded-full bg-leaf px-2.5 py-1 text-xs">
                          {MOODS.find((m) => m.id === e.mood)?.label}
                        </span>
                      </td>
                      <td className="pr-3">
                        {!e.id.startsWith("gcal-") && (
                          <button
                            className="icon-btn"
                            onClick={() => remove(e)}
                            aria-label={`Remove ${e.title}`}
                          >
                            <X size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <Empty icon={CalendarDays} title="A day worth dressing for.">
          Connect your calendar or add a plan. We’ll take the outfit from there.
        </Empty>
      )}
    </>
  );
}
function SettingsView({
  connections,
  weather,
  weatherError,
  location,
  connectGoogle,
  connectAI,
  editLocation,
  disconnect,
}) {
  return (
    <>
      <PageHeading
        eyebrow="ALL THE LITTLE DETAILS"
        title="Make it yours."
        subtitle="Connect your day, your weather, and a little outfit intelligence."
      />
      <div className="grid gap-5 xl:grid-cols-3">
        {[
          {
            title: "Live weather",
            icon: CloudSun,
            connected: !!weather,
            description: weather
              ? `${location.name} · ${Math.round((weather.temperature * 9) / 5 + 32)}°F`
              : weatherError || "Loading forecast…",
            action: "Change location",
            run: editLocation,
          },
          {
            title: "Google Calendar",
            icon: CalendarDays,
            connected: connections.google.connected,
            description: connections.google.connected
              ? "Your private feed refreshes when you open Form."
              : "Connect a private, read-only feed to style around your plans.",
            action: connections.google.connected
              ? "Reconnect calendar"
              : "Connect calendar",
            run: connectGoogle,
            type: "google",
          },
          {
            title: "AI stylist",
            icon: Sparkles,
            connected: connections.ai,
            description: connections.ai
              ? "Photo recognition and AI outfit advice are ready."
              : "Let AI recognize clothing photos and explain cute outfit pairings.",
            action: connections.ai ? "Update connection" : "Connect AI",
            run: connectAI,
            type: "ai",
          },
        ].map((c) => (
          <section className="card flex flex-col p-6" key={c.title}>
            <c.icon size={28} className="mb-5 text-[#8a9d70]" />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold">{c.title}</h2>
              <span
                className={cx(
                  "rounded-full px-2.5 py-1 text-xs",
                  c.connected ? "bg-leaf" : "bg-paper text-muted",
                )}
              >
                {c.connected ? "Connected" : "Not connected"}
              </span>
            </div>
            <p className="subtle my-4 flex-1">{c.description}</p>
            <Button onClick={c.run}>{c.action}</Button>
            {c.type && c.connected && (
              <button
                className="mt-4 flex items-center justify-center gap-2 text-xs text-muted"
                onClick={() => disconnect(c.type)}
              >
                <Unplug size={13} />
                Disconnect
              </button>
            )}
          </section>
        ))}
      </div>
      <div className="card mt-6 p-6">
        <h2 className="text-lg font-semibold">
          Thoughtful styling, with room to play.
        </h2>
        <p className="subtle mt-3">
          Form considers color harmony, pattern balance, garment proportions,
          and your saved vibes. AI suggestions can be edited, and warmth is
          always an estimate. No rules about your body—just more ways to enjoy
          your clothes.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          {STYLE_SOURCES.map((s) => (
            <a
              key={s.url}
              href={s.url}
              className="link text-xs"
              target="_blank"
              rel="noreferrer"
            >
              {s.title}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

async function preparePhoto(file) {
  if (file.size > 25 * 1024 * 1024)
    throw Error("Choose a photo smaller than 25 MB.");
  const img = await createImageBitmap(file).catch(() => {
    throw Error("Use a JPG, PNG, or WebP photo.");
  });
  const ratio = Math.min(1, 1400 / Math.max(img.width, img.height)),
    canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * ratio);
  canvas.height = Math.round(img.height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  img.close();
  const image = canvas.toDataURL("image/jpeg", 0.87);
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.87),
  );
  if (!blob) throw Error("This photo could not be prepared. Try another.");
  return { image, blob };
}
function UploadForm({ ai, onAIConnected, onSaved }) {
  const [photo, setPhoto] = useState(null),
    [scan, setScan] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [details, setDetails] = useState(null),
    [note, setNote] = useState(""),
    [connect, setConnect] = useState(false);
  const input = useRef(),
    camera = useRef(),
    scanVersion = useRef(0);
  const analyze = async (p) => {
    const version = ++scanVersion.current;
    setScan(true);
    setError("");
    try {
      const d = await post("analyze", { image: p.image });
      if (version !== scanVersion.current) return;
      setDetails(d);
      setNote(d.note);
      setConnect(false);
    } catch (e) {
      if (version === scanVersion.current) setError(e.message);
    } finally {
      if (version === scanVersion.current) setScan(false);
    }
  };
  const pick = async (file) => {
    if (!file) return;
    setError("");
    setDetails(null);
    setNote("");
    try {
      const p = await preparePhoto(file);
      setPhoto(p);
      if (ai) await analyze(p);
    } catch (e) {
      setError(e.message);
    }
  };
  const update = (key, value) => setDetails((d) => ({ ...d, [key]: value }));
  const manual = () => {
    setDetails({
      name: "",
      category: "tops",
      subtype: "short-sleeve",
      color: "white",
      pattern: "solid",
      fit: "regular",
      length: "regular",
      warmth: 2,
      moods: ["casual"],
      vibes: [],
      secondaryColors: [],
    });
    setNote("Add details yourself, or connect AI to recognize the photo.");
  };
  return (
    <div>
      <div className="rounded-xl border border-dashed border-[#bdcbaa] bg-paper p-6 text-center">
        {photo ? (
          <img
            src={photo.image}
            className="mx-auto mb-4 max-h-52 rounded-lg object-contain"
            alt="Your clothing photo"
          />
        ) : (
          <ImagePlus size={40} className="mx-auto mb-4 text-[#95a47f]" />
        )}
        <h3 className="text-lg font-medium">
          {scan
            ? "Getting to know your piece…"
            : photo
              ? "A new piece of possibility."
              : "Show us your piece."}
        </h3>
        <p className="subtle mx-auto mt-2 max-w-sm">
          One garment, a plain background, and good light. AI will suggest the
          details for you to review.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button onClick={() => input.current.click()} disabled={scan}>
            <Plus size={16} />
            {photo ? "Change photo" : "Choose photo"}
          </Button>
          <Button onClick={() => camera.current.click()} disabled={scan}>
            <Camera size={16} />
            Take a photo
          </Button>
        </div>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => pick(e.target.files[0])}
        />
        <input
          ref={camera}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => pick(e.target.files[0])}
        />
      </div>
      {scan && (
        <p className="my-5 text-center text-sm text-muted">
          <Busy label="Reading color, shape, and little details…" />
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="my-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {photo && !ai && !details && (
        <div className="mt-5 rounded-xl border border-line p-5">
          <h3 className="font-medium">
            Connect AI once, skip the labels next time.
          </h3>
          <p className="subtle mt-2">
            Photo recognition needs an AI connection. Your photo stays here
            while you connect.
          </p>
          {connect ? (
            <div className="mt-4">
              <AIConnect
                onConnected={async () => {
                  await onAIConnected();
                  setConnect(false);
                  await analyze(photo);
                }}
              />
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Button primary onClick={() => setConnect(true)}>
                <Sparkles size={15} />
                Connect AI
              </Button>
              <button className="link" onClick={manual}>
                Enter details myself
              </button>
            </div>
          )}
        </div>
      )}
      {photo && ai && !scan && !details && (
        <div className="mt-4 flex items-center gap-4">
          <Button onClick={() => analyze(photo)}>Try recognition again</Button>
          <button className="link" onClick={manual}>
            Enter details myself
          </button>
        </div>
      )}
      {details && (
        <form
          className="mt-6 space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!details.moods.length)
              return setError("Choose at least one suitable mood.");
            setSaving(true);
            setError("");
            try {
              const f = new FormData();
              f.set("photo", photo.blob, "clothing.jpg");
              ["name", "category", "color", "warmth"].forEach((k) =>
                f.set(k, String(details[k])),
              );
              f.set("moods", JSON.stringify(details.moods));
              f.set(
                "attributes",
                JSON.stringify(
                  Object.fromEntries(
                    [
                      "subtype",
                      "pattern",
                      "fit",
                      "length",
                      "vibes",
                      "secondaryColors",
                    ].map((k) => [k, details[k]]),
                  ),
                ),
              );
              await onSaved(await api("garments", { method: "POST", body: f }));
            } catch (e) {
              setError(e.message);
            } finally {
              setSaving(false);
            }
          }}
        >
          <div className="rounded-lg bg-leaf p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Sparkles size={16} />
              {details.confidence
                ? "Identified. A quick fit check?"
                : "Your piece, your details."}
            </p>
            <p className="subtle mt-2">
              {note || "Review the suggested details before saving."}
            </p>
            {details.confidence === "low" && (
              <p className="mt-2 text-sm font-medium">
                Some details were unclear. Please check these suggestions.
              </p>
            )}
          </div>
          <label className="field">
            Name
            <input
              className="input"
              value={details.name}
              required
              maxLength={80}
              onChange={(e) => update("name", e.target.value)}
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={details.category}
              onChange={(v) =>
                setDetails((d) => ({ ...d, category: v, subtype: TYPES[v][0] }))
              }
              values={Object.keys(TYPES)}
            />
            <Select
              label="Type"
              value={details.subtype}
              onChange={(v) => update("subtype", v)}
              values={TYPES[details.category]}
            />
            <Select
              label="Main color"
              value={details.color}
              onChange={(v) => update("color", v)}
              values={Object.keys(COLORS)}
            />
            <Select
              label="Pattern"
              value={details.pattern}
              onChange={(v) => update("pattern", v)}
              values={PATTERNS}
            />
            <Select
              label="Fit"
              value={details.fit}
              onChange={(v) => update("fit", v)}
              values={FITS}
            />
            <Select
              label="Length"
              value={details.length}
              onChange={(v) => update("length", v)}
              values={LENGTHS}
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Good for</p>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  aria-pressed={details.moods.includes(m.id)}
                  className={cx(
                    "chip text-xs",
                    details.moods.includes(m.id) && "chip-selected",
                  )}
                  onClick={() =>
                    update(
                      "moods",
                      details.moods.includes(m.id)
                        ? details.moods.filter((x) => x !== m.id)
                        : [...details.moods, m.id],
                    )
                  }
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <Select
            label="Warmth · visual estimate"
            value={String(details.warmth)}
            onChange={(v) => update("warmth", Number(v))}
            values={[
              { id: "1", label: "Light — warm days" },
              { id: "2", label: "Everyday — mild days" },
              { id: "3", label: "Cozy — cooler days" },
            ]}
          />
          <Button primary type="submit" className="w-full" disabled={saving}>
            {saving ? (
              <Busy label="Saving your piece…" />
            ) : (
              <>
                <Check size={17} />
                Looks right. Add to closet
              </>
            )}
          </Button>
          <p className="text-xs leading-relaxed text-muted">
            You’re in control. AI suggestions can be wrong, and warmth depends
            on fabric weight.
          </p>
        </form>
      )}
    </div>
  );
}

function AIConnect({ onConnected }) {
  const [key, setKey] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          await post("ai/connect", { key });
          setKey("");
          await onConnected();
        } catch (e) {
          setError(e.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <p className="subtle">
        Connect your OpenAI API account for photo recognition and AI styling.
        API usage is billed to that account separately from ChatGPT.
      </p>
      <label className="field">
        OpenAI API key
        <input
          type="password"
          className="input"
          autoComplete="off"
          placeholder="sk-…"
          required
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
      </label>
      <p className="text-xs leading-relaxed text-muted">
        Your key is stored privately on the server and is never returned to the
        browser. Photos you analyze are sent to OpenAI.
      </p>
      <a
        className="link inline-block"
        href="https://platform.openai.com/api-keys"
        target="_blank"
        rel="noreferrer"
      >
        Manage API keys
      </a>
      {error && (
        <p role="alert" className="text-sm text-red-800">
          {error}
        </p>
      )}
      <Button primary type="submit" disabled={busy} className="w-full">
        {busy ? (
          <Busy label="Connecting…" />
        ) : (
          <>
            <Sparkles size={16} />
            Connect AI
          </>
        )}
      </Button>
    </form>
  );
}
function GoogleConnect({ onConnected }) {
  const [url, setUrl] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          await onConnected(
            await post("google/connect", {
              url,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }),
          );
        } catch (e) {
          setError(e.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <p className="subtle">
        Connect your Google Calendar’s private iCal feed. Form reads your plans
        and refreshes them when you open the app; it never edits your calendar.
      </p>
      <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
        <li>Open Google Calendar settings on a computer.</li>
        <li>
          Select your calendar, then{" "}
          <strong className="font-medium text-ink">Integrate calendar</strong>.
        </li>
        <li>
          Copy{" "}
          <strong className="font-medium text-ink">
            Secret address in iCal format
          </strong>{" "}
          and paste it below.
        </li>
      </ol>
      <a
        className="link inline-block"
        href="https://calendar.google.com/calendar/u/0/r/settings"
        target="_blank"
        rel="noreferrer"
      >
        Open Google Calendar settings
      </a>
      <label className="field">
        Private iCal address
        <input
          type="password"
          className="input"
          placeholder="https://calendar.google.com/calendar/ical/…"
          autoComplete="off"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </label>
      <p className="text-xs leading-relaxed text-muted">
        This link grants read access to that calendar. It is stored privately
        and never displayed after connection. Some school accounts disable
        private feeds; .ics import remains available. Basic daily/weekly repeats
        are supported; unsupported recurrence rules are reported as skipped.
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-800">
          {error}
        </p>
      )}
      <Button primary className="w-full" disabled={busy} type="submit">
        {busy ? (
          <Busy label="Connecting your plans…" />
        ) : (
          <>
            <CalendarDays size={17} />
            Connect read-only calendar
          </>
        )}
      </Button>
    </form>
  );
}
function SaveForm({ mood, selection, date, result, onSaved }) {
  const [name, setName] = useState(
      result?.title ||
        "My " +
          (MOODS.find((m) => m.id === mood)?.label.toLowerCase() ||
            "favorite") +
          " look",
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await onSaved(
            await post("outfits", {
              name,
              mood,
              pieces: selection,
              date: date || null,
            }),
          );
        } catch (e) {
          setError(e.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="field">
        Outfit name
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={80}
        />
      </label>
      {selection.some((id) => /^(demo|sample)-/.test(id)) && (
        <p className="subtle">This look uses sample pieces.</p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-800">
          {error}
        </p>
      )}
      <Button primary className="w-full" disabled={busy} type="submit">
        {busy ? (
          <Busy label="Saving…" />
        ) : (
          <>
            <Bookmark size={16} />
            Save outfit
          </>
        )}
      </Button>
    </form>
  );
}
function LocationForm({ current, onSelect }) {
  const [query, setQuery] = useState(current.name),
    [results, setResults] = useState([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          const r = await api("cities?q=" + encodeURIComponent(query));
          setResults(r);
          setError(r.length ? "" : "No city found. Try a nearby city.");
        } catch (e) {
          setError(e.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="field">
        Your city
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
      </label>
      <Button className="w-full" type="submit" disabled={busy}>
        {busy ? <Busy label="Searching…" /> : "Find city"}
      </Button>
      {results.map((r, i) => (
        <Button
          type="button"
          key={i}
          className="w-full"
          onClick={async () => {
            setBusy(true);
            try {
              await onSelect(r);
            } catch (e) {
              setError(e.message);
              setBusy(false);
            }
          }}
          disabled={busy}
        >
          {r.name}, {r.region || r.country}
        </Button>
      ))}
      {error && (
        <p role="alert" className="text-sm text-red-800">
          {error}
        </p>
      )}
      <p className="subtle">
        Philadelphia is the default. Forecasts refresh automatically while Form
        is open.
      </p>
    </form>
  );
}
function EventForm({ onSaved }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [mood, setMood] = useState("study");
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const f = new FormData(e.target);
        try {
          await onSaved(
            await post("events", {
              title: f.get("title"),
              start: new Date(
                f.get("date") + "T" + f.get("time"),
              ).toISOString(),
              mood,
            }),
          );
        } catch (e) {
          setError(e.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="field">
        Your plan
        <input
          className="input"
          name="title"
          placeholder="e.g. Morning lecture"
          required
          maxLength={120}
        />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="field">
          Date
          <input
            className="input"
            name="date"
            type="date"
            required
            defaultValue={dayKey()}
          />
        </label>
        <label className="field">
          Time
          <input
            className="input"
            name="time"
            type="time"
            required
            defaultValue="09:00"
          />
        </label>
      </div>
      <Select
        label="Dress for"
        value={mood}
        onChange={setMood}
        values={MOODS}
      />
      {error && (
        <p role="alert" className="text-sm text-red-800">
          {error}
        </p>
      )}
      <Button primary type="submit" disabled={busy} className="w-full">
        {busy ? <Busy label="Adding…" /> : "Add to my day"}
      </Button>
    </form>
  );
}
function ImportForm({ onImported }) {
  const [file, setFile] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!file) return;
        if (file.size > 2 * 1024 * 1024)
          return setError("Choose a calendar file smaller than 2 MB.");
        setBusy(true);
        try {
          const r = await post("calendar/import", {
            ics: await file.text(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });
          await onImported(r.count);
        } catch (e) {
          setError(e.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <p className="subtle">
        Import an exported .ics file from Google Calendar, Apple Calendar, or
        Outlook. This is a one-time import. Basic daily/weekly repeats expand
        for the next 90 days.
      </p>
      <input
        type="file"
        accept=".ics,text/calendar"
        required
        aria-label="Calendar file"
        onChange={(e) => setFile(e.target.files[0])}
        className="input"
      />
      {error && (
        <p role="alert" className="text-sm text-red-800">
          {error}
        </p>
      )}
      <Button primary disabled={busy} type="submit" className="w-full">
        {busy ? <Busy label="Importing…" /> : "Import plans"}
      </Button>
    </form>
  );
}
function ConfirmDelete({ type, onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <div>
      <p className="subtle">
        {type === "deletePiece"
          ? "This piece and saved outfits using it will be removed."
          : type === "deleteOutfit"
            ? "Your clothing will stay in your closet."
            : "This plan will no longer be used for outfit recommendations."}
      </p>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-800">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-between gap-3">
        <Button onClick={onCancel}>Keep it</Button>
        <Button
          primary
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm();
            } catch (e) {
              setError(e.message);
              setBusy(false);
            }
          }}
        >
          {busy ? <Busy label="Removing…" /> : "Remove"}
        </Button>
      </div>
    </div>
  );
}
