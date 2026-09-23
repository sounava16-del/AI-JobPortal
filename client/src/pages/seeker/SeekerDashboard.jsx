import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../api/axios';
import JobCard from '../../components/JobCard';
import {
  Sparkles,
  Briefcase,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Bot
} from 'lucide-react';

const SeekerDashboard = () => {
  const { user } = useAuth();
  const { openChatWith } = useSocket();
  const [stats, setStats] = useState({
    applicationsCount: 0,
    shortlistedCount: 0,
    atsScore: 0,
    recommendedCount: 0
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appsRes, recsRes, resumesRes] = await Promise.all([
          api.get('/applications/my-applications'),
          api.get('/ai/recommendations'),
          api.get('/resumes/my-resumes')
        ]);

        const apps = appsRes.data.applications || [];
        const shortlisted = apps.filter(a => ['Shortlisted', 'Interviewing', 'Accepted'].includes(a.status));
        const resumes = resumesRes.data.resumes || [];
        const defaultResume = resumes.find(r => r.isDefault) || resumes[0];

        setStats({
          applicationsCount: apps.length,
          shortlistedCount: shortlisted.length,
          atsScore: defaultResume ? defaultResume.atsScore : 0,
          recommendedCount: (recsRes.data.recommendations || []).length
        });

        setRecommendations(recsRes.data.recommendations || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-6 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            AI Candidate Hub
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-indigo-100 leading-relaxed">
            {user?.headline || 'Explore smart job matches tailored to your verified technical skills.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/jobs"
              className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-semibold text-xs shadow hover:bg-indigo-50 transition-colors"
            >
              Browse Jobs
            </Link>
            <Link
              to="/seeker/career-chat"
              className="px-5 py-2.5 rounded-xl bg-indigo-500/30 hover:bg-indigo-500/40 text-white font-semibold text-xs backdrop-blur-md border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <Bot className="w-4 h-4" />
              Ask AI Coach
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Applied Jobs</span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.applicationsCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Shortlisted / Interviews</span>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.shortlistedCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Resume ATS Score</span>
            <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {stats.atsScore ? `${stats.atsScore}%` : 'Not uploaded'}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">AI Recommendations</span>
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.recommendedCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* AI Job Recommendations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              AI Recommended Jobs For You
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Matched in real-time against your profile and uploaded resume competencies
            </p>
          </div>
          <Link
            to="/jobs"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View all jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">No Recommendations Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Upload your PDF resume in the ATS Analyzer to unlock personalized AI job recommendations.
            </p>
            <Link
              to="/seeker/resume-analyzer"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow"
            >
              <Sparkles className="w-3.5 h-3.5" /> Upload Resume
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 6).map((rec) => (
              <JobCard
                key={rec.job._id}
                job={rec.job}
                matchPercentage={rec.matchPercentage}
                onApply={() => (window.location.href = `/jobs`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeekerDashboard;
