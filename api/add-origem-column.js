export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL || 'https://vumtiszgrcjzgekkpgmp.supabase.co',
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
  );

  // Adiciona a coluna origem_esg_realizados (jsonb) na tabela visitas, se não existir
  const { error } = await supabase.rpc('exec_sql', {
    query: `
      ALTER TABLE visitas
      ADD COLUMN IF NOT EXISTS origem_esg_realizados jsonb;
    `
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true });
}
