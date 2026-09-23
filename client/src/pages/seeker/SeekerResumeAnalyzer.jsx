import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Tag,
  Trash2,
  Star
} from 'lucide-react';

const SeekerResumeAnalyzer = () => {
  const [resumes, setResumes] = useState([]);
  const [activeResume, setActiveResume] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes/my-resumes');
      if (res.data.success) {
        setResumes(res.data.resumes);
        if (res.data.resumes.length > 0 && !activeResume) {
          const defaultRes = res.data.resumes.find(r => r.isDefault) || res.data.resumes[0];
          setActiveResume(defaultRes);
        }
      }
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setFile(null);
        setActiveResume(res.data.resume);
        fetchResumes();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload and parse resume');
    } finally {
      setUploading(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await api.put(`/resumes/${id}/default`);
      if (res.data.success) {
        fetchResumes();
      }
    } catch (err) {
      console.error('Failed to set default resume:', err);
    }
  };

  const handleDeleteResume = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      const res = await api.delete(`/resumes/${id}`);
      if (res.data.success) {
        if (activeResume?._id === id) {
          setActiveResume(null);
        }
        fetchResumes();
      }
    } catch (err) {
      console.error('Failed to delete resume:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-500" />
          AI Resume ATS Analyzer & Feedback
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Upload your PDF resume to receive instant ATS compatibility scores, skill extraction, and optimization insights
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-8 text-center shadow-sm">
        <form onSubmit={handleFileUpload} className="max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Upload Your PDF Resume</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports PDF, DOCX (Max 10MB). Automatically parsed with AWS S3 / Local storage.
            </p>
          </div>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950/60 dark:file:text-indigo-300"
          />

          {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50"
          >
            {uploading ? 'Analyzing Resume with AI...' : 'Scan & Analyze Resume'}
          </button>
        </form>
      </div>

      {/* Active Resume Analysis Breakdown */}
      {activeResume ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: ATS Score & Overview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ATS Compatibility Score
              </span>
              <div className="my-4 relative inline-flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border-8 border-indigo-50 dark:border-indigo-950 flex items-center justify-center">
                  <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {activeResume.atsScore || 75}%
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {activeResume.feedback?.summary || 'Standard resume analysis complete.'}
              </p>
            </div>

            {/* Extracted Skills */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mb-2.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" /> Detected Technical Skills (
                {activeResume.parsedSkills?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(activeResume.parsedSkills || []).map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Resume File Details */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>File:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                  {activeResume.fileName}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Storage:</span>
                <span className="capitalize">{activeResume.storageType || 'local'}</span>
              </div>
              <div className="flex justify-between">
                <span>Uploaded:</span>
                <span>{new Date(activeResume.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Right Columns: AI Feedback & Optimization Tips */}
          <div className="lg:col-span-2 space-y-6">
            {/* Strengths */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Resume Strengths
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {(activeResume.feedback?.strengths || []).map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Areas for Improvement
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {(activeResume.feedback?.weaknesses || []).map((w, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested ATS Keywords to Add */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-purple-500" />
                Recommended High-Impact Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {(activeResume.feedback?.missingKeywords || []).map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                  >
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400 text-xs">
          No resume selected. Upload a PDF resume above to view ATS analytics.
        </div>
      )}

      {/* Uploaded Resumes List */}
      {resumes.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Uploaded Resumes</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {resumes.map((res) => (
              <div key={res._id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setActiveResume(res)}
                >
                  <FileText className="w-5 h-5 text-indigo-500" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white hover:underline">
                      {res.fileName}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      ATS: {res.atsScore}% • {new Date(res.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {res.isDefault && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Default
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!res.isDefault && (
                    <button
                      onClick={() => handleSetDefault(res._id)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1"
                    >
                      <Star className="w-3 h-3" /> Make Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteResume(res._id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeekerResumeAnalyzer;
