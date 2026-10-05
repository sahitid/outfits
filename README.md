# Form

A Next.js 16 + React 19 + Tailwind CSS 4 virtual closet. The UI is written as React components. The hosted version uses a Cloudflare Worker for private API requests, D1 for records, and R2 for photos and private connection details.

## Put this in your `outfits` folder

Extract the source ZIP into your `outfits` folder and open that folder in VS Code or Codex. The folder should directly contain `package.json`, `app/`, and `components/`.

Use Node.js 24 or newer, then run:

```sh
npm install
npm run dev
```

Open the local URL printed in the terminal. The local development server uses a local account and keeps data in `.local/`, which is excluded from Git. Production authentication continues to use ChatGPT sign-in. Local data is separate from the published closet.

## Connections

- **Weather:** Philadelphia is the default. Live weather comes from Open-Meteo. Change the city in Connections.
- **Google Calendar:** In Connections, paste the calendar's **Secret address in iCal format** from Google Calendar → Settings → selected calendar → Integrate calendar. The feed is stored privately and used read-only. It refreshes when the app opens after 15 minutes and on manual refresh. School administrators may disable secret feeds; `.ics` import is also supported. Basic daily and weekly recurrences are supported; unsupported rules are reported as skipped.
- **AI:** Connect an OpenAI API key in Connections, or set the server-side `OPENAI_API_KEY` environment variable. The key is stored server-side and never returned to the client. API billing is separate from ChatGPT. Photo recognition and AI styling call `gpt-4.1-mini` with structured outputs and `store: false`. Photos are sent to OpenAI only when analyzed. Without an AI connection, the explicit style-theory matcher remains available; it is labeled separately.

## Features

- Photo-first upload: AI suggests name, type, colors, print, fit, length, estimated warmth, moods, and aesthetic tags. Review before saving.
- Tops: sweaters, cardigans, short sleeves, tanks, hoodies, shirts, long sleeves, and blouses.
- Bottoms: skirts, shorts, pants, jeans, and leggings; plus outer layers.
- Nine moods with separate aesthetic preferences, six original visual moodboards, and Pinterest exploration links.
- Outfit matching considers color harmony, print balance, silhouette proportions, weather, and saved vibes. AI can choose from valid wardrobe combinations and explain the styling.
- Drag-and-sway wardrobe, saved outfits, calendar plans, and daily recommendations.

## Project structure

- `app/`: Next.js App Router page, layout, Tailwind styles.
- `components/closet-app.jsx`: React application and forms.
- `catalog.js`: categories, moods, aesthetics, sample clothing.
- `styling.js`: transparent, rule-based outfit ranking.
- `ai.js`: structured AI photo analysis and styling.
- `worker.js`: authenticated API and ownership checks.
- `connections.js`: Google Calendar feed validation and sync.
- `db/` and `drizzle/`: schema and append-only migrations.
- `dev-server.mjs`: local Next.js server with SQLite and filesystem adapters.
- `build.mjs`: packages the Next.js export and Worker for Sites.

```sh
npm test
npm run build
```

`npm run build` creates the Next.js static UI and packages it with the API Worker in `dist/`. Do not deploy only the static export if you need authentication, storage, or API features. The existing private Sites identity is in `.openai/hosting.json`; preserve it when updating this Site. No API keys or calendar links are included in this source.

## Styling references

The matching logic uses adaptable styling heuristics, not universal rules:

- [Adobe: color wheel and harmony](https://www.adobe.com/uk/creativecloud/design/discover/color-wheel.html)
- [Who What Wear: mixing prints](https://www.whowhatwear.com/how-to-mix-prints)
- [Who What Wear: outfit proportions](https://www.whowhatwear.com/uk/how-to-put-together-an-outfit)

Moodboards and sample clothing images are original generated illustrations, not imported Pinterest images. Pinterest links open inspiration searches; they do not sync activity or boards.

## Outfit diary and photo previews
Log actual wear dates with Wore this. Calendar thumbnails show wear history; recommendations penalize repeats within 14 days and consider all daily occasion moods alongside the forecast. Saved looks are not automatically logged.

Photo previews send the reference and owned clothing photos to OpenAI images/edits (gpt-image-1) using the connected API key. Image model access and billing are required. Reference photos and results are not saved by Outfits. Previews are approximate 2D images, not sizing predictions or 3D replicas.
