/**
 * IBM Granite Agent - Core AI Engine
 * Connects to IBM WatsonX with Granite model for empathetic mental health conversations
 */

const axios = require('axios');
const IBM_CONFIG = require('../config/ibmConfig');

let cachedToken = null;
let tokenExpiry = null;

/**
 * Get IBM IAM access token (cached with expiry)
 */
async function getIBMToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await axios.post(
      IBM_CONFIG.iamUrl,
      `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${IBM_CONFIG.apiKey}`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );
    cachedToken = response.data.access_token;
    tokenExpiry = now + (response.data.expires_in - 60) * 1000;
    return cachedToken;
  } catch (error) {
    throw new Error(`IBM IAM authentication failed: ${error.message}`);
  }
}

/**
 * Call IBM Granite model via WatsonX API
 */
async function callGranite(systemPrompt, userMessage, conversationHistory = []) {
  const token = await getIBMToken();

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  const payload = {
    model_id: IBM_CONFIG.modelId,
    messages: messages,
    project_id: IBM_CONFIG.projectId,
    parameters: {
      max_new_tokens: 800,
      temperature: 0.7,
      top_p: 0.9,
      repetition_penalty: 1.1
    }
  };

  try {
    const response = await axios.post(
      `${IBM_CONFIG.watsonxUrl}/ml/v1/text/chat?version=2023-05-29`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    const errMsg = error.response?.data?.errors?.[0]?.message || error.message;
    throw new Error(`Granite API call failed: ${errMsg}`);
  }
}

/**
 * Generate empathetic mental health response
 */
async function generateEmpathyResponse(userMessage, context, conversationHistory) {
  const { riskLevel, relevantResources, empathyStarter } = context;

  const systemPrompt = `You are MindCare, a compassionate and empathetic AI mental health support companion powered by IBM Granite. Your role is to provide a safe, non-judgmental space for people struggling with mental health challenges.

CORE PRINCIPLES:
- Always respond with warmth, empathy, and genuine care
- Validate the user's feelings before offering any advice
- Never minimize or dismiss what the user is experiencing
- Use trauma-informed, person-centered language
- Always include a clear disclaimer that you are NOT a substitute for professional medical advice
- If risk level is HIGH or CRITICAL, ALWAYS provide crisis hotline numbers immediately

CURRENT CONTEXT:
- Risk Level Detected: ${riskLevel.toUpperCase()}
- Relevant Resources Available: ${relevantResources.map(r => r.title).join(', ')}

RESPONSE GUIDELINES:
1. Start with the empathy starter: "${empathyStarter}"
2. Acknowledge specific feelings mentioned
3. If risk is HIGH/CRITICAL: Immediately provide 988 (US) and crisis text line (Text HOME to 741741)
4. Offer 1-2 relevant coping strategies or resources
5. Ask a gentle follow-up question to continue engagement
6. End with reminder that professional help is available

DISCLAIMER TO ALWAYS INCLUDE FOR MEDIUM/HIGH/CRITICAL:
"⚠️ I am an AI support tool and not a substitute for professional mental health care. Please consider speaking with a licensed therapist or counselor."

Keep responses warm, concise (150-250 words), and conversational. Never use clinical jargon.`;

  return await callGranite(systemPrompt, userMessage, conversationHistory);
}

/**
 * Generate risk assessment summary
 */
async function generateRiskAssessment(conversationSummary) {
  const systemPrompt = `You are a mental health risk assessment system. Analyze the conversation summary and provide a structured risk assessment.

Respond ONLY in this JSON format:
{
  "risk_score": <0-100>,
  "risk_category": "<low|medium|high|critical>",
  "key_indicators": ["<indicator1>", "<indicator2>"],
  "recommended_actions": ["<action1>", "<action2>"],
  "immediate_intervention_needed": <true|false>,
  "protective_factors": ["<factor1>"]
}`;

  const response = await callGranite(systemPrompt, `Analyze this conversation: ${conversationSummary}`);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch {
    return null;
  }
}

/**
 * Generate personalized wellness plan
 */
async function generateWellnessPlan(userProfile) {
  const systemPrompt = `You are a wellness coach specializing in mental health. Create a personalized, practical 7-day wellness plan based on the user's profile. Focus on small, achievable steps. Use compassionate language. Include mindfulness, physical activity, social connection, and self-care elements.`;

  const userMessage = `Create a wellness plan for someone with these characteristics: ${JSON.stringify(userProfile)}`;
  return await callGranite(systemPrompt, userMessage);
}

/**
 * Analyze journal entry for distress signals
 */
async function analyzeJournalEntry(journalText) {
  const systemPrompt = `You are a compassionate mental health journal analyzer. Analyze the journal entry for emotional themes, distress signals, and wellness indicators. 

Respond in JSON format:
{
  "emotional_themes": ["<theme1>"],
  "distress_signals": ["<signal1>"],
  "positive_indicators": ["<positive1>"],
  "risk_level": "<low|medium|high|critical>",
  "empathetic_reflection": "<2-3 sentence empathetic response to what was shared>",
  "suggested_resources": ["<resource_id1>"]
}`;

  const response = await callGranite(systemPrompt, `Journal entry: ${journalText}`);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Could not parse analysis', raw: response };
  } catch {
    return { error: 'Parse error', raw: response };
  }
}

module.exports = {
  callGranite,
  generateEmpathyResponse,
  generateRiskAssessment,
  generateWellnessPlan,
  analyzeJournalEntry
};
