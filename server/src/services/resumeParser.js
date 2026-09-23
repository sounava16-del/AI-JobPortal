const fs = require('fs');
const pdf = require('pdf-parse');

// Tech and industry skill keyword dictionary
const SKILL_KEYWORDS = [
  // Frontend
  'javascript', 'typescript', 'react', 'react.js', 'vue', 'vue.js', 'angular', 'next.js', 'nuxt.js',
  'html', 'html5', 'css', 'css3', 'tailwind', 'tailwind css', 'bootstrap', 'sass', 'redux', 'zustand',
  // Backend & APIs
  'node.js', 'nodejs', 'express', 'express.js', 'nest.js', 'nestjs', 'python', 'django', 'fastapi',
  'flask', 'java', 'spring', 'spring boot', 'golang', 'go', 'c#', '.net', 'asp.net', 'ruby', 'rails',
  'php', 'laravel', 'graphql', 'rest api', 'grpc', 'microservices',
  // Databases & Caching
  'mongodb', 'postgresql', 'postgres', 'mysql', 'sql', 'sqlite', 'redis', 'elasticsearch', 'dynamodb',
  'cassandra', 'prisma', 'mongoose', 'sequelize',
  // Cloud & DevOps
  'aws', 'amazon web services', 's3', 'ec2', 'lambda', 'azure', 'google cloud', 'gcp', 'docker',
  'kubernetes', 'k8s', 'terraform', 'ansible', 'jenkins', 'ci/cd', 'github actions', 'gitlab ci',
  'nginx', 'linux', 'bash',
  // AI, Data & ML
  'machine learning', 'deep learning', 'nlp', 'natural language processing', 'computer vision',
  'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'openai', 'llm', 'langchain',
  // Tools & Methodologies
  'git', 'github', 'gitlab', 'jira', 'agile', 'scrum', 'kanban', 'unit testing', 'jest', 'cypress',
  'tdd', 'system design', 'distributed systems'
];

/**
 * Parse PDF and extract plain text and structural info
 */
const parseResumePdf = async (filePathOrBuffer) => {
  try {
    let dataBuffer;
    if (typeof filePathOrBuffer === 'string') {
      dataBuffer = fs.readFileSync(filePathOrBuffer);
    } else {
      dataBuffer = filePathOrBuffer;
    }

    const data = await pdf(dataBuffer);
    const text = data.text || '';

    // Extract skills found in text
    const lowerText = text.toLowerCase();
    const extractedSkills = SKILL_KEYWORDS.filter(skill => {
      // Use regex boundary check where possible
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      return regex.test(lowerText);
    });

    // Approximate years of experience via regex patterns
    let experienceYears = 0;
    const expRegexes = [
      /(\d+)\+?\s*(?:years?|yrs?)(?:\s*of)?\s*(?:experience|exp)/i,
      /(?:experience|exp):\s*(\d+)\+?\s*(?:years?|yrs?)/i
    ];
    for (const regex of expRegexes) {
      const match = text.match(regex);
      if (match && match[1]) {
        const val = parseInt(match[1], 10);
        if (val > 0 && val < 40) {
          experienceYears = Math.max(experienceYears, val);
        }
      }
    }

    return {
      text,
      skills: [...new Set(extractedSkills)],
      experienceYears,
      numPages: data.numpages || 1
    };
  } catch (err) {
    console.error('Error parsing PDF resume:', err);
    return {
      text: '',
      skills: [],
      experienceYears: 0,
      numPages: 0,
      error: err.message
    };
  }
};

module.exports = {
  parseResumePdf,
  SKILL_KEYWORDS
};
