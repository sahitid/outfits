# Outfits

A private virtual closet built with Next.js and React, deployed on Vercel. Supabase provides verified email/password authentication, Postgres records, and a private storage bucket. Access is restricted to the verified email in `CLOSET_OWNER_EMAIL`.

## Run locally

Use Node.js 24 or newer. Connect the Vercel project and Supabase integration, then pull the development environment into the ignored `.env.local` file:

```sh
npm ci
vercel env pull .env.local
npm run db:setup
npm run dev
```

Required server environment: `CLOSET_OWNER_EMAIL`, `POSTGRES_URL` (or `DATABASE_URL`), `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. The integration may provide `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` instead. Secret service keys and database URLs never belong in client code or Git.

## Authentication setup

Set Supabase Authentication → URL Configuration to the deployed Vercel origin and allow its `/auth/callback` URL. Enable email/password sign-in with email confirmation. Register using the owner's configured email. The built-in Supabase mail service is limited to organization members; configure an SMTP provider if that address cannot receive auth emails. Password recovery can be initiated by the project owner through the Supabase dashboard.

Every API request validates the session against Supabase Auth and checks the verified owner's email. Incoming identity headers are discarded. Mutations require a matching Origin. Postgres tables use RLS with no browser-facing grants; the server applies owner-scoped queries. Photo and connection files share a private bucket accessible only through the authenticated server.

## Deploy

```sh
npm test
npm run build
npm run db:setup
vercel --prod
```

`db:setup` applies the versioned Postgres migration transactionally and creates the private bucket. Run it before the first production deployment. Builds do not mutate databases. The linked GitHub `main` branch deploys through Vercel after setup.

The previous Sites deployment remains separate. Its D1 records, photos, and connections are not automatically transferred; copying those requires an authenticated export and ownership mapping after creating the Supabase account. The original Worker is reused as an application service through the Vercel adapters; `drizzle/`, `dev-server.mjs`, and `.openai/hosting.json` remain as historical Sites references, not Vercel deployment configuration.

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

## Implementation

- `app/api/[...path]/route.js`: authenticated Vercel API entrypoint.
- `app/auth/`, `app/login/`, `proxy.js`: sign-in and session refresh.
- `server/access.js`: verified-owner and request-origin checks.
- `server/database.js`: parameterized Postgres adapter for the existing service.
- `server/storage.js`: private file adapter.
- `migrations/`, `scripts/setup-vercel.mjs`: idempotent provisioning.
- `components/closet-app.jsx`: wardrobe, outfits, planning, and uploads.

## Styling references

The matching logic uses adaptable styling heuristics, not universal rules:

- [Adobe: color wheel and harmony](https://www.adobe.com/uk/creativecloud/design/discover/color-wheel.html)
- [Who What Wear: mixing prints](https://www.whowhatwear.com/how-to-mix-prints)
- [Who What Wear: outfit proportions](https://www.whowhatwear.com/uk/how-to-put-together-an-outfit)

Moodboards and sample clothing images are original generated illustrations, not imported Pinterest images. Pinterest links open inspiration searches; they do not sync activity or boards.

## Outfit diary and photo previews
Log actual wear dates with Wore this. Calendar thumbnails show wear history; recommendations penalize repeats within 14 days and consider all daily occasion moods alongside the forecast. Saved looks are not automatically logged.

Photo previews send the reference and owned clothing photos to OpenAI images/edits (gpt-image-1) using the connected API key. Image model access and billing are required. Reference photos and results are not saved by Outfits. Previews are approximate 2D images, not sizing predictions or 3D replicas.
