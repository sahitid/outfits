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
        <svg className="atlas-art-svg" role="img" aria-label={piece.name} viewBox={(() => {if(piece.legacy)return `${(piece.atlas%4)*443.5} ${Math.floor(piece.atlas/4)*443.5} 443.5 443.5`;return [[8,10,350,335],[390,10,326,335],[748,25,320,305],[1122,18,300,320],[12,350,350,325],[390,350,330,324],[747,377,326,276],[1107,361,325,315],[8,731,355,276],[425,677,260,398],[739,732,333,277],[1155,676,230,400]][piece.atlas].join(" ");})()} preserveAspectRatio="xMidYMid meet" style={{width:"100%",height:"100%",overflow:"hidden"}}>
          <image href={piece.legacy?"/garments.png":"/wardrobe.png"} width={piece.legacy?1774:1448} height={piece.legacy?887:1086}/>
        </svg>
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
function Button({ children, primary, soft, className, type = "button", ...props }) {
  return (
    <button
      className={cx(
        "btn",
        primary && "btn-primary",
        soft && "btn-soft",
        className,
      )}
      type={type}
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
    <div className="rounded-xl border border-dashed border-[#dddddd] bg-leaf/40 px-6 py-14 text-center">
      <Icon size={38} className="mx-auto mb-4 text-[#555555]" />
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
          reduced ? {} : { rotate: (piece.atlas || 0) % 2 === 0 ? -1 : 1, y: -3 }
        }
        whileDrag={reduced ? { zIndex: 90 } : { scale: 1.06, rotate: 4, zIndex: 90 }}
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
          "garment-caption relative rounded-lg border bg-white/85 p-2.5",
          selected ? "border-[#dddddd]" : "border-line",
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
            className="absolute bottom-2.5 right-2 text-[#555555]"
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
    [grid, setGrid] = useState(true);
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
      const dayEvents = data.events.filter((e) => dayKey(new Date(e.start)) === date);
      const eventMood = daily
        ? data.events
            .filter((e) => dayKey(new Date(e.start)) === date)
            .sort((a, b) => (["formal", "professional", "athletic", "going-out", "study"].indexOf(a.mood) < 0 ? 9 : ["formal", "professional", "athletic", "going-out", "study"].indexOf(a.mood)) - (["formal", "professional", "athletic", "going-out", "study"].indexOf(b.mood) < 0 ? 9 : ["formal", "professional", "athletic", "going-out", "study"].indexOf(b.mood)))[0]?.mood
        : null;
      const activeMood = eventMood || mood;
      const forecast = weather?.days?.find((d) => d.date === date);
      const r = await post("recommend", {
        sample: isDemo,
        eventMoods: daily ? dayEvents.map(e => e.mood) : [],
        note: daily ? "Plans: " + dayEvents.map(e => e.title + " (" + e.mood + ")").join(", ") : "",
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
  const logWear = (ids, name, date = dayKey()) => setModal({type: "wear", pieces: ids, name, date});
  const saveSettings = async (patch) => {
    const settings = await post("settings", patch, "PUT");
    setData((d) => ({ ...d, settings }));
    return settings;
  };
  useEffect(() => {
    if (!loading && view === "today")
      recommend({ daily: true, date: selectedDate });
  }, [view, selectedDate, loading, weather, data.events, data.settings.wearHistory]);
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
      [p.name, p.color, p.category, p.subtype].join(" ").toLowerCase().includes(query.toLowerCase().trim()),
  );
  const activeVibes = data.settings.vibes?.[mood] ?? DEFAULT_VIBES[mood] ?? [];
  const weatherLabel = weather
    ? `${Math.round((weather.temperature * 9) / 5 + 32)}°F · ${weather.description}`
    : "Forecast loading…";
  const stage = (
    <aside className="styling-panel card p-5 xl:p-6 lg:sticky lg:top-6">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-leaf p-2.5 text-[#555555]">
          <Sparkles size={22} />
        </span>
        <div>
          <p className="eyebrow studio-kicker">THE STYLING STUDIO</p><h2 className="text-lg font-semibold">A little outfit magic.</h2><p className="subtle studio-description">Start with a favorite. Find its perfect match.</p>
          
        </div>
      </div>
      <div className="my-5 border-t border-line" />
      <p className="eyebrow mb-3">Mood</p>
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
            className="rounded-full bg-rose px-2.5 py-1 text-xs text-[#555555]"
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
        className="fit-stage relative min-h-[260px] rounded-xl border border-dashed border-[#dddddd] p-4"
      >
        <p className="eyebrow text-[11px]">Outfit</p>
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
            <Hanger size={46} className="mx-auto text-[#555555]" />
            <h3 className="mt-5 text-base font-medium">
              Your next look starts here
            </h3>
            <p className="mt-2 text-sm text-muted">Tap a piece from your wardrobe, or let us find a pairing.</p>
          </div>
        )}
        <p className="mt-4 flex items-center justify-center gap-1 text-xs text-[#555555]">
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
          className="accent-black"
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
      <Button className="mt-4 w-full" disabled={selection.length < 2} onClick={() => setModal({type: "tryon"})}><Camera size={16}/> Preview on me</Button>
    </aside>
  );
  return (
    <div className="min-h-screen">
      <header className="site-masthead">
        <div className="masthead-inner">
          <a href="/" className="wordmark" aria-label="Outfits home">outfits<span className="wordmark-dot">.</span></a>
          <nav className="desktop-nav" aria-label="Main navigation">
            {nav.map(([v,label,Icon]) => <button key={v} aria-current={view===v ? "page" : undefined} onClick={()=>go(v)} className={cx("editorial-nav",view===v&&"is-active")}><Icon size={16}/>{label}</button>)}
          </nav>
          <div className="masthead-tools">
            <button className="icon-btn" onClick={()=>go("settings")} aria-label="Connections"><Settings2 size={20}/></button>
            <button className="profile-button" onClick={()=>setModal({type:"account"})} aria-label="Your account">{(data.user?.name || "O").slice(0,1).toUpperCase()}</button>
          </div>
        </div>
      </header>
      <div>
        <main key={view} className="page-transition page-shell mx-auto max-w-[1560px] px-4 pb-28 pt-7 sm:px-7 md:px-9 lg:pb-10">
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
              <section className="closet-editorial">
                <div className="editorial-intro">
                  <p className="eyebrow">A LITTLE LESS “NOTHING TO WEAR”</p>
                  <h1>Your closet.<br/><em>More possibilities.</em></h1>
                  <p className="editorial-description">Rediscover what you own. Put together looks that feel like you, for whatever the day has planned.</p>
                  <div className="editorial-actions">
                    <Button primary onClick={() => setModal({type:"upload"})}><Plus size={17}/> Add clothing</Button>
                    <button className="editorial-text-link" onClick={()=>document.getElementById("wardrobe")?.scrollIntoView({behavior:"smooth",block:"start"})}>Explore your wardrobe <span aria-hidden="true">↘</span></button>
                  </div>
                  <div className="closet-summary"><span><strong>{isDemo ? 0 : pieces.length}</strong> closet pieces</span><span><strong>{data.outfits.length}</strong> saved looks</span><span><LockKeyhole size={12}/> Just for you</span></div>
                </div>
                <div className="editorial-composition">
                  <div className="composition-caption"><span>{isDemo ? "THE SAMPLE EDIT" : "FROM YOUR WARDROBE"}</span><span>EVERYDAY, REIMAGINED ↗</span></div>
                  <div className="composition-pieces" aria-label={isDemo ? "Sample wardrobe inspiration" : "From your wardrobe"}>
                    {[(pieces.find(p=>p.category==="tops") || pieces[0]),(pieces.find(p=>p.category==="bottoms") || pieces[1])].filter(Boolean).map((p,i)=><button key={p.id} className={"composition-piece piece-"+i} onClick={()=>{choose(p.id,true);document.getElementById("wardrobe")?.scrollIntoView({behavior:"smooth",block:"start"});}} aria-label={"Style "+p.name}><Art piece={p}/><span>{p.name} <span aria-hidden="true">↗</span></span></button>)}
                  </div>
                  <div className="composition-bottom"><span>Familiar pieces. A fresh perspective.</span><span>01 / YOUR DAILY EDIT</span></div>
                </div>
              </section>
              <button className="daily-dispatch" onClick={()=>go("today")}>
                <span className="dispatch-label"><CloudSun size={20}/> TODAY</span>
                <span className="dispatch-weather">{loc.name} <span aria-hidden="true">/</span> {weatherLabel}</span>
                <span className="dispatch-cta">Style my day <span aria-hidden="true">↗︎</span></span>
              </button>
              <div className="closet-workspace grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
                <section id="wardrobe" className="wardrobe-section">
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
                            ? "Explore 12 sample pieces, then add your own to make this closet yours."
                            : "Your favorites, ready for a fresh combination."}
                      </p>
                    </div>
                    <div className="flex rounded-lg border border-line bg-white p-1">
                      <button
                        className={cx("rounded p-2", !grid && "bg-leaf")}
                        aria-label="Hanger view"
                        aria-pressed={!grid}
                        onClick={() => setGrid(false)}
                      >
                        <Hanger size={17} />
                      </button>
                      <button
                        className={cx("rounded p-2", grid && "bg-leaf")}
                        aria-label="Grid view"
                        aria-pressed={grid}
                        onClick={() => setGrid(true)}
                      >
                        <LayoutGrid size={17} />
                      </button>
                    </div>
                  </div>
                  <div className="wardrobe-toolbar my-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1">
                      {["all", "tops", "bottoms", "layers"].map((f) => (
                        <button
                          key={f}
                          aria-pressed={filter === f}
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
                        placeholder="Search name, color…"
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
                    <Empty title="No matches">
                      Try another color, name, or category.<br/><Button className="mt-4" onClick={()=>{setQuery("");setFilter("all");setSubfilter("all");}}>Clear filters</Button>
                    </Empty>
                  )}
                  
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
                title="Saved outfits"
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
                      <div className="outfit-art bg-[#f5f5f5] p-6">
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
                        <p className="mt-3 text-xs text-muted">{(() => {const entries = (data.settings.wearHistory || []).filter(w => w.pieces.slice().sort().join() === o.pieces.slice().sort().join()); return entries.length ? `Worn ${entries.length} times · last ${entries.map(w=>w.date).sort().at(-1)}` : "Not logged as worn yet";})()}</p>
                        <Button className="mt-3" onClick={() => logWear(o.pieces, o.name)}>Wore this</Button>
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
                <Empty icon={Bookmark} title="No saved outfits">
                  Save an outfit from your closet.
                </Empty>
              )}
            </>
          )}
          {view === "today" && (
            <>
              <PageHeading
                eyebrow="A LITTLE LESS DECIDING"
                title="Today"
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
                        onClick={() => recommend({daily: true})}
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
                        <details className="text-sm"><summary className="cursor-pointer">Why this outfit</summary><p className="subtle mt-2">{result.reason}</p></details>
                        <p className="mt-3 text-sm text-[#555555]">
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
                      <Button disabled={selection.length < 2} onClick={() => logWear(selection, result?.title || "My outfit", selectedDate)}>Wore this</Button>
                      <Button disabled={selection.length < 2} onClick={() => setModal({type: "tryon"})}>Preview on me</Button>
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
          {view === "calendar" && (<>
            <WearCalendar history={data.settings.wearHistory || []} find={find} remove={async id => {try {await api("wear/"+id, {method:"DELETE"}); await refreshData();} catch(e){notify(e.message);}}}/>
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
            /></>
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
              tryon: "Preview on me",
              wear: "Log an outfit.",
              upload: "Add clothing",
              save: "Save outfit",
              details: modal.piece?.name,
              theory: "Why this pairing works.",
              google: "Connect Google Calendar.",
              ai: "Connect AI",
              location: "Location",
              event: "Add plan",
              import: "Import calendar",
              account: "Account",
              deleteOutfit: "Remove this outfit?",
              deleteEvent: "Remove this plan?",
              deletePiece: "Remove this piece?",
            }[modal.type]
          }
          kicker={modal.type === "upload" ? "PHOTO → CLOSET" : "YOUR OUTFITS"}
          onClose={close}
        >
          {modal.type === "wear" && <WearForm initial={modal} onSaved={async () => {await refreshData();close();notify("Added to your outfit calendar.");}}/>}
          {modal.type === "tryon" && <TryOn pieces={selection} demo={selection.some(id=>/^(demo|sample)-/.test(id))} ai={connections.ai} connect={() => setModal({type:"ai"})}/>}
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
                    className="text-sm text-[#555555]"
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
                  : "Sign in to save your private closet."}
              </p>
              <p className="subtle mt-3">
                Your photos, outfits, and style preferences stay with your
                private account.
              </p>
              <Button className="mt-6" onClick={async()=>{if(data.user){const r=await fetch('/auth/logout',{method:'POST'});if(!r.ok){notify('Could not sign out. Please try again.');return;}}location.assign('/login');}}>{data.user ? 'Sign out' : 'Sign in'}</Button>
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
        
        <h1 className="mt-3 text-4xl font-medium tracking-[-1.5px]">
          {heading}
        </h1>
        
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
  const [tab,setTab] = useState("discover");
  const [search,setSearch] = useState("");
  const boards = AESTHETICS.filter(a => (tab !== "saved" || selected.includes(a.id)) && (a.name+" "+a.sub).toLowerCase().includes(search.toLowerCase()));
  return <section className="vibes-page">
    <div className="board-heading"><div><h1>Vibes</h1></div><span className="board-count"><Bookmark size={16}/>{selected.length} / 3 saved</span></div>
    <div className="board-toolbar"><div className="board-tabs" aria-label="Inspiration views"><button onClick={()=>setTab("discover")} aria-pressed={tab==="discover"} className={cx(tab==="discover"&&"active")}>Discover</button><button onClick={()=>setTab("saved")} aria-pressed={tab==="saved"} className={cx(tab==="saved"&&"active")}>Saved for this mood <span>{selected.length}</span></button></div><label className="board-search"><Search size={17}/><input placeholder="Vibes" aria-label="Search aesthetics" value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button onClick={()=>setSearch("")} aria-label="Clear search"><X size={15}/></button>}</label></div>
    <div className="mood-board-selector"><span className="eyebrow">MOOD</span><div>{MOODS.map(m=><button key={m.id} aria-pressed={mood===m.id} onClick={()=>setMood(m.id)} className={cx("chip",mood===m.id&&"chip-selected")}>{m.label}</button>)}</div></div>
    <div className="pin-grid" key={tab+search}>
      {boards.map(a=><article key={a.id} className={cx("inspiration-pin",selected.includes(a.id)&&"pin-saved")}>
        <div className={cx("pin-image", "pin-height-"+(a.image%3))}>
          <svg className="vibe-photo" role="img" aria-label={a.name+" outfit inspiration"} viewBox={`${(a.image%3)*512+2} ${a.image<3?2:494} 508 ${a.image<3?486:526}`} preserveAspectRatio="xMidYMid slice"><image href="/inspiration.png" width="1536" height="1024"/></svg>
          <div className="pin-shade"/>
          <button className="pin-save" disabled={busy} aria-label={(selected.includes(a.id)?"Unsave ":"Save ")+a.name} aria-pressed={selected.includes(a.id)} onClick={()=>toggle(a.id)}>{selected.includes(a.id)?<><Check size={14}/>Saved</>:<>Save <Plus size={14}/></>}</button>
          <a className="pin-explore" href={a.pinterest} target="_blank" rel="noreferrer" aria-label={"Explore "+a.name+" on Pinterest"}>Pinterest <ExternalLink size={13}/></a>
          <span className="pin-number">0{a.image+1}</span>
        </div>
        <div className="pin-caption"><div><h2>{a.name}</h2></div><div className="pin-palette" aria-label="Palette">{a.colors.slice(0,3).map(c=><span key={c} title={c} style={{background:COLORS[c]}}/>)}</div></div>
      </article>)}
    </div>
    {!boards.length&&<Empty icon={Bookmark} title={search?"No matching aesthetics.":"No saved vibes"}>{search?"Try a different search.":"Save up to three vibes."}</Empty>}
    <div className="board-preferences"><div><h3>Mix prints</h3></div><label className="switch-control"><input aria-label="Allow bolder print mixing" type="checkbox" checked={!!settings.boldPatterns} onChange={async e=>{try{await saveSettings({boldPatterns:e.target.checked});}catch(err){notify(err.message);}}}/><span/></label></div>
    <p className="board-disclosure">AI-created images · Pinterest links open externally.</p>
  </section>;
}

