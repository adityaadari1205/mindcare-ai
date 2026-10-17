/**
 * MindCare AI - Express Server
 * Mental Health Awareness & Suicide Prevention Agent
 * Powered by IBM Granite + IBM WatsonX
 */

require('dotenv').config({ path: './config.env' });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// ─── Request Logging ─────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── Serve Frontend ───────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', available_prefix: '/api' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'If you are in crisis, call 988 immediately.'
  });
});

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║      MindCare AI - Mental Health Support Agent       ║');
  console.log('║      Powered by IBM Granite + IBM WatsonX            ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`\n🟢 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`💙 Health check: http://localhost:${PORT}/api/health`);
  console.log('\n⚠️  DISCLAIMER: This AI is a support tool ONLY.');
  console.log('   For crisis help: Call 988 or Text HOME to 741741\n');
});

module.exports = app;
