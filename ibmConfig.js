/**
 * IBM Watson/Granite Configuration
 * Mental Health AI Agent - IBM Cloud Integration
 */

require('dotenv').config({ path: './config.env' });

const IBM_CONFIG = {
  apiKey: process.env.IBM_API_KEY,
  projectId: process.env.IBM_PROJECT_ID,
  modelId: process.env.IBM_GRANITE_MODEL || 'ibm/granite-4-h-small',
  iamUrl: process.env.IBM_IAM_URL || 'https://iam.cloud.ibm.com/identity/token',
  watsonxUrl: process.env.IBM_WATSONX_URL || 'https://us-south.ml.cloud.ibm.com',
  port: process.env.PORT || 3000
};

module.exports = IBM_CONFIG;
