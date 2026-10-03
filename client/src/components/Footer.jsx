import React from 'react';
import { Sparkles, Server, Database, Cloud, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">JobSphere AI</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} AI Based Smart Job Portal. All rights reserved.
            </span>
          </div>

          {/* Tech Stack Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Database className="w-3 h-3 text-emerald-500" /> MongoDB Atlas
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Server className="w-3 h-3 text-indigo-500" /> Node + Express
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Sparkles className="w-3 h-3 text-amber-500" /> Groq LPU AI Engine
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Cloud className="w-3 h-3 text-sky-500" /> AWS EC2 & S3
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
