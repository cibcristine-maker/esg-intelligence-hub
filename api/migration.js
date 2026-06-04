export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabaseUrl = process.env.SUPABASE_URL || 'https://vumtiszgrcjzgekkpgmp.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!serviceKey) return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY não configurada' });

  const r = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      query: "ALTER TABLE perfil_medico ADD COLUMN IF NOT EXISTS novo_medico text DEFAULT NULL;"
    })
  });

  const data = await r.json();
  return res.status(r.ok ? 200 : 500).json(data);
}
