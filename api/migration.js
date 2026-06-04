export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL || 'https://vumtiszgrcjzgekkpgmp.supabase.co',
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
  );

  // Inserir registro de teste para forçar criação implícita não funciona
  // Usar a abordagem de upsert com estrutura mínima
  const { error } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS briefing_feedback (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        medico_nome text,
        responsavel text,
        avaliacao text,
        comentario text,
        briefing_resumo text,
        created_at timestamptz DEFAULT now()
      );
      ALTER TABLE briefing_feedback ENABLE ROW LEVEL SECURITY;
      CREATE POLICY IF NOT EXISTS "allow_all" ON briefing_feedback FOR ALL USING (true) WITH CHECK (true);
    `
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true });
}
