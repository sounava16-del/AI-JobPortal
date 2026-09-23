require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('./config/db');
const User = require('./models/User');
const Job = require('./models/Job');
const Resume = require('./models/Resume');
const Application = require('./models/Application');
const Notification = require('./models/Notification');
const Message = require('./models/Message');

const seedData = async () => {
  try {
    await connectDB();
    console.log('🧹 Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      Resume.deleteMany({}),
      Application.deleteMany({}),
      Notification.deleteMany({}),
      Message.deleteMany({})
    ]);

    console.log('🌱 Seeding Users...');

    // 1. Admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@aijobportal.com',
      password: 'adminpassword123',
      role: 'admin',
      headline: 'Platform Administrator',
    });

    // 2. Recruiters
    const recruiter1 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@techcorp.io',
      password: 'recruiterpassword123',
      role: 'recruiter',
      headline: 'Head of Talent Acquisition at TechCorp',
      company: {
        name: 'TechCorp Cloud Systems',
        website: 'https://techcorp.io',
        industry: 'Cloud Infrastructure & AI',
        size: '50-200',
        description: 'Building next-generation distributed systems and enterprise cloud tools.'
      }
    });

    const recruiter2 = await User.create({
      name: 'David Zhao',
      email: 'david.zhao@innovate.ai',
      password: 'recruiterpassword123',
      role: 'recruiter',
      headline: 'Technical Recruiter at Innovate AI',
      company: {
        name: 'Innovate AI Labs',
        website: 'https://innovate.ai',
        industry: 'Artificial Intelligence',
        size: '20-50',
        description: 'Leading research and deployment of generative AI foundation models.'
      }
    });

    // 3. Job Seekers
    const seeker1 = await User.create({
      name: 'Alex Rivera',
      email: 'alex.rivera@dev.com',
      password: 'seekerpassword123',
      role: 'seeker',
      headline: 'Senior Full Stack & AI Engineer',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Docker', 'AWS', 'Python'],
      experienceYears: 5,
      location: {
        city: 'San Francisco',
        country: 'USA',
        coordinates: [-122.4194, 37.7749]
      },
      bio: 'Passionate software engineer experienced in building resilient MERN stack architectures and integrating modern LLMs.'
    });

    const seeker2 = await User.create({
      name: 'Emily Chen',
      email: 'emily.chen@dev.com',
      password: 'seekerpassword123',
      role: 'seeker',
      headline: 'Frontend Engineer & UI/UX Specialist',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Redux', 'Jest'],
      experienceYears: 3,
      location: {
        city: 'New York',
        country: 'USA',
        coordinates: [-74.006, 40.7128]
      },
      bio: 'Specializing in accessible, responsive web interfaces and micro-interactions.'
    });

    console.log('🌱 Seeding Jobs...');

    const jobs = await Job.create([
      {
        title: 'Senior Full Stack Engineer (MERN + AI)',
        recruiter: recruiter1._id,
        company: recruiter1.company,
        description: 'We are seeking an experienced Full Stack Engineer to lead development of high-throughput web applications with deep AI LLM integrations.',
        requirements: [
          '5+ years professional experience with Node.js, Express, and React',
          'Proven track record designing REST and GraphQL APIs with MongoDB Atlas',
          'Experience deploying on AWS (EC2, S3, ECS) and utilizing Docker',
          'Familiarity with LLM APIs (Groq, OpenAI, Anthropic)'
        ],
        responsibilities: [
          'Architect and maintain scalable microservices',
          'Design interactive, responsive frontend views with Tailwind CSS and React',
          'Collaborate with machine learning engineers to embed real-time screening pipelines'
        ],
        skillsRequired: ['Node.js', 'React', 'MongoDB', 'AWS', 'Docker', 'TypeScript'],
        location: {
          city: 'Bengaluru',
          country: 'India',
          isRemote: true,
          workplaceType: 'hybrid',
          coordinates: [77.5946, 12.9716]
        },
        jobType: 'full-time',
        experienceLevel: 'senior',
        salaryRange: { min: 1800000, max: 2800000, currency: 'INR' },
        status: 'active'
      },
      {
        title: 'AI Machine Learning & Backend Specialist',
        recruiter: recruiter2._id,
        company: recruiter2.company,
        description: 'Innovate AI is looking for a Backend / ML integration specialist to build automated intelligence pipelines and resume evaluation models.',
        requirements: [
          'Proficiency with Python, FastAPI or Node.js',
          'Hands-on experience with vector embeddings, RAG, and prompt engineering',
          'Strong fundamentals in system design and data security'
        ],
        responsibilities: [
          'Implement low-latency inference pipelines',
          'Work on model fine-tuning and automated screening benchmarks'
        ],
        skillsRequired: ['Python', 'Machine Learning', 'Node.js', 'Docker', 'AWS'],
        location: {
          city: 'Hyderabad',
          country: 'India',
          isRemote: true,
          workplaceType: 'remote',
          coordinates: [78.4867, 17.3850]
        },
        jobType: 'full-time',
        experienceLevel: 'mid',
        salaryRange: { min: 1500000, max: 2400000, currency: 'INR' },
        status: 'active'
      },
      {
        title: 'Lead Frontend React Developer',
        recruiter: recruiter1._id,
        company: recruiter1.company,
        description: 'Looking for a UI virtuoso to build high-performance, dark-mode native dashboards for our cloud monitoring suite.',
        requirements: [
          '4+ years building complex web apps with modern React, Vite, and Tailwind CSS',
          'Deep understanding of browser performance metrics (Core Web Vitals)',
          'Experience with WebSockets and real-time state management'
        ],
        responsibilities: [
          'Lead frontend architecture and component library',
          'Optimize rendering performance and mobile responsiveness'
        ],
        skillsRequired: ['React', 'TypeScript', 'Tailwind', 'Next.js', 'Jest'],
        location: {
          city: 'Pune',
          country: 'India',
          isRemote: false,
          workplaceType: 'on-site',
          coordinates: [73.8567, 18.5204]
        },
        jobType: 'full-time',
        experienceLevel: 'lead',
        salaryRange: { min: 2000000, max: 3200000, currency: 'INR' },
        status: 'active'
      }
    ]);

    console.log('🌱 Seeding Resumes...');

    const resume1 = await Resume.create({
      user: seeker1._id,
      fileName: 'Alex_Rivera_Senior_FullStack.pdf',
      fileUrl: '/uploads/resumes/sample-alex-rivera.pdf',
      storageType: 'local',
      parsedText: 'Alex Rivera - Senior Full Stack Engineer. Experienced in TypeScript, React, Node.js, Express, MongoDB, Docker, AWS, S3, EC2. 5+ years building cloud-native web applications and REST APIs. B.S. in Computer Science.',
      parsedSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Docker', 'AWS', 'Python'],
      experienceYears: 5,
      atsScore: 92,
      feedback: {
        summary: 'Outstanding technical profile with high ATS keyword alignment for full-stack and cloud positions.',
        strengths: ['Strong depth in MERN stack', 'Demonstrated AWS cloud skills', 'Clean structural formatting'],
        weaknesses: ['Could highlight more metrics on business revenue impact'],
        missingKeywords: ['Kubernetes', 'GraphQL'],
        suggestions: ['Include GitHub and live application demo links at the top of the header.']
      },
      isDefault: true
    });

    console.log('🌱 Seeding Applications...');

    const app1 = await Application.create({
      job: jobs[0]._id,
      applicant: seeker1._id,
      resume: resume1._id,
      coverLetter: 'I am thrilled to apply for the Senior Full Stack role. With 5 years of production MERN and AWS experience, I am confident I can make an immediate impact on your platform.',
      status: 'Shortlisted',
      aiMatchScore: 94,
      aiAnalysis: {
        matchSummary: 'Exceptional match. Candidate meets all core requirements including React, Node.js, MongoDB, and AWS cloud experience.',
        skillMatchPercentage: 94,
        matchedSkills: ['Node.js', 'React', 'MongoDB', 'AWS', 'Docker', 'TypeScript'],
        missingSkills: [],
        experienceFit: '5 years of verified experience meets senior tier criteria.',
        recommendation: 'Strong Hire'
      },
      interviewQuestions: [
        {
          question: 'Can you detail your strategy for handling high-traffic WebSocket connections with Node.js and Socket.io across clustered EC2 instances?',
          category: 'Technical',
          expectedAnswer: 'Should mention Redis adapter for Socket.io, horizontal scaling behind Nginx load balancers, and graceful connection draining.'
        },
        {
          question: 'Walk us through how you prevent common security vulnerabilities in JWT and MongoDB deployments.',
          category: 'System Design',
          expectedAnswer: 'Should mention HTTP-only cookies/secure headers, secret rotation, input sanitization against NoSQL injection, and rate limiting.'
        }
      ],
      statusTimeline: [
        { status: 'Applied', changedAt: new Date(Date.now() - 3 * 86400000), note: 'Application submitted' },
        { status: 'Reviewing', changedAt: new Date(Date.now() - 2 * 86400000), note: 'Resume screened by AI ATS with 94% match' },
        { status: 'Shortlisted', changedAt: new Date(Date.now() - 1 * 86400000), note: 'Recruiter shortlisted for technical interview' }
      ]
    });

    jobs[0].applicantsCount = 1;
    await jobs[0].save();

    console.log('🌱 Seeding Notifications & Chat Messages...');

    await Notification.create({
      recipient: seeker1._id,
      sender: recruiter1._id,
      title: 'Application Shortlisted!',
      message: 'Great news! Your application for "Senior Full Stack Engineer (MERN + AI)" has been shortlisted.',
      type: 'application_status',
      link: '/seeker/applications'
    });

    const conversationId = [seeker1._id.toString(), recruiter1._id.toString()].sort().join('_');

    await Message.create([
      {
        conversationId,
        sender: recruiter1._id,
        recipient: seeker1._id,
        job: jobs[0]._id,
        text: 'Hi Alex! We reviewed your profile and AI screening score (94%). We would love to schedule a preliminary conversation this week.'
      },
      {
        conversationId,
        sender: seeker1._id,
        recipient: recruiter1._id,
        job: jobs[0]._id,
        text: 'Hello Sarah! Thank you for reaching out. I would be delighted to speak. I am available any afternoon this week.'
      }
    ]);

    console.log('✅ Seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('✨ TEST CREDENTIALS:');
    console.log('   Admin:      admin@aijobportal.com       / adminpassword123');
    console.log('   Recruiter:  sarah.jenkins@techcorp.io   / recruiterpassword123');
    console.log('   Job Seeker: alex.rivera@dev.com         / seekerpassword123');
    console.log('----------------------------------------------------');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedData();
