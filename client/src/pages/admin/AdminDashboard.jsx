import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Shield,
  Users,
  Briefcase,
  FileCheck,
  Cpu,
  ArrowRight,
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-800">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-3">
            <Shield className="w-3.5 h-3.5" />
            Antigravity Admin Center
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Platform Infrastructure & AI Telemetry
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Monitor real-time system metrics, AI operations, users, and job listings
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/admin/users"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/ai-logs"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow transition-colors"
          >
            View AI Logs
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Registered Users</span>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {data?.stats?.users?.total || 0}
                </h3>
                <span className="text-[10px] text-slate-400">
                  {data?.stats?.users?.seekers || 0} Seekers • {data?.stats?.users?.recruiters || 0} Recruiters
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Jobs</span>
                <h3 className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                  {data?.stats?.jobs?.total || 0}
                </h3>
                <span className="text-[10px] text-slate-400">
                  {data?.stats?.jobs?.active || 0} Active Postings
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Applications</span>
                <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {data?.stats?.applications?.total || 0}
                </h3>
                <span className="text-[10px] text-slate-400">
                  {data?.stats?.applications?.hired || 0} Hired Candidates
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">AI Inferences</span>
                <h3 className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                  {data?.stats?.aiOperations?.total || 0}
                </h3>
                <span className="text-[10px] text-slate-400">Screening & Question Pipelines</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Activity Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Signups */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  Recent User Registrations
                </h3>
                <Link to="/admin/users" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                  View all
                </Link>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {(data?.recentUsers || []).map((u) => (
                  <div key={u._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">{u.name}</span>
                      <span className="text-[11px] text-slate-500">{u.email}</span>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {u.role}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  Live Application Activity
                </h3>
                <Link to="/admin/ai-logs" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                  AI Logs
                </Link>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {(data?.recentApplications || []).map((app) => (
                  <div key={app._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {app.applicant?.name}
                      </span>
                      <span className="text-[11px] text-slate-500">{app.job?.title}</span>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {app.status}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
