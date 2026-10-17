/**
 * Test Suite - MindCare AI Mental Health Agent
 * Tests RAG system, risk detection, and API endpoints
 */

require('dotenv').config({ path: require('path').join(__dirname, '../config.env') });

const { detectRiskLevel, processWithRAG, analyzeJournalWithRAG } = require('./rag/ragSystem');
const { getOrCreateSession, updateSession, predictStressTrend, checkAndIssueAlert } = require('./services/riskPredictionService');
const { getHelplines, getCrisisHelplines } = require('./services/resourceService');

let passed = 0, failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ FAIL: ${name} — ${e.message}`);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

// ── RAG / Risk Detection Tests ────────────────────────────────────────────
console.log('\n📊 RAG & Risk Detection Tests');

test('detects critical risk from suicidal ideation', () => {
  const level = detectRiskLevel("I want to end my life tonight");
  assert(level === 'critical', `Expected critical, got ${level}`);
});

test('detects high risk from hopelessness', () => {
  const level = detectRiskLevel("I feel completely hopeless and like I'm a burden to everyone");
  assert(level === 'high', `Expected high, got ${level}`);
});

test('detects medium risk from depression mention', () => {
  const level = detectRiskLevel("I've been really depressed and can't sleep");
  assert(level === 'medium', `Expected medium, got ${level}`);
});

test('detects low risk from mild distress', () => {
  const level = detectRiskLevel("I'm feeling a bit sad and lonely today");
  assert(level === 'low', `Expected low, got ${level}`);
});

test('returns none for neutral text', () => {
  const level = detectRiskLevel("I went for a walk today and had lunch");
  assert(level === 'none', `Expected none, got ${level}`);
});

test('RAG pipeline returns correct structure', () => {
  const context = processWithRAG("I feel anxious all the time");
  assert(context.riskLevel, 'Missing riskLevel');
  assert(Array.isArray(context.relevantResources), 'Missing relevantResources');
  assert(context.empathyStarter, 'Missing empathyStarter');
  assert(typeof context.isCrisis === 'boolean', 'Missing isCrisis');
});

test('RAG includes crisis resources for critical risk', () => {
  const context = processWithRAG("I want to kill myself");
  assert(context.isCrisis === true, 'Should be flagged as crisis');
  assert(context.requiresImmediateIntervention === true, 'Should require intervention');
  const hasCrisis = context.relevantResources.some(r => r.category === 'crisis' || r.category === 'suicide_prevention');
  assert(hasCrisis, 'Should include crisis resources');
});

test('Journal RAG analysis returns sentiment', () => {
  const result = analyzeJournalWithRAG("Today was a good day. I feel grateful and happy. The sun was shining.");
  assert(typeof result.sentimentScore === 'number', 'Missing sentimentScore');
  assert(result.sentimentLabel, 'Missing sentimentLabel');
});

// ── Risk Prediction Tests ─────────────────────────────────────────────────
console.log('\n📈 Risk Prediction Tests');

test('creates new session successfully', () => {
  const session = getOrCreateSession('test_session_1');
  assert(session.sessionId === 'test_session_1', 'Session ID mismatch');
  assert(Array.isArray(session.messages), 'Missing messages array');
  assert(session.currentRiskScore === 0, 'Initial risk should be 0');
});

test('updates session risk score', () => {
  const session = updateSession('test_session_2', 'test message', 'high');
  assert(session.riskHistory.length > 0, 'Risk history should be populated');
  assert(session.currentRiskScore > 0, 'Risk score should be updated');
});

test('predicts trend with insufficient data', () => {
  const trend = predictStressTrend('empty_session');
  assert(trend.trend === 'insufficient_data', 'Should return insufficient_data for new session');
});

test('predicts trend with enough data points', () => {
  const sid = 'trend_test_session';
  updateSession(sid, 'msg1', 'low');
  updateSession(sid, 'msg2', 'medium');
  updateSession(sid, 'msg3', 'medium');
  const trend = predictStressTrend(sid);
  assert(trend.trend, 'Should return a trend');
  assert(typeof trend.slope === 'number', 'Should return slope');
  assert(trend.recommendation, 'Should include recommendation');
});

test('issues alert for critical risk', () => {
  const alert = checkAndIssueAlert('alert_test_session', 'critical');
  assert(alert !== null, 'Should issue alert for critical risk');
  assert(alert.severity === 'critical', 'Alert severity should match');
  assert(Array.isArray(alert.resources), 'Alert should include resources');
});

// ── Resource Service Tests ────────────────────────────────────────────────
console.log('\n🔗 Resource Service Tests');

test('returns US helplines', () => {
  const lines = getHelplines('us');
  assert(Array.isArray(lines) && lines.length > 0, 'Should return US helplines');
  assert(lines.some(l => l.name.includes('988') || l.phone === '988'), 'Should include 988');
});

test('returns India helplines', () => {
  const lines = getHelplines('india');
  assert(Array.isArray(lines) && lines.length > 0, 'Should return India helplines');
});

test('returns crisis helplines in multi-region format', () => {
  const crisis = getCrisisHelplines();
  assert(crisis.us && crisis.india && crisis.international, 'Should return multi-region crisis helplines');
});

// ── Summary ───────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('🎉 All tests passed! MindCare AI is ready.');
} else {
  console.log(`⚠️  ${failed} test(s) failed. Check the output above.`);
  process.exit(1);
}
