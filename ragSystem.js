/**
 * RAG System - Retrieval Augmented Generation
 * Detects distress signals and retrieves relevant mental health resources
 */

const { KNOWLEDGE_BASE, DISTRESS_SIGNALS, EMPATHY_STARTERS } = require('../data/mentalHealthKnowledgeBase');

/**
 * Detect risk level from text using keyword analysis
 */
function detectRiskLevel(text) {
  const lowerText = text.toLowerCase();
  
  // Check from highest risk to lowest
  for (const [level, keywords] of Object.entries(DISTRESS_SIGNALS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return level;
      }
    }
  }
  return 'none';
}

/**
 * Simple TF-IDF-like scoring for knowledge base retrieval
 */
function computeRelevanceScore(query, document) {
  const queryWords = query.toLowerCase().split(/\s+/);
  const docText = `${document.title} ${document.content} ${document.tags.join(' ')}`.toLowerCase();
  
  let score = 0;
  
  // Tag matching (high weight)
  document.tags.forEach(tag => {
    if (queryWords.some(word => word.includes(tag) || tag.includes(word))) {
      score += 3;
    }
  });
  
  // Content word matching
  queryWords.forEach(word => {
    if (word.length > 3 && docText.includes(word)) {
      score += 1;
    }
  });
  
  // Category matching
  if (queryWords.includes(document.category)) {
    score += 2;
  }
  
  return score;
}

/**
 * Retrieve relevant documents from knowledge base
 */
function retrieveRelevantDocuments(query, riskLevel, topK = 3) {
  const scoredDocs = KNOWLEDGE_BASE.map(doc => ({
    ...doc,
    score: computeRelevanceScore(query, doc)
  }));

  // Always include crisis resources for high/critical risk
  if (riskLevel === 'critical' || riskLevel === 'high') {
    const crisisResources = KNOWLEDGE_BASE.filter(doc => doc.category === 'crisis' || doc.category === 'suicide_prevention');
    const otherDocs = scoredDocs
      .filter(doc => doc.category !== 'crisis' && doc.category !== 'suicide_prevention')
      .sort((a, b) => b.score - a.score)
      .slice(0, topK - crisisResources.length);
    
    return [...crisisResources.slice(0, 2), ...otherDocs];
  }

  // For medium/low/none - return top-scored documents
  return scoredDocs
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Select appropriate empathy starter
 */
function selectEmpathyStarter(riskLevel) {
  const level = riskLevel === 'none' ? 'low' : riskLevel;
  const starters = EMPATHY_STARTERS[level] || EMPATHY_STARTERS.low;
  return starters[Math.floor(Math.random() * starters.length)];
}

/**
 * Build RAG context for AI model
 */
function buildRAGContext(query, riskLevel) {
  const relevantResources = retrieveRelevantDocuments(query, riskLevel);
  const empathyStarter = selectEmpathyStarter(riskLevel);

  const contextText = relevantResources
    .map(doc => `[${doc.category.toUpperCase()}] ${doc.title}: ${doc.content}`)
    .join('\n\n');

  return {
    riskLevel,
    relevantResources,
    empathyStarter,
    contextText
  };
}

/**
 * Full RAG pipeline: analyze input → retrieve context → return enriched context
 */
function processWithRAG(userInput) {
  const riskLevel = detectRiskLevel(userInput);
  const context = buildRAGContext(userInput, riskLevel);

  return {
    ...context,
    isCrisis: riskLevel === 'critical',
    requiresImmediateIntervention: riskLevel === 'critical' || riskLevel === 'high',
    timestamp: new Date().toISOString()
  };
}

/**
 * Analyze a journal entry using RAG
 */
function analyzeJournalWithRAG(journalText) {
  const riskLevel = detectRiskLevel(journalText);
  const context = buildRAGContext(journalText, riskLevel);
  
  // Count sentiment indicators
  const textLower = journalText.toLowerCase();
  const positiveWords = ['happy', 'grateful', 'hope', 'better', 'good', 'love', 'joy', 'calm', 'peaceful', 'excited'];
  const negativeWords = ['sad', 'angry', 'fear', 'hate', 'pain', 'hurt', 'alone', 'empty', 'lost', 'broken'];
  
  const positiveCount = positiveWords.filter(w => textLower.includes(w)).length;
  const negativeCount = negativeWords.filter(w => textLower.includes(w)).length;
  
  const sentimentScore = positiveCount - negativeCount;
  
  return {
    ...context,
    sentimentScore,
    sentimentLabel: sentimentScore > 2 ? 'positive' : sentimentScore < -2 ? 'negative' : 'neutral',
    wordCount: journalText.split(/\s+/).length,
    isCrisis: riskLevel === 'critical',
    requiresImmediateIntervention: riskLevel === 'critical' || riskLevel === 'high'
  };
}

/**
 * Get resources by category
 */
function getResourcesByCategory(category) {
  return KNOWLEDGE_BASE.filter(doc => doc.category === category);
}

/**
 * Get all available categories
 */
function getCategories() {
  return [...new Set(KNOWLEDGE_BASE.map(doc => doc.category))];
}

module.exports = {
  detectRiskLevel,
  retrieveRelevantDocuments,
  buildRAGContext,
  processWithRAG,
  analyzeJournalWithRAG,
  getResourcesByCategory,
  getCategories
};
