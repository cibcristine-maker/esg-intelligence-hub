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

  // APP_USERS = JSON string: {"marcell":"senha1","fernanda":"senha2",...}
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
  const expectedPassword = users[userKey];

  if (!expectedPassword || password !== expectedPassword) {
    return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
  }

  const token = Buffer.from(userKey + '-' + Date.now()).toString('base64');
  return res.status(200).json({ ok: true, token, displayName: username });
}
