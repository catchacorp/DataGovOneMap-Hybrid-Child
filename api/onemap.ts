import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const { searchVal, postal, query } = req.query;
  const searchQuery = (searchVal || postal || query || '').toString().trim();

  if (!searchQuery) {
    return res.status(400).json({
      error: 'Query parameter required. Provide ?searchVal=... or ?postal=...'
    });
  }

  const apiKey = process.env.ONEMAP_API_KEY;

  try {
    const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(
      searchQuery
    )}&returnGeom=Y&getAddrDetails=Y`;

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': 'DataGovOneMap-Hybrid-App/1.0',
    };

    if (apiKey && apiKey.trim() !== '') {
      headers['Authorization'] = apiKey.startsWith('Bearer') ? apiKey : `Bearer ${apiKey}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `OneMap API responded with HTTP status ${response.status}`,
        details: await response.text().catch(() => 'No response body'),
      });
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({
      error: 'Failed to query SLA OneMap upstream service',
      message: error.message || 'Unknown error',
    });
  }
}
