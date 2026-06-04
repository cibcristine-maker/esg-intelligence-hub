import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabase = createClient(
    'https://vumtiszgrcjzgekkpgmp.supabase.co',
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY || ''
  );

  try {
    // Tentar inserir um registro fictício para testar se a tabela existe
    const { error: testError } = await supabase
      .from('briefing_feedback')
      .select('id')
      .limit(1);

    if (testError && testError.code === '42P01') {
      // Tabela não existe — criar via SQL
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `CREATE TABLE IF NOT EXISTS briefing_feedback (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          medico_nome text,
          responsavel text,
          avaliacao text CHECK (avaliacao IN ('util', 'impreciso')),
          comentario text,
          briefing_resumo text,
          created_at timestamptz DEFAULT now()
        );`
      });
      if (createError) return res.status(500).json({ error: 'Criar tabela: ' + createError.message });
      return res.status(200).json({ created: true });
    }

    return res.status(200).json({ exists: true, error: testError?.message || null });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
