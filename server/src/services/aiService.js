const axios = require('axios');
const { getAIConfig } = require('../config/ai');
const AILog = require('../models/AILog');
const { SKILL_KEYWORDS } = require('./resumeParser');

/**
 * Helper to call Groq or OpenAI chat completions
 */
const callLLM = async ({ systemPrompt, userPrompt, temperature = 0.3, maxTokens = 1500 }) => {
  const config = getAIConfig();
  if (!config.isConfigured) {
    throw new Error('No AI provider configured');
  }

  const endpoint = `${config.baseURL}/chat/completions`;
  const response = await axios.post(
    endpoint,
    {
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' }
    },
    {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 25000
    }
  );

  const usage = response.data.usage || {};
  return {
    content: response.data.choices[0].message.content,
    promptTokens: usage.prompt_tokens || 0,
    completionTokens: usage.completion_tokens || 0,
    provider: config.provider,
    model: config.model
  };
};

/**
 * Heuristic fallback for Resume Screening & ATS Match
 */
const heuristicScreenResume = (resumeText, jobDescription, requiredSkills = []) => {
  const lowerResume = (resumeText || '').toLowerCase();
  const lowerJob = (jobDescription || '').toLowerCase();

  // If required skills are not explicitly passed, extract from job description
  let targetSkills = requiredSkills.map(s => s.toLowerCase().trim());
  if (targetSkills.length === 0) {
    targetSkills = SKILL_KEYWORDS.filter(s => lowerJob.includes(s.toLowerCase()));
  }

  // Fallback skills if still empty
  if (targetSkills.length === 0) {
    targetSkills = ['communication', 'problem solving', 'teamwork'];
  }

  const matchedSkills = [];
  const missingSkills = [];

  targetSkills.forEach(skill => {
    if (lowerResume.includes(skill)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const skillMatchPercentage = targetSkills.length > 0
    ? Math.round((matchedSkills.length / targetSkills.length) * 100)
    : 75;

  let atsScore = skillMatchPercentage;
  if (lowerResume.length > 500) atsScore = Math.min(100, atsScore + 10);
  if (lowerResume.includes('education') || lowerResume.includes('university') || lowerResume.includes('degree')) atsScore = Math.min(100, atsScore + 5);

  let recommendation = 'Borderline';
  if (atsScore >= 80) recommendation = 'Strong Hire';
  else if (atsScore >= 65) recommendation = 'Hire';
  else if (atsScore < 50) recommendation = 'Not Recommended';

  return {
    score: atsScore,
    skillMatchPercentage,
    matchedSkills,
    missingSkills,
    experienceFit: atsScore >= 70 ? 'Strong alignment with role criteria.' : 'Moderate alignment, skill enhancement advised.',
    matchSummary: `Candidate matches ${matchedSkills.length} out of ${targetSkills.length} required competencies (${skillMatchPercentage}% match).`,
    recommendation
  };
};

/**
 * AI Resume Screening Feature
 */
const screenResume = async (userId, resumeText, jobDescription, requiredSkills = []) => {
  const startTime = Date.now();
  let result;
  let logData = {
    user: userId,
    feature: 'screening',
    status: 'success',
    promptTokens: 0,
    completionTokens: 0,
    provider: 'local-heuristic',
    model: 'heuristic-engine'
  };

  try {
    const config = getAIConfig();
    if (config.isConfigured) {
      const systemPrompt = `You are an expert AI Technical Recruiter & ATS parser. Analyze the candidate resume against the job description and required skills.
Return ONLY valid JSON matching this structure:
{
  "score": <number 0-100>,
  "skillMatchPercentage": <number 0-100>,
  "matchedSkills": [<strings>],
  "missingSkills": [<strings>],
  "experienceFit": "<concise sentence evaluating experience>",
  "matchSummary": "<concise summary of match quality>",
  "recommendation": "<'Strong Hire' | 'Hire' | 'Borderline' | 'Not Recommended'>"
}`;

      const userPrompt = `Job Description:
${jobDescription.substring(0, 2000)}

Required Skills:
${requiredSkills.join(', ')}

Candidate Resume:
${resumeText.substring(0, 3000)}`;

      const llmRes = await callLLM({ systemPrompt, userPrompt });
      result = JSON.parse(llmRes.content);
      logData.provider = llmRes.provider;
      logData.model = llmRes.model;
      logData.promptTokens = llmRes.promptTokens;
      logData.completionTokens = llmRes.completionTokens;
    } else {
      result = heuristicScreenResume(resumeText, jobDescription, requiredSkills);
    }
  } catch (err) {
    console.warn('AI Screening API call failed, using heuristic engine:', err.message);
    result = heuristicScreenResume(resumeText, jobDescription, requiredSkills);
    logData.error = err.message;
  }

  logData.durationMs = Date.now() - startTime;
  try {
    await AILog.create(logData);
  } catch (e) {
    // Non-blocking log error
  }

  return result;
};

/**
 * AI Job Recommendations
 */
const getJobRecommendations = async (userId, seekerSkills = [], seekerHeadline = '', jobs = []) => {
  const startTime = Date.now();
  const scoredJobs = jobs.map(job => {
    const jobSkills = (job.skillsRequired || []).map(s => s.toLowerCase());
    const candidateSkills = (seekerSkills || []).map(s => s.toLowerCase());

    const matched = candidateSkills.filter(s => jobSkills.includes(s) || (job.description || '').toLowerCase().includes(s));
    const score = jobSkills.length > 0
      ? Math.round((matched.length / Math.max(jobSkills.length, 1)) * 100)
      : 60;

    return {
      job,
      matchPercentage: Math.min(100, Math.max(25, score)),
      matchedSkills: matched,
      reason: `Matches ${matched.length} core skills in your profile (${matched.slice(0, 3).join(', ')})`
    };
  });

  // Sort by highest match score
  scoredJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);

  try {
    await AILog.create({
      user: userId,
      feature: 'recommendation',
      provider: 'local-heuristic',
      model: 'recommendation-engine-v1',
      status: 'success',
      durationMs: Date.now() - startTime
    });
  } catch (e) {}

  return scoredJobs.slice(0, 10);
};

/**
 * AI Career Guidance Chatbot
 */
const careerChat = async (userId, userMessage, conversationHistory = [], seekerProfile = {}) => {
  const startTime = Date.now();
  const config = getAIConfig();

  let logData = {
    user: userId,
    feature: 'career_chat',
    status: 'success',
    durationMs: 0
  };

  const skillsList = (seekerProfile.skills || []).join(', ') || 'Software Development';
  const systemPrompt = `You are Antigravity Career Coach, an intelligent AI career mentor for a job seeker.
The seeker has skills in: ${skillsList}. Experience: ${seekerProfile.experienceYears || 0} years.
Give encouraging, actionable, modern, and concrete career advice. Help with resume building, interview preparation, salary negotiation, and skill upskilling.
Return a friendly response formatted cleanly in markdown.`;

  if (config.isConfigured) {
    try {
      const endpoint = `${config.baseURL}/chat/completions`;
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-6).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        })),
        { role: 'user', content: userMessage }
      ];

      const response = await axios.post(
        endpoint,
        {
          model: config.model,
          messages,
          temperature: 0.7,
          max_tokens: 800
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );

      const usage = response.data.usage || {};
      logData.provider = config.provider;
      logData.model = config.model;
      logData.promptTokens = usage.prompt_tokens || 0;
      logData.completionTokens = usage.completion_tokens || 0;
      logData.durationMs = Date.now() - startTime;
      await AILog.create(logData);

      return {
        reply: response.data.choices[0].message.content,
        provider: config.provider
      };
    } catch (err) {
      console.warn('AI Chat API failed, using intelligent built-in advisor:', err.message);
    }
  }

  // Built-in intelligent advisor response
  let reply = '';
  const msg = userMessage.toLowerCase();

  if (msg.includes('resume') || msg.includes('cv')) {
    reply = `### 📄 Resume Optimization Tips
1. **Quantify Your Impact**: Use the Google XYZ formula: *"Accomplished [X] as measured by [Y], by doing [Z]"*.
2. **ATS Alignment**: Mirror the exact keywords from the job description (e.g., *React, Node.js, Microservices*).
3. **Keep it Clean**: Stick to clean single-column PDF formatting with standard section titles (*Experience, Skills, Education*).
4. **Skills First**: Group skills into Frontend, Backend, Cloud/DevOps, and Databases to pass automated ATS filters.`;
  } else if (msg.includes('interview') || msg.includes('question')) {
    reply = `### 🎯 Interview Preparation Strategy
1. **STAR Method**: For behavioral questions, structure your answers with **Situation, Task, Action, and Result**.
2. **System Design**: Practice explaining trade-offs: Caching vs Latency, SQL vs NoSQL, Horizontal vs Vertical scaling.
3. **Live Coding**: Think out loud! Interviewers care more about your problem-solving process than immediate perfection.
4. **Questions to Ask**: Always ask insightful questions like: *"What is the biggest engineering challenge the team faced this quarter?"*`;
  } else if (msg.includes('salary') || msg.includes('negotiat') || msg.includes('offer')) {
    reply = `### 💰 Salary & Offer Negotiation Advice
1. **Research Market Rates**: Check verified salary benchmarks for your role and location.
2. **Never give a number first**: When asked for expectations, reply: *"I am looking for a competitive package aligned with market standards and the scope of this role."*
3. **Consider the Total Package**: Base salary, equity/stock options, health insurance, remote stipends, and bonus structures.
4. **Be Professional & Confident**: Always express enthusiasm for the team before counter-offering.`;
  } else {
    reply = `Hello! I'm your AI Career Coach. Based on your profile (${skillsList}), you have strong potential in the tech market. 

I can assist you with:
- 📝 **Resume Audits & ATS Keyword Optimization**
- 💡 **Technical & Behavioral Interview Prep**
- 🚀 **Personalized Career Roadmap & Skill Upgrades**
- 💵 **Job Search Strategies & Offer Negotiation**

What specific topic would you like to explore today?`;
  }

  logData.durationMs = Date.now() - startTime;
  try {
    await AILog.create(logData);
  } catch (e) {}

  return {
    reply,
    provider: 'local-advisor'
  };
};

