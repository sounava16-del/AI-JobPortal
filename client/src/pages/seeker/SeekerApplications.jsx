import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import {
  Briefcase,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Clock,
  Building,
  Calendar,
  AlertCircle
} from 'lucide-react';

const STAGES = ['Applied', 'Reviewing', 'Shortlisted', 'Interviewing', 'Accepted'];

const SeekerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openChatWith } = useSocket();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get('/applications/my-applications');
        if (res.data.success) {
          setApplications(res.data.applications);
        }
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStageIndex = (status) => {
    if (status === 'Rejected') return -1;
    return STAGES.indexOf(status);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Application Tracking Pipeline
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor your interview statuses and real-time recruiter reviews
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">No Applications Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You haven't submitted any job applications. Browse the open roles to find positions that fit your skills.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const currentStageIdx = getStageIndex(app.status);
            const isRejected = app.status === 'Rejected';

            return (
              <div
                key={app._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5"
              >
                {/* Top Details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {app.job?.title || 'Position Title'}
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                        {app.job?.jobType}
                      </span>
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
                      <Building className="w-3.5 h-3.5" />
                      <span>{app.job?.company?.name || 'Company'}</span>
                      <span>•</span>
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Badges & Chat Action */}
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      AI Match: {app.aiMatchScore}%
                    </span>

                    {app.job?.recruiter && (
                      <button
                        onClick={() => openChatWith(app.job.recruiter, app.job)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                        Chat Recruiter
                      </button>
                    )}
                  </div>
                </div>

                {/* Visual Pipeline Progression */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Hiring Pipeline Status
                  </div>

                  {isRejected ? (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Application not selected for next steps. Thank you for your interest.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 gap-2">
                      {STAGES.map((stage, idx) => {
                        const isCompleted = idx <= currentStageIdx;
                        const isCurrent = idx === currentStageIdx;

                        return (
                          <div key={stage} className="flex flex-col items-center text-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                isCompleted
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                              } ${isCurrent ? 'ring-4 ring-indigo-100 dark:ring-indigo-900/60' : ''}`}
                            >
                              {idx + 1}
                            </div>
                            <span
                              className={`mt-2 text-[11px] font-medium capitalize ${
                                isCompleted
                                  ? 'text-slate-900 dark:text-white font-semibold'
                                  : 'text-slate-400'
                              }`}
                            >
                              {stage}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* AI Screening Summary */}
                {app.aiAnalysis?.matchSummary && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">
                      AI Screening Evaluation:
                    </span>
                    {app.aiAnalysis.matchSummary}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SeekerApplications;
