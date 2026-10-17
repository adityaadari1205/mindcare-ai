/**
 * Conversation Service
 * Orchestrates the full conversation pipeline: RAG → Granite → Risk Assessment
 */

const { processWithRAG } = require('../rag/ragSystem');
const { generateEmpathyResponse, generateRiskAssessment, generateWellnessPlan, analyzeJournalEntry } = require('../agents/ibmGraniteAgent');
const { updateSession, checkAndIssueAlert, getSessionSummary, predictStressTrend } = require('./riskPredictionService');

// In-memory conversation history per session
const conversationHistories = new Map();

/**
 * Process a user message through the full pipeline
 */
async function processMessage(sessionId, userMessage) {
  // Step 1: RAG - detect distress signals & retrieve context
  const ragContext = processWithRAG(userMessage);

  // Step 2: Update session with risk data
  const session = updateSession(sessionId, userMessage, ragContext.riskLevel);

  // Step 3: Check for alerts
  const alert = checkAndIssueAlert(sessionId, ragContext.riskLevel);

  // Step 4: Get/update conversation history
  const history = conversationHistories.get(sessionId) || [];

  // Step 5: Generate empathetic AI response via IBM Granite
  let aiResponse;
  let usedFallback = false;

  try {
    aiResponse = await generateEmpathyResponse(userMessage, ragContext, history.slice(-6));
  } catch (error) {
    console.error('Granite API error:', error.message);
    aiResponse = buildFallbackResponse(ragContext);
    usedFallback = true;
  }

  // Step 6: Update conversation history
  history.push({ role: 'user', content: userMessage });
  history.push({ role: 'assistant', content: aiResponse });
  if (history.length > 20) history.splice(0, 2); // Keep last 10 exchanges
  conversationHistories.set(sessionId, history);

  // Step 7: Build trend prediction if enough data
  const sessionSummary = getSessionSummary(sessionId);

  return {
    sessionId,
    response: aiResponse,
    riskLevel: ragContext.riskLevel,
    isCrisis: ragContext.isCrisis,
    requiresIntervention: ragContext.requiresImmediateIntervention,
    alert: alert || null,
    resources: ragContext.requiresImmediateIntervention ? ragContext.relevantResources.slice(0, 2) : [],
    sessionStats: {
      messageCount: sessionSummary?.messageCount || 0,
      currentRiskScore: sessionSummary?.currentRiskScore || 0,
      trend: sessionSummary?.trend?.trend || 'insufficient_data'
    },
    disclaimer: '⚠️ This AI provides support and information only. It is NOT a substitute for professional medical advice.',
    usedFallback,
    timestamp: new Date().toISOString()
  };
}

/**
 * Fallback response when Granite API is unavailable
 */
function buildFallbackResponse(ragContext) {
  const { riskLevel, empathyStarter, relevantResources } = ragContext;

  let response = `${empathyStarter}\n\n`;

  if (riskLevel === 'critical' || riskLevel === 'high') {
    response += `I can hear that you're in a lot of pain right now. Please know that help is available right now:\n\n`;
    response += `📞 **988 Suicide & Crisis Lifeline**: Call or text 988 (available 24/7)\n`;
    response += `💬 **Crisis Text Line**: Text HOME to 741741\n\n`;
    response += `You are not alone in this. These trained counselors are ready to listen and help you through this moment.\n\n`;
  } else if (riskLevel === 'medium') {
    response += `What you're feeling is valid, and reaching out takes courage. `;
    if (relevantResources.length > 0) {
      response += `Here's something that might help: ${relevantResources[0].content}\n\n`;
    }
  } else {
    if (relevantResources.length > 0) {
      response += relevantResources[0].content + '\n\n';
    }
    response += `I'm here to listen. Would you like to share more about what you're going through?\n\n`;
  }

  response += `⚠️ *I am an AI support tool and not a substitute for professional mental health care. Please consider speaking with a licensed therapist or counselor.*`;

  return response;
}

/**
 * Process a journal entry
 */
async function processJournalEntry(sessionId, journalText) {
  let analysis;
  try {
    analysis = await analyzeJournalEntry(journalText);
  } catch (error) {
    console.error('Journal analysis error:', error.message);
    const { analyzeJournalWithRAG } = require('../rag/ragSystem');
    const ragAnalysis = analyzeJournalWithRAG(journalText);
    analysis = {
      emotional_themes: ['analysis unavailable'],
      distress_signals: [],
      risk_level: ragAnalysis.riskLevel,
      empathetic_reflection: ragAnalysis.empathyStarter,
      positive_indicators: [],
      suggested_resources: ragAnalysis.relevantResources.map(r => r.id)
    };
  }

  // Update session risk
  if (analysis.risk_level) {
    updateSession(sessionId, journalText, analysis.risk_level);
    const alert = checkAndIssueAlert(sessionId, analysis.risk_level);
    return { ...analysis, alert };
  }

  return analysis;
}

/**
 * Generate a personalized wellness plan
 */
async function createWellnessPlan(sessionId, preferences = {}) {
  const summary = getSessionSummary(sessionId);
  const trend = summary?.trend;

  const userProfile = {
    currentMood: summary?.currentRiskLevel || 'unknown',
    recentTrend: trend?.trend || 'unknown',
    preferences: preferences
  };

  try {
    return await generateWellnessPlan(userProfile);
  } catch (error) {
    return `Here's a simple 7-day wellness starter plan:\n
Day 1-2: Focus on sleep. Aim for 7-8 hours. Set a consistent bedtime.\n
Day 3-4: Add 20 minutes of gentle movement — a walk, yoga, or stretching.\n
Day 5: Reach out to one friend or family member.\n
Day 6: Try a 5-minute breathing exercise (4-7-8 technique).\n
Day 7: Write down 3 things you're grateful for.\n\nRepeat and build from here! 💙`;
  }
}

/**
 * Get full conversation history for session
 */
function getConversationHistory(sessionId) {
  return conversationHistories.get(sessionId) || [];
}

/**
 * Clear session data
 */
function clearSession(sessionId) {
  conversationHistories.delete(sessionId);
  return true;
}

module.exports = {
  processMessage,
  processJournalEntry,
  createWellnessPlan,
  getConversationHistory,
  clearSession
};