function Weather({ weather, error, location, date, refresh }) {
  const d = weather?.days?.find((d) => d.date === date);
  const temp = d?.high ?? weather?.temperature,
    rain = d?.rain ?? weather?.rain;
  const Icon = rain > 30 ? CloudRain : Sun;
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#dddddd] bg-[#f5f5f5] p-6">
      <div>
        <p className="eyebrow">{location.name} · forecast</p>
        {weather ? (
          <>
            <h2 className="mt-2 text-4xl font-medium">
              {Math.round((temp * 9) / 5 + 32)}°F
              {d && (
                <span className="ml-2 text-lg text-[#555555]">
                  / {Math.round((d.low * 9) / 5 + 32)}°
                </span>
              )}
            </h2>
            <p className="mt-2 text-sm text-[#555555]">
              {d?.description || weather.description} · {Math.round(rain)}% rain
            </p>
            <p className="mt-2 text-xs text-[#555555]">
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
      <Icon size={55} strokeWidth={1} className="shrink-0 text-[#555555]" />
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
              className="my-5 border-l-2 border-[#dddddd] py-1 pl-4"
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
        title="Plans"
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
        <Empty icon={CalendarDays} title="No plans">
          Connect a calendar or add a plan.
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
        title="Connections"
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
              ? "Your private feed refreshes when you open Outfits."
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
              ? "Photo recognition and outfit advice."
              : "Photo recognition and outfit advice.",
            action: connections.ai ? "Update connection" : "Connect AI",
            run: connectAI,
            type: "ai",
          },
        ].map((c) => (
          <section className="card flex flex-col p-6" key={c.title}>
            <c.icon size={28} className="mb-5 text-[#555555]" />
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
          Style notes
        </h2>
        <p className="subtle mt-3">
          Pairings use color, pattern, proportions, and saved vibes. Warmth is estimated.
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
      <div className="rounded-xl border border-dashed border-[#dddddd] bg-paper p-6 text-center">
        {photo ? (
          <img
            src={photo.image}
            className="mx-auto mb-4 max-h-52 rounded-lg object-contain"
            alt="Your clothing photo"
          />
        ) : (
          <ImagePlus size={40} className="mx-auto mb-4 text-[#555555]" />
        )}
        <h3 className="text-lg font-medium">
          {scan
            ? "Scanning…"
            : photo
              ? "Review photo"
              : "Add a photo"}
        </h3>
        <p className="subtle mx-auto mt-2 max-w-sm">
          One garment. Plain background. Good light.
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
        Connect your Google Calendar’s private iCal feed. Outfits reads your plans
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
        Philadelphia is the default. Forecasts refresh automatically while Outfits
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

function WearForm({initial,onSaved}) {
  const [date,setDate]=useState(initial.date), [busy,setBusy]=useState(false), [error,setError]=useState("");
  return <form onSubmit={async e=>{e.preventDefault();setBusy(true);try{await post("wear",{date,pieces:initial.pieces,name:initial.name});await onSaved();}catch(e){setError(e.message);}finally{setBusy(false);}}} className="space-y-5"><p className="subtle">Recent outfits repeat less often.</p><label className="field">Date worn<input required className="input" type="date" max={dayKey()} value={date} onChange={e=>setDate(e.target.value)}/></label>{error && <p role="alert">{error}</p>}<Button primary disabled={busy} type="submit">{busy?"Saving…":"Add to outfit calendar"}</Button></form>;
}
function WearCalendar({history,find,remove}) {
  const [month,setMonth]=useState(()=>dayKey().slice(0,7));
  const first=new Date(month+"-01T12:00:00"), days=new Date(first.getFullYear(),first.getMonth()+1,0).getDate();
  const shift=n=>{const d=new Date(first);d.setMonth(d.getMonth()+n);setMonth(dayKey(d).slice(0,7));};
  return <section className="mb-10"><div className="mb-5 flex flex-wrap items-center justify-between gap-4"><div><h1 className="mt-2 text-3xl font-semibold">Worn outfits</h1></div><div className="flex items-center gap-3"><Button aria-label="Previous month" onClick={()=>shift(-1)}>←</Button><span>{first.toLocaleDateString(undefined,{month:"long",year:"numeric"})}</span><Button aria-label="Next month" onClick={()=>shift(1)}>→</Button></div></div><div className="card overflow-x-auto"><div className="grid min-w-[560px] grid-cols-7">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} className="border-b border-line p-3 text-xs text-muted">{d}</div>)}{Array.from({length:first.getDay()},(_,i)=><div key={'blank'+i} className="border-b border-r border-line bg-paper"/>)}{Array.from({length:days},(_,i)=>{const date=month+'-'+String(i+1).padStart(2,'0');return <div key={date} className={cx("min-h-[120px] border-b border-r border-line p-2",date===dayKey()&&"bg-paper")}><span className={cx("inline-flex h-6 w-6 items-center justify-center text-xs rounded-full",date===dayKey()&&"bg-ink text-white")}>{i+1}</span>{history.filter(w=>w.date===date).map(w=><div key={w.id} className="mt-2"><div className="flex h-16">{w.pieces.map(id=><Art key={id} piece={find(id)}/>)}</div><p className="mt-1 text-[10px] leading-tight">{w.name}</p><button className="mt-1 text-[10px] text-muted underline" onClick={()=>remove(w.id)} aria-label={'Remove wear log '+w.name+' '+date}>Undo log</button></div>)}</div>;})}</div></div>{!history.length && <p className="subtle mt-3">Tap “Wore this” to log an outfit.</p>}</section>;
}
function TryOn({pieces,demo,ai,connect}) {
  const [photo,setPhoto]=useState(null),[result,setResult]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
  return <div className="space-y-5"><p className="subtle">Photo sent to OpenAI; not saved by Outfits. AI previews don’t predict fit.</p>{!ai ? <Button primary onClick={connect}>Connect AI to preview</Button> : demo ? <p className="rounded-xl bg-paper p-5">Upload your own clothing and select a top and bottom first. Previews use their actual photos.</p> : <><label className="field">Your fully clothed photo<input type="file" accept="image/jpeg,image/png,image/webp" className="input" disabled={busy} onChange={e=>{const f=e.target.files?.[0];setError("");setResult(null);if(!f)return;if(f.size>2900000 || !['image/jpeg','image/png','image/webp'].includes(f.type)){setError("Choose a JPEG, PNG or WebP under 3 MB.");setPhoto(null);return;}const r=new FileReader();r.onload=()=>setPhoto(r.result);r.readAsDataURL(f);}}/></label>{photo && <img src={photo} alt="Your reference photo" className="max-h-64 w-full rounded-xl object-contain bg-paper"/>}<p className="text-xs text-muted">Use a full-length photo. Generation is billed to your OpenAI account.</p><Button primary disabled={!photo||busy} onClick={async()=>{setBusy(true);setError("");try{const r=await post("tryon",{image:photo,pieces});setResult(r.image);}catch(e){setError(e.message);}finally{setBusy(false);}}}>{busy?"Creating your preview… this can take a few minutes":"Generate my preview"}</Button></>}{error&&<p role="alert">{error}</p>}{result&&<div><p className="eyebrow mb-3">AI STYLING PREVIEW</p><img src={result} alt="AI-generated outfit preview" className="w-full rounded-xl"/><a className="btn mt-4" href={result} download="outfits-preview.png">Download preview</a></div>}</div>;
}
