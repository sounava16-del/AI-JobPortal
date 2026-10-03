import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Search,
  Briefcase,
  FileCheck,
  Bot,
  Zap,
  ArrowRight,
  Shield,
  Layers,
  Users,
  Compass,
  CheckCircle,
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated, isSeeker, isRecruiter } = useAuth();

  return (
    <div className="relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-3xl pointer-events-none rounded-full" />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs mb-8">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Next-Generation AI Recruitment Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
          Hire Smarter. Match Faster.{' '}
          <span className="block mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Powered by Modern AI.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
          JobSphere AI connects high-caliber talent with top-tier companies. Featuring automated PDF resume screening, smart ATS ranking, tailored interview question generation, and real-time candidate chat.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/jobs"
            className="px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.02] flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Explore Open Roles
          </Link>

          {!isAuthenticated ? (
            <Link
              to="/register"
              className="px-7 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2"
            >
              Post a Job / Sign Up
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : isRecruiter ? (
            <Link
              to="/recruiter/post-job"
              className="px-7 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-xl shadow-purple-600/25 transition-all flex items-center gap-2"
            >
              Post a Job
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/seeker/dashboard"
              className="px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xl shadow-emerald-600/25 transition-all flex items-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Architected for Modern Intelligent Hiring
          </h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            End-to-end recruitment infrastructure combining full-stack MERN with intelligent LLM screening algorithms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              AI Resume Screening
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Extracts text from PDF resumes, calculates comprehensive ATS match scores, and reveals skill alignment percentages.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-500 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Smart Recommendations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Algorithms dynamically match candidate skill profiles against open positions, sorting by relevance and compatibility.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-pink-500 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-4">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              AI Career Coach
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Real-time conversational mentor offering tailored advice on resume bullet points, interview preparation, and salary negotiation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Real-time Chat & 2FA
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Direct WebSocket messaging between candidates and recruiters, secured with two-factor email OTP authentication.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
