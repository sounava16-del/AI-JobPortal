import React from 'react';
import { X, Sparkles, HelpCircle, CheckCircle2, Copy } from 'lucide-react';

const InterviewQuestionsModal = ({ isOpen, onClose, questions = [], jobTitle, candidateName }) => {
  if (!isOpen) return null;

  const handleCopyAll = () => {
    const formatted = questions
      .map(
        (q, i) =>
          `Q${i + 1} [${q.category}]: ${q.question}\nExpected: ${q.expectedAnswer}\n`
      )
      .join('\n');
    navigator.clipboard.writeText(formatted);
    alert('Questions copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                AI Generated Interview Questions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tailored for {candidateName} • {jobTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {questions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No interview questions generated yet.
            </div>
          ) : (
            questions.map((q, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Question #{idx + 1}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                    {q.category || 'General'}
                  </span>
                </div>

                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                  {q.question}
                </h4>

                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      Evaluation Criteria / Expected Answer:{' '}
                    </span>
                    {q.expectedAnswer}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewQuestionsModal;
