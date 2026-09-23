import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import JobCard from '../../components/JobCard';
import { Search, MapPin, Filter, Sparkles, X, CheckCircle, AlertCircle } from 'lucide-react';

const SeekerJobs = () => {
  const { user, isSeeker } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [workplaceType, setWorkplaceType] = useState('');
  const [jobType, setJobType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [savedJobIds, setSavedJobIds] = useState([]);

  // Apply Modal State
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(null);
  const [applyError, setApplyError] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (keyword) params.keyword = keyword;
      if (location) params.location = location;
      if (workplaceType) params.workplaceType = workplaceType;
      if (jobType) params.jobType = jobType;
      if (experienceLevel) params.experienceLevel = experienceLevel;

      const res = await api.get('/jobs', { params });
      if (res.data.success) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    if (user?.savedJobs) {
      setSavedJobIds(user.savedJobs.map(j => (typeof j === 'string' ? j : j._id)));
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleToggleSave = async (jobId) => {
    try {
      const res = await api.post(`/jobs/${jobId}/save`);
      if (res.data.success) {
        if (res.data.isSaved) {
          setSavedJobIds(prev => [...prev, jobId]);
        } else {
          setSavedJobIds(prev => prev.filter(id => id !== jobId));
        }
      }
    } catch (err) {
      console.error('Failed to save job:', err);
    }
  };

  const handleOpenApply = (job) => {
    setSelectedJob(job);
    setCoverLetter(`Dear Hiring Team at ${job.company?.name || 'Company'},\n\nI am thrilled to apply for the ${job.title} role. With my background in ${user?.skills?.slice(0, 3).join(', ') || 'modern software development'}, I believe I would be a strong fit for your engineering team.\n\nBest regards,\n${user?.name || 'Candidate'}`);
    setApplySuccess(null);
    setApplyError('');
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    setApplying(true);
    setApplyError('');
    setApplySuccess(null);

    try {
      const res = await api.post(`/applications/apply/${selectedJob._id}`, {
        coverLetter
      });

      if (res.data.success) {
        setApplySuccess({
          score: res.data.application.aiMatchScore,
          summary: res.data.application.aiAnalysis?.matchSummary || 'Application submitted successfully!'
        });
      }
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit application. Have you already applied?');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Explore Career Opportunities
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Discover vetted positions matched with intelligent ATS screening
        </p>
      </div>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearch} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Title, skill, or keyword (e.g. React, Node.js)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, state, or country (e.g. San Francisco)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            Search Jobs
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          <select
            value={workplaceType}
            onChange={(e) => setWorkplaceType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs"
          >
            <option value="">All Workplace Types</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="on-site">On-Site</option>
          </select>

          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs"
          >
            <option value="">All Job Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>

          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs"
          >
            <option value="">All Experience Levels</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
            <option value="lead">Lead / Principal</option>
          </select>

          {(workplaceType || jobType || experienceLevel) && (
            <button
              type="button"
              onClick={() => {
                setWorkplaceType('');
                setJobType('');
                setExperienceLevel('');
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs ml-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </form>

      {/* Jobs Feed */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
          <Search className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">No Jobs Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try broadening your search keywords or resetting workplace and experience filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              isSaved={savedJobIds.includes(job._id)}
              onToggleSave={handleToggleSave}
              onApply={isSeeker ? handleOpenApply : undefined}
            />
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                  Apply for {selectedJob.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedJob.company?.name}</p>
              </div>
            </div>

            {applySuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg text-slate-900 dark:text-white">Application Submitted!</h4>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                  <Sparkles className="w-3.5 h-3.5" /> AI Match Score: {applySuccess.score}%
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
                  {applySuccess.summary}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                {applyError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{applyError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Cover Letter / Statement
                  </label>
                  <textarea
                    rows={5}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Your primary default resume will automatically be screened by the AI ATS engine.</span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedJob(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow transition-all disabled:opacity-50"
                  >
                    {applying ? 'Screening & Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeekerJobs;
