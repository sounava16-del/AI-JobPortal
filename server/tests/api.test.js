const request = require('supertest');
const { app } = require('../src/server');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Job = require('../src/models/Job');

let seekerToken = '';
let recruiterToken = '';
let testJobId = '';

beforeAll(async () => {
  await connectDB();
  await User.deleteMany({});
  await Job.deleteMany({});
});

afterAll(async () => {
  await disconnectDB();
});

describe('AI Job Portal Backend API Test Suite', () => {

  describe('1. Authentication & RBAC', () => {
    it('should register a new job seeker', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@test.com',
          password: 'password123',
          role: 'seeker',
          skills: ['React', 'Node.js', 'MongoDB']
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('seeker');
      seekerToken = res.body.token;
    });

    it('should register a new recruiter', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Recruiter',
          email: 'recruiter@tech.com',
          password: 'password123',
          role: 'recruiter',
          company: { name: 'Acme Cloud Corp' }
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('recruiter');
      recruiterToken = res.body.token;
    });

    it('should login user and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@test.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('should enable 2FA and require OTP on subsequent login', async () => {
      // Toggle 2FA
      const toggleRes = await request(app)
        .put('/api/auth/toggle-2fa')
        .set('Authorization', `Bearer ${seekerToken}`);

      expect(toggleRes.statusCode).toBe(200);
      expect(toggleRes.body.isTwoFactorEnabled).toBe(true);

      // Attempt login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@test.com',
          password: 'password123'
        });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.requires2FA).toBe(true);
      expect(loginRes.body.devOtp).toBeDefined();

      // Verify OTP
      const verifyRes = await request(app)
        .post('/api/auth/verify-2fa')
        .send({
          userId: loginRes.body.userId,
          otp: loginRes.body.devOtp
        });

      expect(verifyRes.statusCode).toBe(200);
      expect(verifyRes.body.token).toBeDefined();
    });
  });

  describe('2. Job Postings & Search', () => {
    it('should allow recruiter to create a new job posting', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Full Stack JavaScript Engineer',
          description: 'Looking for a skilled developer proficient in React, Node.js, and MongoDB.',
          requirements: ['3+ years in JS', 'Experience with React & Express'],
          skillsRequired: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
          location: {
            city: 'Bengaluru',
            country: 'India',
            workplaceType: 'remote'
          },
          jobType: 'full-time',
          salaryRange: { min: 1200000, max: 2000000, currency: 'INR' }
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.job.title).toBe('Full Stack JavaScript Engineer');
      testJobId = res.body.job._id;
    });

    it('should reject job creation from job seeker (RBAC)', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${seekerToken}`)
        .send({
          title: 'Unauthorized Post',
          description: 'Should fail'
        });

      expect(res.statusCode).toBe(403);
    });

    it('should search and filter jobs by keyword', async () => {
      const res = await request(app)
        .get('/api/jobs?keyword=JavaScript');

      expect(res.statusCode).toBe(200);
      expect(res.body.jobs.length).toBeGreaterThan(0);
      expect(res.body.jobs[0].title).toContain('JavaScript');
    });
  });

  describe('3. AI Screening & Features', () => {
    it('should perform resume screening with ATS matching score', async () => {
      const res = await request(app)
        .post('/api/ai/screen-custom')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          resumeText: 'Software Engineer skilled in React, Node.js, MongoDB, Docker, and AWS.',
          jobDescription: 'Senior JavaScript developer with expertise in React and Node.js backend systems.',
          requiredSkills: ['React', 'Node.js', 'MongoDB']
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.result.score).toBeGreaterThan(50);
      expect(res.body.result.matchedSkills).toContain('react');
      expect(res.body.result.recommendation).toBeDefined();
    });

    it('should return personalized job recommendations for seeker', async () => {
      const res = await request(app)
        .get('/api/ai/recommendations')
        .set('Authorization', `Bearer ${seekerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.recommendations).toBeInstanceOf(Array);
    });

    it('should interact with AI Career Coach chatbot', async () => {
      const res = await request(app)
        .post('/api/ai/career-chat')
        .set('Authorization', `Bearer ${seekerToken}`)
        .send({
          message: 'How can I optimize my resume for ATS screening in full stack engineering?'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.reply).toBeDefined();
      expect(res.body.reply.length).toBeGreaterThan(20);
    });
  });

  describe('4. Job Application & Status Pipeline', () => {
    it('should allow seeker to apply for a job', async () => {
      const res = await request(app)
        .post(`/api/applications/apply/${testJobId}`)
        .set('Authorization', `Bearer ${seekerToken}`)
        .send({
          coverLetter: 'I am excited to apply for this Full Stack role!'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.application.status).toBe('Applied');
      expect(res.body.application.aiMatchScore).toBeDefined();
    });

    it('should reject duplicate applications to the same job', async () => {
      const res = await request(app)
        .post(`/api/applications/apply/${testJobId}`)
        .set('Authorization', `Bearer ${seekerToken}`)
        .send({
          coverLetter: 'Second attempt'
        });

      expect(res.statusCode).toBe(400);
    });
  });
});
