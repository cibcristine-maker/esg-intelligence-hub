export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password } = req.body || {};
  const correctPassword = process.env.APP_PASSWORD;

  if (!correctPassword) {
    return res.status(500).json({ error: 'APP_PASSWORD não configurada no Vercel.' });
  }

  if (!password || password !== correctPassword) {
    return res.status(401).json({ error: 'Senha incorreta.' });
  }

  return res.status(200).json({ ok: true, token: Buffer.from('esg-hub-' + Date.now()).toString('base64') });
}
