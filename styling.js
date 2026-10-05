import { AESTHETICS, DEFAULT_VIBES, MOODS } from "./catalog.js";
const neutral = new Set([
  "white",
  "cream",
  "beige",
  "black",
  "charcoal",
  "gray",
  "brown",
  "navy",
  "indigo",
]);
const hues = {
  pink: 345,
  red: 0,
  burgundy: 345,
  orange: 30,
  yellow: 60,
  green: 120,
  blue: 225,
  indigo: 240,
  purple: 280,
};
export function colorHarmony(a, b) {
  if (a === b)
    return {
      score: 8,
      label: "Tonal palette",
      why: "Repeating one color family keeps the outfit cohesive.",
    };
  if (neutral.has(a) || neutral.has(b))
    return {
      score: 7,
      label: "Grounded palette",
      why: "A neutral anchors the other color so the combination feels intentional.",
    };
  const d = Math.abs((hues[a] ?? 0) - (hues[b] ?? 0)),
    distance = Math.min(d, 360 - d);
  if (distance <= 60)
    return {
      score: 8,
      label: "Neighboring colors",
      why: "Nearby colors create a soft, harmonious palette.",
    };
  if (distance >= 150)
    return {
      score: 6,
      label: "Complementary contrast",
      why: "Contrasting colors bring energy; keep accessories quiet.",
    };
  return {
    score: 3,
    label: "Color play",
    why: "Two distinct colors add personality; repeat one in your accessories.",
  };
}
export function printBalance(a, b, bold = false) {
  const ap = a.pattern || "solid",
    bp = b.pattern || "solid";
  if (ap === "solid" && bp === "solid")
    return {
      score: 5,
      label: "Texture over print",
      why: "Simple pieces let knit, denim, or tailored textures do the work.",
    };
  if (ap === "solid" || bp === "solid")
    return {
      score: 8,
      label: "One statement print",
      why: "One patterned piece gets the spotlight while the solid gives it breathing room.",
    };
  const shared = [a.color, ...(a.secondaryColors || [])].some((c) =>
    [b.color, ...(b.secondaryColors || [])].includes(c),
  );
  return {
    score: shared ? (bold ? 8 : 3) : bold ? 0 : -9,
    label: shared ? "Shared-color prints" : "Expressive print mix",
    why: shared
      ? "A repeated color connects the prints. Different print sizes make the mix easier to read."
      : "These prints compete for attention. Try a solid swap for a quieter look.",
  };
}
function proportion(a, b) {
  const wide = ["wide-leg", "a-line", "oversized", "relaxed"].includes(b.fit);
  if (wide && ["fitted", "regular"].includes(a.fit))
    return {
      score: 7,
      label: "Balanced volume",
      why: "A closer-fitting top balances the fuller bottom.",
    };
  if (a.length === "cropped" && ["long", "midi", "maxi"].includes(b.length))
    return {
      score: 7,
      label: "Short + long",
      why: "The cropped top and longer bottom create a clear proportion break.",
    };
  if (a.fit === "oversized" && ["fitted", "regular"].includes(b.fit))
    return {
      score: 6,
      label: "Relaxed + streamlined",
      why: "An oversized top pairs well with a simpler bottom.",
    };
  return {
    score: 3,
    label: "Intentional shape",
    why: "Try a small front tuck or a visible hem break to give the outfit definition.",
  };
}
export function rankedPairings(garments, mood, weather, preferences = {}) {
  const tops = garments.filter((g) => g.category === "tops"),
    bottoms = garments.filter((g) => g.category === "bottoms");
  if (!tops.length || !bottoms.length)
    throw Error(
      "Add at least one top and one bottom to find a complete pairing.",
    );
  const vibes = preferences.vibes?.[mood] ?? DEFAULT_VIBES[mood] ?? ["preppy"];
  const defs = vibes
    .map((v) => AESTHETICS.find((a) => a.id === v))
    .filter(Boolean);
  const target = weather
    ? weather.temperature >= 24
      ? 1
      : weather.temperature <= 12
        ? 3
        : 2
    : 2;
  const results = [];
  for (const t of tops)
    for (const b of bottoms) {
      const color = colorHarmony(t.color, b.color),
        pattern = printBalance(t, b, preferences.boldPatterns),
        shape = proportion(t, b);
      const moodFit = [t, b].filter((g) => g.moods.includes(mood)).length;
      const vibeScore = [t, b].reduce(
        (s, g) =>
          s +
          defs.reduce(
            (n, d) =>
              n +
              (g.vibes?.includes(d.id) ? 6 : 0) +
              (d.types.includes(g.subtype) ? 3 : 0) +
              (d.colors.includes(g.color) ? 2 : 0),
            0,
          ),
        0,
      );
      let score =
        moodFit * 20 + vibeScore + color.score + pattern.score + shape.score;
      if (weather)
        score -=
          Math.abs(t.warmth - target) * 7 +
          (weather.temperature < 13 && ["mini", "shorts"].includes(b.length)
            ? 14
            : 0) +
          (weather.temperature > 25 && b.warmth === 3 ? 8 : 0);
      if (mood === "athletic" && !["shorts", "leggings"].includes(b.subtype))
        score -= 18;
      let pieces = [t.id, b.id];
      const layer =
        weather && weather.temperature < 16
          ? garments
              .filter((g) => g.category === "layers")
              .sort(
                (a, b) =>
                  (b.moods.includes(mood) ? 1 : 0) -
                  (a.moods.includes(mood) ? 1 : 0),
              )[0]
          : null;
      if (layer) pieces.push(layer.id);
      const details = [color, pattern, shape].map(({ label, why }) => ({
        label,
        why,
      }));
      const title = (defs[0]?.name || "Your style") + " moment";
      let reason = `${shape.why} ${pattern.why}`;
      if (moodFit < 2)
        reason +=
          " This is the closest match; add more pieces tagged for this mood.";
      if (weather?.temperature < 13)
        reason += layer
          ? " Finish with your warm layer."
          : " Add a warm outer layer for the cool forecast.";
      if ((weather?.rain ?? 0) > 30)
        reason += " Bring an umbrella and shoes that handle rain.";
      const recent = (preferences.wearHistory || []).filter(w => {
        const days = (Date.parse(preferences.targetDate) - Date.parse(w.date)) / 86400000;
        return days >= 0 && days < 14;
      });
      const exact = recent.filter(w => [t.id,b.id].every(id => w.pieces.includes(id)));
      score -= exact.length * 28;
      score -= recent.reduce((n,w) => n + [t.id,b.id].filter(id=>w.pieces.includes(id)).length * 3,0);
      for (const occasion of new Set(preferences.eventMoods || [])) score += [t,b].filter(g => g.moods.includes(occasion)).length * 7;
      if (recent.length) details.push({label: exact.length ? "Recent repeat" : "Fresh rotation", why: exact.length ? "You wore this combination in the last two weeks. It is still an option when it suits the day best." : "This combination has not been logged in the last two weeks."});
      if ((preferences.eventMoods || []).includes("athletic") && mood !== "athletic") reason += " Pack a separate workout outfit for your athletic plans.";
      results.push({
        pieces,
        title,
        reason,
        details,
        palette: [...new Set([t.color, b.color])],
        score,
        mood,
        vibes,
        engine: "style-rules",
        tips:
          mood === "study"
            ? "Finish with comfortable walking shoes and your class bag."
            : mood === "professional"
              ? "Try a tidy tuck and simple accessories."
              : "Repeat one outfit color in a small accessory.",
      });
    }
  return results.sort(
    (a, b) =>
      b.score - a.score || a.pieces.join().localeCompare(b.pieces.join()),
  );
}
export function pairing(
  garments,
  mood,
  weather,
  date,
  variant = 0,
  preferences = {},
) {
  const sorted = rankedPairings(garments, mood, weather, preferences);
  const best = sorted.filter((r) => r.score >= sorted[0].score - 8).slice(0, 8);
  const seed = [...date].reduce((n, c) => n + c.charCodeAt(0), 0);
  return best[(seed + Math.max(0, variant)) % best.length];
}