/**
 * AI Interview Question Generator
 */
const generateInterviewQuestions = async (userId, jobDetails, candidateResume = '') => {
  const startTime = Date.now();
  const config = getAIConfig();
  let questions = [];

  if (config.isConfigured) {
    try {
      const systemPrompt = `You are a Senior Principal Interviewer. Based on the job title, requirements, and candidate resume, generate 5 tailored interview questions.
Return ONLY valid JSON matching this schema:
{
  "questions": [
    {
      "question": "<The question to ask>",
      "category": "<'Technical' | 'Behavioral' | 'System Design' | 'Situational'>",
      "expectedAnswer": "<What a good candidate should mention>"
    }
  ]
}`;

      const userPrompt = `Job Title: ${jobDetails.title}
Requirements: ${(jobDetails.requirements || []).join('; ')}
Skills: ${(jobDetails.skillsRequired || []).join(', ')}
Candidate Background: ${candidateResume.substring(0, 1500)}`;

      const llmRes = await callLLM({ systemPrompt, userPrompt });
      const parsed = JSON.parse(llmRes.content);
      questions = parsed.questions || [];

      await AILog.create({
        user: userId,
        feature: 'interview_questions',
        provider: llmRes.provider,
        model: llmRes.model,
        promptTokens: llmRes.promptTokens,
        completionTokens: llmRes.completionTokens,
        status: 'success',
        durationMs: Date.now() - startTime
      });

      return questions;
    } catch (err) {
      console.warn('AI question generator failed, using default generator:', err.message);
    }
  }

  // Heuristic generation based on job requirements and skills
  const primarySkill = (jobDetails.skillsRequired && jobDetails.skillsRequired[0]) || 'Web Development';
  const secondarySkill = (jobDetails.skillsRequired && jobDetails.skillsRequired[1]) || 'API Design';

  questions = [
    {
      question: `Can you walk us through a complex project where you leveraged ${primarySkill} and the key architectural trade-offs you made?`,
      category: 'Technical',
      expectedAnswer: `Candidate should explain modularity, performance, testing strategy, and how they handled state or data flow with ${primarySkill}.`
    },
    {
      question: `How do you ensure reliability, security, and scalability when designing ${secondarySkill}?`,
      category: 'System Design',
      expectedAnswer: `Should mention authentication, rate limiting, error handling, caching, and clean schema definitions.`
    },
    {
      question: `Describe a time when you received critical feedback on code review or a tight deadline. How did you adapt?`,
      category: 'Behavioral',
      expectedAnswer: `Demonstrates humility, receptive communication, focus on product quality, and effective time prioritization.`
    },
    {
      question: `If a production issue arises causing high latency or failures for ${jobDetails.title} systems, what are your step-by-step triage actions?`,
      category: 'Situational',
      expectedAnswer: `Mentions checking monitoring/logs (APM), isolating recent deployments, applying rollback or hotfix, and writing a post-mortem.`
    },
    {
      question: `What excites you most about working at ${jobDetails.company?.name || 'our company'}, and how does this role align with your 2-year growth plan?`,
      category: 'Behavioral',
      expectedAnswer: `Candidate has researched the company, shows intrinsic motivation, and has clear technical progression goals.`
    }
  ];

  try {
    await AILog.create({
      user: userId,
      feature: 'interview_questions',
      provider: 'local-heuristic',
      model: 'template-engine-v1',
      status: 'success',
      durationMs: Date.now() - startTime
    });
  } catch (e) {}

  return questions;
};

