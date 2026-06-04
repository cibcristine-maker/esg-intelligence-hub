export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt vazio' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key não configurada. Acesse console.anthropic.com.' });
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      const errType = data.error?.type || '';
      const errMsg = data.error?.message || JSON.stringify(data);
      if (errType === 'authentication_error') {
        return res.status(401).json({ error: 'Chave de API inválida. Verifique em console.anthropic.com' });
      }
      if (errType === 'billing_error' || errMsg.includes('credit') || errMsg.includes('billing')) {
        return res.status(402).json({ error: 'Créditos esgotados. Recarregue em console.anthropic.com/billing' });
      }
      if (errType === 'overloaded_error') {
        return res.status(503).json({ error: 'Serviço sobrecarregado. Tente em alguns segundos.' });
      }
      return res.status(500).json({ error: errMsg });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message || 'Erro desconhecido' });
  }
}
