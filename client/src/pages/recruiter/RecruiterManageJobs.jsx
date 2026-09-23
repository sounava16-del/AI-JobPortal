import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Briefcase, Users, PlusCircle, Trash2, CheckCircle, XCircle, Sparkles } from 'lucide-react';

const RecruiterManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/recruiter/my-jobs');
      if (res.data.success) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      console.error('Failed to load recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      const res = await api.put(`/jobs/${job._id}`, { status: newStatus });
      if (res.data.success) {
        setJobs(prev => prev.map(j => (j._id === job._id ? res.data.job : j)));
      }
    } catch (err) {
      console.error('Failed to update job status:', err);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const res = await api.delete(`/jobs/${jobId}`);
      if (res.data.success) {
        setJobs(prev => prev.filter(j => j._id !== jobId));
      }
    } catch (err) {
      console.error('Failed to delete job:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Manage Job Listings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review applicant pipelines and update role statuses
          </p>
        </div>

        <Link
          to="/recruiter/post-job"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Post New Job
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">No Jobs Published</h3>
          <p className="text-xs text-slate-500 mt-1">Create your first role to start accepting candidates.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {jobs.map((job) => (
            <div key={job._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{job.title}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      job.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 font-medium">
                  <span className="capitalize">{job.jobType}</span>
                  <span>•</span>
                  <span>{job.location?.city || 'Remote'}</span>
                  <span>•</span>
                  <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions & Applicant Counts */}
              <div className="flex items-center gap-3">
                <Link
                  to={`/recruiter/jobs/${job._id}/applicants`}
                  className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{job.applicantsCount || 0} Candidates</span>
                </Link>

                <button
                  onClick={() => handleToggleStatus(job)}
                  className={`p-2 rounded-xl border text-xs font-medium transition-colors ${
                    job.status === 'active'
                      ? 'border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-900 dark:hover:bg-amber-950/40'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-950/40'
                  }`}
                  title={job.status === 'active' ? 'Close job' : 'Reactivate job'}
                >
                  {job.status === 'active' ? 'Close' : 'Reopen'}
                </button>

                <button
                  onClick={() => handleDeleteJob(job._id)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterManageJobs;