/**
 * AI Resume ATS Analysis & Feedback
 */
const analyzeResumeAts = async (userId, resumeText) => {
  const startTime = Date.now();
  const config = getAIConfig();
  let feedback = {};

  if (config.isConfigured) {
    try {
      const systemPrompt = `You are a World-Class ATS Resume Auditor. Analyze this resume text and output detailed constructive feedback.
Return ONLY valid JSON matching this schema:
{
  "atsScore": <number 0-100>,
  "summary": "<2-3 sentence overview>",
  "strengths": [<3-4 bullet strings>],
  "weaknesses": [<2-3 bullet strings>],
  "missingKeywords": [<4-6 industry keywords to add>],
  "suggestions": [<3 actionable tips to improve ATS ranking>]
}`;

      const userPrompt = `Resume text:
${resumeText.substring(0, 3500)}`;

      const llmRes = await callLLM({ systemPrompt, userPrompt });
      feedback = JSON.parse(llmRes.content);

      await AILog.create({
        user: userId,
        feature: 'resume_analysis',
        provider: llmRes.provider,
        model: llmRes.model,
        promptTokens: llmRes.promptTokens,
        completionTokens: llmRes.completionTokens,
        status: 'success',
        durationMs: Date.now() - startTime
      });

      return feedback;
    } catch (err) {
      console.warn('AI Resume analysis failed, using heuristic analysis:', err.message);
    }
  }

  // Heuristic ATS analysis
  const textLower = (resumeText || '').toLowerCase();
  const foundSkills = SKILL_KEYWORDS.filter(s => textLower.includes(s.toLowerCase()));

  let score = 55;
  if (foundSkills.length >= 8) score += 25;
  else if (foundSkills.length >= 4) score += 15;
  if (textLower.includes('experience') || textLower.includes('projects')) score += 10;
  if (textLower.includes('education') || textLower.includes('bachelor') || textLower.includes('master')) score += 10;
  score = Math.min(98, score);

  feedback = {
    atsScore: score,
    summary: `Your resume demonstrates good technical foundations with ${foundSkills.length} identified core competencies. ATS compliance is above average.`,
    strengths: [
      `Clearly identified tech stack including: ${foundSkills.slice(0, 4).join(', ') || 'standard software tools'}.`,
      'Readable layout and recognized standard section headers.',
      'Demonstrated project or practical experience orientation.'
    ],
    weaknesses: [
      'Could incorporate more quantifiable metrics ($ saved, % speed improvements, user count).',
      'Could strengthen cloud and automated testing exposure.'
    ],
    missingKeywords: ['Docker', 'AWS CI/CD', 'Microservices', 'Unit Testing', 'TypeScript', 'GraphQL'],
    suggestions: [
      'Add metric-driven bullet points starting with action verbs (e.g., "Engineered", "Optimized", "Scaled").',
      'Ensure modern framework versions and cloud services are explicitly listed in your skills section.',
      'Maintain clean standard fonts and avoid complex multi-column graphics that confuse older ATS parsers.'
    ]
  };

  try {
    await AILog.create({
      user: userId,
      feature: 'resume_analysis',
      provider: 'local-heuristic',
      model: 'ats-heuristics-v1',
      status: 'success',
      durationMs: Date.now() - startTime
    });
  } catch (e) {}

  return feedback;
};

module.exports = {
  screenResume,
  getJobRecommendations,
  careerChat,
  generateInterviewQuestions,
  analyzeResumeAts,
  heuristicScreenResume
};
