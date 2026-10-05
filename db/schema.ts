import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
export const garments = sqliteTable(
  "garments",
  {
    id: text("id").primaryKey(),
    owner: text("owner").notNull(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    moods: text("moods").notNull(),
    color: text("color").notNull(),
    warmth: integer("warmth").notNull(),
    imageKey: text("image_key").notNull(),
    createdAt: text("created_at").notNull(),
    attributes: text("attributes").notNull().default("{}"),
  },
  (t) => [index("garment_owner").on(t.owner)],
);
export const outfits = sqliteTable(
  "outfits",
  {
    id: text("id").primaryKey(),
    owner: text("owner").notNull(),
    name: text("name").notNull(),
    mood: text("mood").notNull(),
    pieces: text("pieces").notNull(),
    date: text("date"),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("outfit_owner").on(t.owner)],
);
export const settings = sqliteTable("settings", {
  owner: text("owner").primaryKey(),
  data: text("data").notNull(),
});
export const events = sqliteTable(
  "events",
  {
    id: text("id").primaryKey(),
    owner: text("owner").notNull(),
    title: text("title").notNull(),
    start: text("start").notNull(),
    end: text("end"),
    mood: text("mood").notNull(),
  },
  (t) => [index("event_owner").on(t.owner)],
);
