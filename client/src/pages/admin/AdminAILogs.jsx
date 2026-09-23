import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Cpu, Sparkles, Filter, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const AdminAILogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featureFilter, setFeatureFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (featureFilter) params.feature = featureFilter;

      const res = await api.get('/admin/ai-logs', { params });
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error('Failed to load AI logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [featureFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-indigo-600" />
            AI Execution Telemetry & Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time inference records, token usage, latency audits, and provider routing
          </p>
        </div>

        {/* Feature Filter */}
        <select
          value={featureFilter}
          onChange={(e) => setFeatureFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs shadow-xs"
        >
          <option value="">All Features</option>
          <option value="screening">Resume Screening</option>
          <option value="recommendation">Job Recommendations</option>
          <option value="career_chat">Career Coach Chat</option>
          <option value="interview_questions">Interview Questions</option>
          <option value="resume_analysis">ATS Analysis</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading AI telemetry records...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No AI logs recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Feature</th>
                  <th className="py-3.5 px-4">Provider / Model</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Tokens (Prompt/Comp)</th>
                  <th className="py-3.5 px-4">Latency</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors font-mono">
                    <td className="py-3.5 px-4 font-sans font-semibold text-slate-900 dark:text-white capitalize">
                      {log.feature?.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 uppercase text-[11px] block">
                        {log.provider}
                      </span>
                      <span className="text-[10px] text-slate-400">{log.model}</span>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-600 dark:text-slate-300">
                      {log.user?.name || log.user?.email || 'Anonymous'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {log.promptTokens} / {log.completionTokens}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px]">
                        {log.durationMs}ms
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'success'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {log.status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400 text-[11px]">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAILogs;
