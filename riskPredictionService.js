/**
 * Risk Prediction & Alert System
 * Monitors conversation patterns and predicts stress peaks
 */

const { v4: uuidv4 } = require('uuid');

// In-memory storage (would use persistent DB in production)
const sessionStore = new Map();
const alertLog = [];

/**
 * Initialize or retrieve a user session
 */
function getOrCreateSession(sessionId) {
  if (!sessionStore.has(sessionId)) {
    sessionStore.set(sessionId, {
      sessionId,
      createdAt: new Date().toISOString(),
      messages: [],
      riskHistory: [],
      currentRiskScore: 0,
      consentGiven: false,
      alertsIssued: 0,
      wellnessCheckins: 0
    });
  }
  return sessionStore.get(sessionId);
}

/**
 * Map risk level string to numeric score
 */
function riskLevelToScore(level) {
  const map = { none: 0, low: 25, medium: 50, high: 75, critical: 100 };
  return map[level] || 0;
}

/**
 * Map numeric score back to level string
 */
function scoreToRiskLevel(score) {
  if (score >= 90) return 'critical';
  if (score >= 65) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 15) return 'low';
  return 'none';
}

/**
 * Update session with new message and risk data
 */
function updateSession(sessionId, message, riskLevel) {
  const session = getOrCreateSession(sessionId);
  const riskScore = riskLevelToScore(riskLevel);

  session.messages.push({
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    content: message,
    riskScore
  });

  session.riskHistory.push({
    timestamp: new Date().toISOString(),
    score: riskScore,
    level: riskLevel
  });

  // Rolling weighted average (more recent = higher weight)
  const recent = session.riskHistory.slice(-5);
  const weightedSum = recent.reduce((acc, r, i) => acc + r.score * (i + 1), 0);
  const weightTotal = recent.reduce((acc, _, i) => acc + (i + 1), 0);
  session.currentRiskScore = Math.round(weightedSum / weightTotal);

  sessionStore.set(sessionId, session);
  return session;
}

/**
 * Predict stress trajectory based on conversation history
 */
