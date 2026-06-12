export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuário e senha obrigatórios.' });
  }

  // APP_USERS supports two formats:
  // Legacy:  {"marcell":"senha1"}  → role defaults to "bsci"
  // New:     {"marcell":{"senha":"senha1","role":"bsci","tenant":"bsci"}}
  const usersRaw = process.env.APP_USERS;
  if (!usersRaw) {
    return res.status(500).json({ error: 'APP_USERS não configurado no Vercel.' });
  }

  let users;
  try {
    users = JSON.parse(usersRaw);
  } catch (e) {
    return res.status(500).json({ error: 'APP_USERS com formato inválido.' });
  }

  const userKey = username.toLowerCase().trim();
  const userEntry = users[userKey];

  if (!userEntry) {
    return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
  }

  // Support both legacy string format and new object format
  let expectedPassword, role, tenant;
  if (typeof userEntry === 'string') {
    expectedPassword = userEntry;
    role = 'bsci';
    tenant = 'bsci';
  } else {
    expectedPassword = userEntry.senha;
    role = userEntry.role || 'bsci';
    tenant = userEntry.tenant || role;
  }

  if (password !== expectedPassword) {
    return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
  }

  const token = Buffer.from(userKey + ':' + role + ':' + tenant + ':' + Date.now()).toString('base64');
  return res.status(200).json({ ok: true, token, displayName: username, role, tenant });
}
