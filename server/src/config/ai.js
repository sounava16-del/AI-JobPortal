const axios = require('axios');

const getAIConfig = () => {
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const preferred = (process.env.AI_PROVIDER || 'groq').toLowerCase();

  // 1. Groq as Primary / Default AI Provider
  if ((preferred === 'groq' || !openaiKey) && groqKey) {
    return {
      provider: 'groq',
      apiKey: groqKey,
      baseURL: 'https://api.groq.com/openai/v1',
      model: process.env.AI_MODEL || 'openai/gpt-oss-120b',
      isConfigured: true
    };
  }

  // 2. OpenAI if explicitly preferred and key provided
  if (preferred === 'openai' && openaiKey) {
    return {
      provider: 'openai',
      apiKey: openaiKey,
      baseURL: 'https://api.openai.com/v1',
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      isConfigured: true
    };
  }

  // 3. Fallback to OpenAI if Groq key missing
  if (openaiKey) {
    return {
      provider: 'openai',
      apiKey: openaiKey,
      baseURL: 'https://api.openai.com/v1',
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      isConfigured: true
    };
  }

  // 4. Unconfigured
  return {
    provider: 'unconfigured',
    apiKey: null,
    baseURL: null,
    model: null,
    isConfigured: false
  };
};

module.exports = { getAIConfig };
