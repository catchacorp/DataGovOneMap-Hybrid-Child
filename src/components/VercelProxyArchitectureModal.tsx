import React, { useState } from 'react';
import {
  Server,
  Shield,
  Key,
  Copy,
  Check,
  Code2,
  Terminal,
  Activity,
  FileCode,
  Layers,
  X,
} from 'lucide-react';

interface VercelProxyArchitectureModalProps {
  onClose: () => void;
}

export const VercelProxyArchitectureModal: React.FC<VercelProxyArchitectureModalProps> = ({
  onClose,
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'onemap' | 'datagov' | 'vercel' | 'env'>('onemap');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live test simulation
  const [testEndpoint, setTestEndpoint] = useState<'onemap' | 'datagov'>('onemap');
  const [testPostal, setTestPostal] = useState('570510');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [isLoadingTest, setIsLoadingTest] = useState(false);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunMockApiTest = () => {
    setIsLoadingTest(true);
    setTestResponse(null);

    setTimeout(() => {
      if (testEndpoint === 'onemap') {
        setTestResponse({
          status: 200,
          latencyMs: 142,
          source: 'https://www.onemap.gov.sg/api/common/elastic/search',
          results: {
            SEARCHVAL: '510 BISHAN STREET 13',
            BLK_NO: '510',
            ROAD_NAME: 'BISHAN STREET 13',
            BUILDING: 'HDB-BISHAN',
            POSTAL: testPostal,
            LATITUDE: '1.3491428',
            LONGITUDE: '103.8488219',
            X: '29812.43',
            Y: '36412.19',
          },
          security: 'Bearer Token verified server-side; 0 client credential leakage',
        });
      } else {
        setTestResponse({
          status: 200,
          latencyMs: 185,
          source: 'https://data.gov.sg/api/action/datastore_search',
          resource_id: 'd_8b842a20b33069589255812f5e669124',
          filter_applied: 'Strict past 6-month transactions',
          records_returned: 100,
          sample_record: {
            month: '2026-03',
            town: 'BISHAN',
            flat_type: '4 ROOM',
            block: '510',
            street_name: 'BISHAN ST 13',
            resale_price: '788000',
            remaining_lease: '74 years 08 months',
          },
        });
      }
      setIsLoadingTest(false);
    }, 600);
  };

  const onemapCode = `// api/onemap.ts - Vercel Serverless Function
// SECURE SERVER PROXY: Protects OneMap credentials from browser inspection

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS & Method Check
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { searchVal, postal } = req.query;
  const query = (searchVal || postal || '').toString().trim();

  if (!query) {
    return res.status(400).json({ error: 'Search value or postal code required' });
  }

  const apiKey = process.env.ONEMAP_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'OneMap API key not configured in server environment variables.'
    });
  }

  try {
    const url = \`https://www.onemap.gov.sg/api/common/elastic/search?searchVal=\${encodeURIComponent(query)}&returnGeom=Y&getAddrDetails=Y\`;
    const response = await fetch(url, {
      headers: {
        'Authorization': \`Bearer \${apiKey}\`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(\`Upstream OneMap returned \${response.status}\`);
    }

    const data = await response.json();
    // Cache response for 1 hour at edge
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to query SLA OneMap' });
  }
}`;

  const datagovCode = `// api/datagov.ts - Vercel Serverless Function
// Fetches official HDB Resale transactions, filtered strictly to past 6 months

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.DATA_GOV_SG_API_KEY;
  
  // Calculate rolling 6 months cutoff date
  const now = new Date();
  now.setMonth(now.getMonth() - 6);
  const cutoffMonth = now.toISOString().slice(0, 7); // e.g. "2025-09"

  try {
    // Official Singapore HDB Resale Prices dataset
    const datasetId = "d_8b842a20b33069589255812f5e669124";
    const apiUrl = \`https://data.gov.sg/api/action/datastore_search?resource_id=\${datasetId}&limit=500\`;

    const response = await fetch(apiUrl, {
      headers: apiKey ? { 'api-key': apiKey } : {}
    });

    const data = await response.json();
    if (!data.success) {
      return res.status(502).json({ error: "Data.gov.sg query failed" });
    }

    // Filter strictly for records within past 6 months
    const recentRecords = data.result.records.filter((rec: any) => rec.month >= cutoffMonth);

    // Edge cache for 10 minutes
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
    return res.status(200).json({
      status: "success",
      timeframe: "Past 6 Months",
      cutoffMonth,
      count: recentRecords.length,
      records: recentRecords
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch HDB transactions from upstream" });
  }
}`;

  const vercelJsonCode = `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    { "source": "/api/onemap", "destination": "/api/onemap.ts" },
    { "source": "/api/datagov", "destination": "/api/datagov.ts" }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS" }
      ]
    }
  ]
}`;

  const envGuide = `# .env (Vercel Project Settings -> Environment Variables)

# 1. SLA OneMap API Token
# Register on https://www.onemap.gov.sg/apidocs/
ONEMAP_API_KEY=eyJhbGciOi...

# 2. Data.gov.sg Developer API Key
# Optional for low traffic, recommended for production rate limits
DATA_GOV_SG_API_KEY=govsg_live_...

# Note: In Vite SPA, never prefix these with VITE_ to prevent client-side bundle leakage!`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-700 overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Vercel Serverless Proxy Architecture
              </h3>
              <p className="text-xs text-slate-400">
                Secure backend proxy routing for SLA OneMap & Data.gov.sg APIs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Security Banner */}
          <div className="bg-indigo-950/60 border border-indigo-500/40 rounded-xl p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-bold text-indigo-200">
                Zero Client Key Exposure Architecture
              </div>
              <p className="text-slate-300 leading-relaxed">
                By routing requests through lightweight edge serverless functions (<code className="text-indigo-300">/api/onemap</code> and <code className="text-indigo-300">/api/datagov</code>), sensitive government API credentials never leak into client-side JavaScript bundles or browser network tabs.
              </p>
            </div>
          </div>

          {/* Code Viewer Tabs */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            {/* Tabs Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveCodeTab('onemap')}
                  className={`px-3 py-1.5 rounded-lg font-mono transition ${
                    activeCodeTab === 'onemap'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  api/onemap.ts
                </button>
                <button
                  onClick={() => setActiveCodeTab('datagov')}
                  className={`px-3 py-1.5 rounded-lg font-mono transition ${
                    activeCodeTab === 'datagov'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  api/datagov.ts
                </button>
                <button
                  onClick={() => setActiveCodeTab('vercel')}
                  className={`px-3 py-1.5 rounded-lg font-mono transition ${
                    activeCodeTab === 'vercel'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  vercel.json
                </button>
                <button
                  onClick={() => setActiveCodeTab('env')}
                  className={`px-3 py-1.5 rounded-lg font-mono transition ${
                    activeCodeTab === 'env'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  .env.example
                </button>
              </div>

              <button
                onClick={() => {
                  const code =
                    activeCodeTab === 'onemap'
                      ? onemapCode
                      : activeCodeTab === 'datagov'
                      ? datagovCode
                      : activeCodeTab === 'vercel'
                      ? vercelJsonCode
                      : envGuide;
                  copyToClipboard(code, activeCodeTab);
                }}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
              >
                {copiedKey === activeCodeTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="p-4 overflow-x-auto max-h-72 custom-scrollbar">
              <pre className="font-mono text-xs text-slate-300 leading-relaxed">
                {activeCodeTab === 'onemap' && onemapCode}
                {activeCodeTab === 'datagov' && datagovCode}
                {activeCodeTab === 'vercel' && vercelJsonCode}
                {activeCodeTab === 'env' && envGuide}
              </pre>
            </div>
          </div>

          {/* Interactive Live Proxy Simulator */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Proxy Route Tester
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Mock Gateway Engine</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={testEndpoint}
                onChange={(e) => setTestEndpoint(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2"
              >
                <option value="onemap">GET /api/onemap (SLA Geocoding)</option>
                <option value="datagov">GET /api/datagov (Past 6M Resale)</option>
              </select>

              {testEndpoint === 'onemap' && (
                <input
                  type="text"
                  placeholder="Singapore Postal Code (e.g. 570510)"
                  value={testPostal}
                  onChange={(e) => setTestPostal(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 font-mono"
                />
              )}

              <button
                onClick={handleRunMockApiTest}
                disabled={isLoadingTest}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg px-4 py-2 transition flex items-center justify-center space-x-1.5"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{isLoadingTest ? 'Executing Request...' : 'Send Proxy Request'}</span>
              </button>
            </div>

            {testResponse && (
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto max-h-48 custom-scrollbar">
                <div className="text-[10px] text-slate-500 mb-1">HTTP 200 OK • Response JSON</div>
                <pre>{JSON.stringify(testResponse, null, 2)}</pre>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