function predictStressTrend(sessionId) {
  const session = sessionStore.get(sessionId);
  if (!session || session.riskHistory.length < 2) {
    return { trend: 'insufficient_data', prediction: 'Need more conversation history' };
  }

  const history = session.riskHistory.slice(-6);
  const scores = history.map(r => r.score);

  // Linear trend calculation
  const n = scores.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = scores.reduce((a, b) => a + b, 0);
  const sumXY = scores.reduce((acc, s, i) => acc + i * s, 0);
  const sumX2 = Array.from({ length: n }, (_, i) => i * i).reduce((a, b) => a + b, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  let trend, recommendation;

  if (slope > 5) {
    trend = 'escalating';
    recommendation = 'Risk is increasing. Consider reaching out to a professional or calling a helpline.';
  } else if (slope > 0) {
    trend = 'slightly_increasing';
    recommendation = 'Mood seems slightly lower. Try a breathing exercise or reach out to someone you trust.';
  } else if (slope < -5) {
    trend = 'improving';
    recommendation = 'Great progress! Keep using your coping strategies.';
  } else {
    trend = 'stable';
    recommendation = 'Things seem stable. Remember to practice daily self-care.';
  }

  const predictedNext = Math.min(100, Math.max(0, scores[scores.length - 1] + slope));

  return {
    trend,
    slope: Math.round(slope * 100) / 100,
    currentScore: session.currentRiskScore,
    currentLevel: scoreToRiskLevel(session.currentRiskScore),
    predictedNextScore: Math.round(predictedNext),
    predictedNextLevel: scoreToRiskLevel(predictedNext),
    recommendation,
    dataPoints: scores.length
  };
}

/**
 * Check if an alert should be issued
 */
function checkAndIssueAlert(sessionId, riskLevel) {
  const session = getOrCreateSession(sessionId);
  
  if (!session.consentGiven && riskLevel === 'critical') {
    // Override consent for critical situations
    return issueAlert(sessionId, riskLevel, 'Critical risk detected — immediate support resources provided.');
  }

  if (!session.consentGiven) return null;

  if (riskLevel === 'critical' || riskLevel === 'high') {
    return issueAlert(sessionId, riskLevel, `${riskLevel.toUpperCase()} distress level detected in conversation.`);
  }

  // Check trend escalation
  const trend = predictStressTrend(sessionId);
  if (trend.trend === 'escalating' && session.currentRiskScore >= 60) {
    return issueAlert(sessionId, 'escalating', 'Conversation showing escalating distress pattern.');
  }

  return null;
}

/**
 * Issue an alert
 */
function issueAlert(sessionId, severity, reason) {
  const alert = {
    id: uuidv4(),
    sessionId,
    severity,
    reason,
    timestamp: new Date().toISOString(),
    resources: getCrisisResources(),
    acknowledged: false
  };

  alertLog.push(alert);

  const session = sessionStore.get(sessionId);
  if (session) {
    session.alertsIssued++;
    sessionStore.set(sessionId, session);
  }

  return alert;
}

/**
 * Get crisis resources for alerts
 */
function getCrisisResources() {
  return [
    { name: 'Suicide & Crisis Lifeline', contact: '988 (call/text)', available: '24/7', url: 'https://988lifeline.org' },
    { name: 'Crisis Text Line', contact: 'Text HOME to 741741', available: '24/7', url: 'https://crisistextline.org' },
    { name: 'International Hotlines', contact: 'https://www.iasp.info/resources/Crisis_Centres/', available: 'varies', url: 'https://www.iasp.info/resources/Crisis_Centres/' },
    { name: 'Emergency Services', contact: '911 (US) / 999 (UK) / 112 (EU)', available: '24/7', url: null }
  ];
}

/**
 * Set user consent for monitoring
 */
function setConsent(sessionId, consent) {
  const session = getOrCreateSession(sessionId);
  session.consentGiven = consent;
  sessionStore.set(sessionId, session);
  return session;
}

/**
 * Get session summary
 */
function getSessionSummary(sessionId) {
  const session = sessionStore.get(sessionId);
  if (!session) return null;

  const trend = session.riskHistory.length >= 2 ? predictStressTrend(sessionId) : null;

  return {
    sessionId: session.sessionId,
    duration: Math.round((Date.now() - new Date(session.createdAt).getTime()) / 60000),
    messageCount: session.messages.length,
    currentRiskScore: session.currentRiskScore,
    currentRiskLevel: scoreToRiskLevel(session.currentRiskScore),
    trend,
    alertsIssued: session.alertsIssued,
    consentGiven: session.consentGiven,
    startedAt: session.createdAt
  };
}

/**
 * Generate wellness check-in prompts based on time patterns
 */
function generateCheckInPrompt(sessionId) {
  const session = getOrCreateSession(sessionId);
  const hour = new Date().getHours();
  
  let prompt;
  if (hour >= 6 && hour < 10) {
    prompt = "Good morning! How are you feeling as you start your day? Taking a moment to check in with yourself sets a positive tone. 🌅";
  } else if (hour >= 14 && hour < 16) {
    prompt = "Afternoon check-in: How's your energy and mood midday? This is a great time for a short mindfulness break. ☀️";
  } else if (hour >= 20 && hour < 23) {
    prompt = "Evening reflection: How did your day go? What's one thing you're grateful for today? 🌙";
  } else {
    prompt = "I'm here if you'd like to share how you're feeling. Your mental well-being matters. 💙";
  }

  session.wellnessCheckins++;
  sessionStore.set(sessionId, session);
  return prompt;
}

module.exports = {
  getOrCreateSession,
  updateSession,
  predictStressTrend,
  checkAndIssueAlert,
  issueAlert,
  getCrisisResources,
  setConsent,
  getSessionSummary,
  generateCheckInPrompt,
  scoreToRiskLevel,
  alertLog
};
