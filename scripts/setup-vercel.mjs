import { readFile } from 'node:fs/promises';
import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';
const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
if (!databaseUrl || !url || !key) { console.error('Missing Postgres or Supabase server credentials. Connect the integration and pull environment variables first.'); process.exit(1); }
const sql = postgres(databaseUrl, {prepare:false,max:1,ssl:'require'});
try {
  await sql.begin(async tx => {
    await tx`CREATE TABLE IF NOT EXISTS _outfits_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`;
    await tx`ALTER TABLE _outfits_migrations ENABLE ROW LEVEL SECURITY`;
    await tx`REVOKE ALL ON _outfits_migrations FROM anon, authenticated`;
    const applied = await tx`SELECT name FROM _outfits_migrations WHERE name = '001-vercel'`;
    if (!applied.length) {
      await tx.unsafe(await readFile(new URL('../migrations/001-vercel.sql',import.meta.url),'utf8'));
      await tx`INSERT INTO _outfits_migrations(name) VALUES ('001-vercel')`;
    }
  });
  const client = createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:buckets,error:listError} = await client.storage.listBuckets();
  if (listError) throw Error('Could not list storage buckets');
  const existing = buckets.find(b=>b.name==='closet-private');
  if (existing?.public) throw Error('The existing closet bucket is public; resolve its privacy before continuing');
  if (!existing) {
    const {error} = await client.storage.createBucket('closet-private',{public:false,fileSizeLimit:4*1024*1024});
    if (error) throw Error('Could not create private storage bucket');
  }
  console.log('Database migration applied. Private photo storage ready.');
} catch (e) { console.error('Setup failed:', e.message?.includes('password') ? 'Database access failed' : e.message); process.exitCode=1; }
finally { await sql.end(); }
