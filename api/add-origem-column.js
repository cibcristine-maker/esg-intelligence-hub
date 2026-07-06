export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vumtiszgrcjzgekkpgmp.supabase.co';
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const ANON_KEY = process.env.SUPABASE_ANON_KEY;

  const debug = {
    hasServiceKey: !!SERVICE_KEY,
    hasAnonKey: !!ANON_KEY,
  };

  if (!SERVICE_KEY) {
    return res.status(500).json({
      error: 'SUPABASE_SERVICE_KEY não está configurada nas variáveis de ambiente do Vercel.',
      debug,
    });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Tenta via RPC exec_sql (pode não existir)
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `ALTER TABLE visitas ADD COLUMN IF NOT EXISTS origem_esg_realizados jsonb;`
    });

    if (error) {
      return res.status(500).json({
        error: error.message,
        hint: error.hint || null,
        details: error.details || null,
        debug,
      });
    }

    return res.status(200).json({ ok: true, data, debug });
  } catch (e) {
    return res.status(500).json({
      error: e.message,
      stack: e.stack,
      debug,
    });
  }
}
