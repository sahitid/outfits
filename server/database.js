import postgres from 'postgres';
let client;
export function database() {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('Database is not configured');
  return client ||= postgres(url, { prepare: false, max: 2, idle_timeout: 20, connect_timeout: 15, ssl: 'require' });
}
// Only static SQL from the existing Worker is translated. Values remain bound parameters.
export function postgresQuery(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => '$' + ++index).replace(/\bend\b/g, '"end"');
}
export function createD1Adapter(sql) {
  const prepare = (text, args = []) => ({
    text: postgresQuery(text), args,
    bind(...values) { return prepare(text, values); },
    async all() { return { results: [...await sql.unsafe(this.text, this.args)] }; },
    async first() { return (await sql.unsafe(this.text, this.args))[0] || null; },
    async run() { const rows = await sql.unsafe(this.text, this.args); return { success: true, meta: { changes: rows.count } }; },
  });
  return { prepare, batch: statements => sql.begin(async tx => {
    const results = [];
    for (const s of statements) results.push({ results: [...await tx.unsafe(s.text, s.args)] });
    return results;
  }) };
}
