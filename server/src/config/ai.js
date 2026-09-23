const axios = require('axios');

const getAIConfig = () => {
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const preferred = (process.env.AI_PROVIDER || 'groq').toLowerCase();

  if (preferred === 'groq' && groqKey) {
    return {
      provider: 'groq',
      apiKey: groqKey,
      baseURL: 'https://api.groq.com/openai/v1',
      model: process.env.AI_MODEL || 'llama-3.3-70b-versatile',
      isConfigured: true
    };
  }

  if (openaiKey) {
    return {
      provider: 'openai',
      apiKey: openaiKey,
      baseURL: 'https://api.openai.com/v1',
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      isConfigured: true
    };
  }

  if (groqKey) {
    return {
      provider: 'groq',
      apiKey: groqKey,
      baseURL: 'https://api.groq.com/openai/v1',
      model: process.env.AI_MODEL || 'llama-3.3-70b-versatile',
      isConfigured: true
    };
  }

  return {
    provider: 'local-heuristic',
    apiKey: null,
    baseURL: null,
    model: 'heuristic-nlp-engine-v1',
    isConfigured: false
  };
};

module.exports = { getAIConfig };
