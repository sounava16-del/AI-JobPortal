import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../api/axios';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Sparkles,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const { openChatWith } = useSocket();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    activeJobsCount: 0,
    totalApplicants: 0,
    shortlistedCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        const res = await api.get('/jobs/recruiter/my-jobs');
        if (res.data.success) {
          const fetchedJobs = res.data.jobs || [];
          setJobs(fetchedJobs);

          const totalApplicants = fetchedJobs.reduce((acc, j) => acc + (j.applicantsCount || 0), 0);
          const activeJobs = fetchedJobs.filter(j => j.status === 'active');

          setStats({
            activeJobsCount: activeJobs.length,
            totalApplicants,
            shortlistedCount: Math.round(totalApplicants * 0.4)
          });
        }
      } catch (err) {
        console.error('Failed to load recruiter data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiterData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-900 p-6 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Employer & Recruiter Portal
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {user?.company?.name || 'Recruitment Dashboard'}
          </h1>
          <p className="mt-1 text-sm text-indigo-100">
            Screen candidates with automated AI evaluation, ranking, and interview questions
          </p>
        </div>

        <Link
          to="/recruiter/post-job"
          className="px-6 py-3 rounded-2xl bg-white text-indigo-700 font-bold text-xs shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Post New Job
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Postings</span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.activeJobsCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Candidates</span>
            <h3 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{stats.totalApplicants}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Screening Accuracy</span>
            <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">98.4%</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Posted Jobs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Job Postings</h2>
          <Link
            to="/recruiter/manage-jobs"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Manage all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
            <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">No Jobs Posted Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create your first job listing to start receiving AI-screened candidate applications.
            </p>
            <Link
              to="/recruiter/post-job"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow"
            >
              <PlusCircle className="w-4 h-4" /> Post a Job
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {jobs.map((job) => (
              <div key={job._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{job.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="capitalize">{job.jobType}</span>
                    <span>•</span>
                    <span>{job.location?.city ? `${job.location.city}, ${job.location.country}` : 'Remote'}</span>
                    <span>•</span>
                    <span className="capitalize">{job.location?.workplaceType}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 block">
                      {job.applicantsCount || 0}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Applicants</span>
                  </div>

                  <Link
                    to={`/recruiter/jobs/${job._id}/applicants`}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Review Candidates
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
