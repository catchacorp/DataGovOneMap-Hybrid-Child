import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow CORS
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

  const timestamp = new Date().toISOString();
  const startTime = Date.now();

  const onemapKeyConfigured = Boolean(process.env.ONEMAP_API_KEY && process.env.ONEMAP_API_KEY.trim() !== '');
  const datagovKeyConfigured = Boolean(process.env.DATA_GOV_SG_API_KEY && process.env.DATA_GOV_SG_API_KEY.trim() !== '');

  // Connectivity tests
  let onemapStatus = 'unknown';
  let onemapLatencyMs = 0;
  let datagovStatus = 'unknown';
  let datagovLatencyMs = 0;

  // 1. Check SLA OneMap API
  try {
    const t0 = Date.now();
    const testUrl = 'https://www.onemap.gov.sg/api/common/elastic/search?searchVal=Bishan&returnGeom=Y&getAddrDetails=Y';
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    if (onemapKeyConfigured) {
      const key = process.env.ONEMAP_API_KEY!;
      headers['Authorization'] = key.startsWith('Bearer') ? key : `Bearer ${key}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const omRes = await fetch(testUrl, { headers, signal: controller.signal });
    clearTimeout(timeout);

    onemapLatencyMs = Date.now() - t0;
    onemapStatus = omRes.ok ? 'connected' : `upstream_${omRes.status}`;
  } catch (err: any) {
    onemapStatus = `error: ${err.message || 'connection_failed'}`;
  }

  // 2. Check Data.gov.sg API
  try {
    const t0 = Date.now();
    const datasetId = 'd_8b842a20b33069589255812f5e669124';
    const testUrl = `https://data.gov.sg/api/action/datastore_search?resource_id=${datasetId}&limit=1`;
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    if (datagovKeyConfigured) {
      headers['api-key'] = process.env.DATA_GOV_SG_API_KEY!;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const dgRes = await fetch(testUrl, { headers, signal: controller.signal });
    clearTimeout(timeout);

    datagovLatencyMs = Date.now() - t0;
    datagovStatus = dgRes.ok ? 'connected' : `upstream_${dgRes.status}`;
  } catch (err: any) {
    datagovStatus = `error: ${err.message || 'connection_failed'}`;
  }

  const totalLatencyMs = Date.now() - startTime;

  return res.status(200).json({
    status: 'healthy',
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'production',
    timestamp,
    totalLatencyMs,
    routes: {
      health: '/api/health',
      onemap_proxy: '/api/onemap',
      datagov_proxy: '/api/datagov'
    },
    credentials: {
      onemap_api_key_configured: onemapKeyConfigured,
      datagov_api_key_configured: datagovKeyConfigured
    },
    services: {
      onemap: {
        endpoint: 'https://www.onemap.gov.sg/api/common/elastic/search',
        status: onemapStatus,
        latencyMs: onemapLatencyMs
      },
      datagov: {
        endpoint: 'https://data.gov.sg/api/action/datastore_search',
        status: datagovStatus,
        latencyMs: datagovLatencyMs
      }
    }
  });
}
