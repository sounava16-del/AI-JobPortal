import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import InterviewQuestionsModal from '../../components/InterviewQuestionsModal';
import {
  Sparkles,
  User,
  FileText,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  Calendar,
  Tag,
  ArrowLeft
} from 'lucide-react';

const STATUS_OPTIONS = ['Applied', 'Reviewing', 'Shortlisted', 'Interviewing', 'Accepted', 'Rejected'];

const RecruiterApplicants = () => {
  const { jobId } = useParams();
  const [jobTitle, setJobTitle] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const { openChatWith } = useSocket();

  // Questions Modal State
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [questionsModalOpen, setQuestionsModalOpen] = useState(false);
  const [targetCandidateName, setTargetCandidateName] = useState('');
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/applications/job/${jobId}?status=${statusFilter}`);
      if (res.data.success) {
        setJobTitle(res.data.jobTitle);
        setApplicants(res.data.applications);
      }
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId, statusFilter]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await api.put(`/applications/${appId}/status`, { status: newStatus });
      if (res.data.success) {
        setApplicants(prev =>
          prev.map(a => (a._id === appId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleGenerateQuestions = async (app) => {
    setGeneratingQuestions(true);
    setTargetCandidateName(app.applicant?.name || 'Candidate');
    try {
      const res = await api.post(`/ai/interview-questions/${app._id}`);
      if (res.data.success) {
        setSelectedQuestions(res.data.questions);
        setQuestionsModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to generate interview questions:', err);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/recruiter/manage-jobs"
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Jobs
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Candidates for: {jobTitle || 'Job Role'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Applicants automatically ranked by AI ATS match compatibility
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Filter Stage:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs shadow-xs"
          >
            <option value="all">All Stages ({applicants.length})</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidates List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : applicants.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
          <User className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">No Applicants Found</h3>
          <p className="text-xs text-slate-500 mt-1">No candidate has applied under this stage filter yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map((app) => (
            <div
              key={app._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
            >
              {/* Applicant Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                    {app.applicant?.name ? app.applicant.name[0].toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {app.applicant?.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {app.applicant?.headline || 'Candidate Profile'} • {app.applicant?.email}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* AI Match Score Badge */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      {app.aiMatchScore}% Match
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5 font-medium">
                      Recommendation: {app.aiAnalysis?.recommendation || 'Hire'}
                    </span>
                  </div>

                  {/* Stage Dropdown */}
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* AI Match Summary & Skills */}
              {app.aiAnalysis?.matchSummary && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">
                    AI Screening Insight:
                  </span>
                  {app.aiAnalysis.matchSummary}
                </div>
              )}

              {/* Skills Tags */}
              {app.applicant?.skills && app.applicant.skills.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Skills:
                  </span>
                  {app.applicant.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Cover Letter Quote */}
              {app.coverLetter && (
                <div className="text-xs text-slate-500 italic bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  "{app.coverLetter}"
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  {app.resume ? (
                    <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                      <FileText className="w-3.5 h-3.5" />
                      Resume: {app.resume.fileName} (ATS Score: {app.resume.atsScore}%)
                    </span>
                  ) : (
                    <span>Default Profile Application</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerateQuestions(app)}
                    disabled={generatingQuestions}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    AI Interview Questions
                  </button>

                  <button
                    onClick={() => openChatWith(app.applicant, { title: jobTitle, _id: jobId })}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow transition-colors flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Chat Candidate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tailored Questions Modal */}
      <InterviewQuestionsModal
        isOpen={questionsModalOpen}
        onClose={() => setQuestionsModalOpen(false)}
        questions={selectedQuestions}
        jobTitle={jobTitle}
        candidateName={targetCandidateName}
      />
    </div>
  );
};

export default RecruiterApplicants;
