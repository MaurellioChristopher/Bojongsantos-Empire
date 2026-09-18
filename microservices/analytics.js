// ============================================================
// AksesPangan — Ecology & Carbon Analytics Microservice (Port 3004)
// ============================================================

const http = require('http');

const PORT = process.env.PORT || 3004;
const SERVICE_NAME = 'Ecology & Carbon Analytics Service';
const startTime = Date.now();

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check endpoint
  if (req.url === '/health' || req.url === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      service: SERVICE_NAME,
      status: 'healthy',
      port: PORT,
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }));
    return;
  }

  // Info endpoint
  if (req.url === '/' || req.url === '/info') {
    res.writeHead(200);
    res.end(JSON.stringify({
      service: SERVICE_NAME,
      status: 'operational',
      port: PORT,
      features: ['CO2e Reductions Calculation', 'Total Saved Meals Aggregation', 'Economic & Social Impact Telemetry'],
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: `Endpoint not found on ${SERVICE_NAME}` }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 [${SERVICE_NAME}] online on http://0.0.0.0:${PORT}`);
});
