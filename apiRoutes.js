/**
 * API Routes - Mental Health AI Agent
 */

const express = require('express');
const router = express.Router();
const { processMessage, processJournalEntry, createWellnessPlan, getConversationHistory, clearSession } = require('../services/conversationService');
const { getSessionSummary, predictStressTrend, setConsent, getCrisisResources, generateCheckInPrompt } = require('../services/riskPredictionService');
const { getHelplines, getCrisisHelplines, getOnlineTherapyOptions, getMindfulnessApps, getSmartRecommendations } = require('../services/resourceService');
const { getResourcesByCategory, getCategories } = require('../rag/ragSystem');
const { generateRiskAssessment } = require('../agents/ibmGraniteAgent');

// ─── Chat Endpoint ───────────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({ error: 'sessionId and message are required' });
  }

  if (message.trim().length === 0) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  try {
    const result = await processMessage(sessionId, message);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to process message',
      response: 'I apologize — I experienced a technical issue. If you are in crisis, please call 988 or text HOME to 741741 immediately.',
      isCrisis: false
    });
  }
});

// ─── Journal Analysis ────────────────────────────────────────────────────────
router.post('/journal/analyze', async (req, res) => {
  const { sessionId, journalText } = req.body;

  if (!sessionId || !journalText) {
    return res.status(400).json({ error: 'sessionId and journalText are required' });
  }

  try {
    const analysis = await processJournalEntry(sessionId, journalText);
    res.json({ success: true, analysis, sessionId, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Journal error:', error);
    res.status(500).json({ success: false, error: 'Could not analyze journal entry' });
  }
});

// ─── Wellness Plan ───────────────────────────────────────────────────────────
router.post('/wellness/plan', async (req, res) => {
  const { sessionId, preferences } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  try {
    const plan = await createWellnessPlan(sessionId, preferences || {});
    res.json({ success: true, plan, sessionId, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Wellness plan error:', error);
    res.status(500).json({ success: false, error: 'Could not generate wellness plan' });
  }
});

// ─── Session Analytics ───────────────────────────────────────────────────────
router.get('/session/:sessionId/summary', (req, res) => {
  const { sessionId } = req.params;
  const summary = getSessionSummary(sessionId);

  if (!summary) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({ success: true, summary });
});

router.get('/session/:sessionId/trend', (req, res) => {
  const { sessionId } = req.params;
  try {
    const trend = predictStressTrend(sessionId);
    res.json({ success: true, trend });
  } catch (error) {
    res.status(500).json({ error: 'Could not compute trend' });
  }
});

router.get('/session/:sessionId/history', (req, res) => {
  const { sessionId } = req.params;
  const history = getConversationHistory(sessionId);
  res.json({ success: true, history, count: history.length });
});

router.delete('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  clearSession(sessionId);
  res.json({ success: true, message: 'Session cleared' });
});

// ─── Consent Management ───────────────────────────────────────────────────────
router.post('/session/:sessionId/consent', (req, res) => {
  const { sessionId } = req.params;
  const { consent } = req.body;

  if (typeof consent !== 'boolean') {
    return res.status(400).json({ error: 'consent must be a boolean' });
  }

  const session = setConsent(sessionId, consent);
  res.json({
    success: true,
    message: consent ? 'Thank you for enabling proactive monitoring. We will alert you when we detect elevated distress.' : 'Monitoring disabled. You can re-enable anytime.',
    consentGiven: session.consentGiven
  });
});

// ─── Check-in ────────────────────────────────────────────────────────────────
router.get('/session/:sessionId/checkin', (req, res) => {
  const { sessionId } = req.params;
  const prompt = generateCheckInPrompt(sessionId);
  res.json({ success: true, prompt, sessionId, timestamp: new Date().toISOString() });
});

// ─── Risk Assessment ─────────────────────────────────────────────────────────
router.post('/risk/assess', async (req, res) => {
  const { sessionId, conversationSummary } = req.body;

  if (!conversationSummary) {
    return res.status(400).json({ error: 'conversationSummary is required' });
  }

  try {
    const assessment = await generateRiskAssessment(conversationSummary);
    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Risk assessment unavailable' });
  }
});

// ─── Resources ───────────────────────────────────────────────────────────────
router.get('/resources/helplines', (req, res) => {
  const { country } = req.query;
  const helplines = country ? getHelplines(country) : getCrisisHelplines();
  res.json({ success: true, helplines });
});

router.get('/resources/crisis', (req, res) => {
  res.json({ success: true, resources: getCrisisResources() });
});

router.get('/resources/therapy', (req, res) => {
  res.json({ success: true, resources: getOnlineTherapyOptions() });
});

router.get('/resources/apps', (req, res) => {
  res.json({ success: true, resources: getMindfulnessApps() });
});

router.get('/resources/recommend', (req, res) => {
  const { riskLevel } = req.query;
  const recommendations = getSmartRecommendations(riskLevel || 'low');
  res.json({ success: true, recommendations });
});

router.get('/resources/knowledge', (req, res) => {
  const { category } = req.query;
  const categories = getCategories();

  if (category) {
    const docs = getResourcesByCategory(category);
    return res.json({ success: true, category, documents: docs, available_categories: categories });
  }

  res.json({ success: true, available_categories: categories });
});

// ─── Health Check ────────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MindCare AI - Mental Health Support Agent',
    version: '1.0.0',
    powered_by: 'IBM Granite + IBM WatsonX',
    timestamp: new Date().toISOString(),
    disclaimer: 'This AI is a support tool only. For crisis help: call 988 or text HOME to 741741'
  });
});

module.exports = router;
