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

  const apiKey = process.env.DATA_GOV_SG_API_KEY;

  // Compute 6-month historical cutoff (e.g., if now is 2026-09, cutoff is 2026-03)
  const now = new Date();
  const past6MonthDate = new Date(now);
  past6MonthDate.setMonth(past6MonthDate.getMonth() - 6);
  const cutoffMonth = past6MonthDate.toISOString().slice(0, 7);

  const limit = Math.min(Number(req.query.limit) || 200, 1000);
  const townFilter = req.query.town ? req.query.town.toString().toUpperCase() : null;

  try {
    const datasetId = 'd_8b842a20b33069589255812f5e669124';
    let url = `https://data.gov.sg/api/action/datastore_search?resource_id=${datasetId}&limit=${limit}&sort=month desc`;

    if (townFilter && townFilter !== 'ALL') {
      url += `&q=${encodeURIComponent(townFilter)}`;
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': 'DataGovOneMap-Hybrid-App/1.0',
    };

    if (apiKey && apiKey.trim() !== '') {
      headers['api-key'] = apiKey;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Data.gov.sg API returned HTTP ${response.status}`,
        details: await response.text().catch(() => 'No response body'),
      });
    }

    const json = await response.json();
    if (!json.success || !json.result || !Array.isArray(json.result.records)) {
      return res.status(502).json({
        error: 'Data.gov.sg response payload missing records array',
        raw: json,
      });
    }

    // Filter strictly to past 6 months
    const records = json.result.records.filter((rec: any) => {
      if (!rec.month) return true;
      return rec.month >= cutoffMonth;
    });

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');
    return res.status(200).json({
      success: true,
      timeframe: 'Past 6 Months',
      cutoffMonth,
      total_in_batch: records.length,
      records,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Failed to fetch HDB resale transactions from Data.gov.sg',
      message: error.message || 'Unknown error',
    });
  }
}
