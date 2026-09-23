import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Briefcase, Building, MapPin, DollarSign, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

const RecruiterPostJob = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('India');
  const [workplaceType, setWorkplaceType] = useState('remote');
  const [jobType, setJobType] = useState('full-time');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [minSalary, setMinSalary] = useState('1200000');
  const [maxSalary, setMaxSalary] = useState('2400000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        title,
        description,
        requirements: requirements.split('\n').filter(r => r.trim().length > 0),
        responsibilities: responsibilities.split('\n').filter(r => r.trim().length > 0),
        skillsRequired: skillsRequired.split(',').map(s => s.trim()).filter(Boolean),
        location: {
          city,
          country,
          workplaceType,
          isRemote: workplaceType === 'remote'
        },
        jobType,
        experienceLevel,
        salaryRange: {
          min: Number(minSalary),
          max: Number(maxSalary),
          currency: 'INR'
        }
      };

      const res = await api.post('/jobs', payload);
      if (res.data.success) {
        navigate('/recruiter/manage-jobs');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish job posting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-indigo-600" />
          Create New Job Posting
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Post your requirements to enable AI resume matching and automated candidate ranking
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Job Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Job Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Full Stack Engineer (MERN + AI)"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Workplace & Job Type Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Workplace Type
            </label>
            <select
              value={workplaceType}
              onChange={(e) => setWorkplaceType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="on-site">On-Site</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Job Type
            </label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
            >
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="lead">Lead / Principal</option>
            </select>
          </div>
        </div>

        {/* Location & Salary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              City / Region
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Bengaluru, Hyderabad, Pune, or Remote"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Min Salary (₹ INR / Year)
            </label>
            <input
              type="number"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              placeholder="1200000"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Max Salary (₹ INR / Year)
            </label>
            <input
              type="number"
              value={maxSalary}
              onChange={(e) => setMaxSalary(e.target.value)}
              placeholder="2400000"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
            />
          </div>
        </div>

        {/* Skills Required */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Required Skills (comma separated) *
          </label>
          <input
            type="text"
            required
            value={skillsRequired}
            onChange={(e) => setSkillsRequired(e.target.value)}
            placeholder="React, TypeScript, Node.js, Express, MongoDB, AWS, Docker"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            These skills will be matched against candidate resumes by our AI screening algorithm.
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Role Overview & Description *
          </label>
          <textarea
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the mission of the team, technologies in use, and what success looks like in this position..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Requirements (one per line)
          </label>
          <textarea
            rows={4}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="5+ years experience with modern JavaScript / TypeScript&#10;Hands-on deployment experience with AWS EC2 and S3&#10;Familiarity with Vector embeddings and LLMs"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
        >
          {loading ? 'Publishing Posting...' : 'Publish Job Posting'}
        </button>
      </form>
    </div>
  );
};

export default RecruiterPostJob;
