CREATE TABLE garments (
 id text PRIMARY KEY, owner text NOT NULL, name text NOT NULL,
 category text NOT NULL, moods text NOT NULL, color text NOT NULL,
 warmth integer NOT NULL, image_key text NOT NULL, created_at text NOT NULL,
 attributes text NOT NULL DEFAULT '{}'
);
CREATE INDEX garment_owner ON garments(owner);
CREATE TABLE outfits (
 id text PRIMARY KEY, owner text NOT NULL, name text NOT NULL,
 mood text NOT NULL, pieces text NOT NULL, date text, created_at text NOT NULL
);
CREATE INDEX outfit_owner ON outfits(owner);
CREATE TABLE events (
 id text PRIMARY KEY, owner text NOT NULL, title text NOT NULL,
 start text NOT NULL, "end" text, mood text NOT NULL
);
CREATE INDEX event_owner ON events(owner);
CREATE TABLE settings (owner text PRIMARY KEY, data text NOT NULL);
-- Access is exclusively through the authenticated server API.
ALTER TABLE garments ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON garments, outfits, events, settings FROM anon, authenticated;
