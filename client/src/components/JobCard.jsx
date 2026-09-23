import React from 'react';
import { MapPin, Briefcase, IndianRupee, Building, Sparkles, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const formatSalaryINR = (min, max, currency = 'INR') => {
  if (!min) return 'Competitive Salary';
  const prefix = (currency === 'INR' || !currency) ? '₹' : '$';
  if (min >= 100000) {
    const minLakhs = (min / 100000).toFixed(min % 100000 === 0 ? 0 : 1);
    const maxLakhs = max ? (max / 100000).toFixed(max % 100000 === 0 ? 0 : 1) : null;
    return maxLakhs ? `${prefix}${minLakhs} - ${prefix}${maxLakhs} LPA` : `${prefix}${minLakhs} LPA`;
  }
  return max
    ? `${prefix}${min.toLocaleString('en-IN')} - ${prefix}${max.toLocaleString('en-IN')}`
    : `${prefix}${min.toLocaleString('en-IN')}`;
};

const JobCard = ({ job, matchPercentage, onApply, isSaved, onToggleSave }) => {
  const { isSeeker } = useAuth();

  const formattedSalary = formatSalaryINR(job.salaryRange?.min, job.salaryRange?.max, job.salaryRange?.currency);

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between">
      <div>
        {/* Header: Company & Action Buttons */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center font-bold text-lg text-indigo-600 dark:text-indigo-400">
              {job.company?.name ? job.company.name[0].toUpperCase() : 'C'}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {job.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Building className="w-3.5 h-3.5" />
                <span>{job.company?.name || 'Confidential Company'}</span>
              </div>
            </div>
          </div>

          {/* Bookmark & AI Match Badge */}
          <div className="flex items-center gap-2">
            {matchPercentage !== undefined && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 animate-pulse">
                <Sparkles className="w-3 h-3" />
                {matchPercentage}% Match
              </span>
            )}
            {isSeeker && onToggleSave && (
              <button
                onClick={() => onToggleSave(job._id)}
                className={`p-2 rounded-xl border transition-colors ${
                  isSaved
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40'
                    : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-indigo-600 hover:border-indigo-300'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save job'}
              >
                <Bookmark className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Description snippet */}
        <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Meta Attributes */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {job.location?.city ? `${job.location.city}, ${job.location.country}` : 'Remote'}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 capitalize">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            {job.jobType || 'Full-time'}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80">
            <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
            {formattedSalary}
          </span>
          {job.location?.workplaceType && (
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 capitalize text-[11px] font-semibold">
              {job.location.workplaceType}
            </span>
          )}
        </div>

        {/* Skills Pills */}
        {job.skillsRequired && job.skillsRequired.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {job.skillsRequired.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
              >
                {skill}
              </span>
            ))}
            {job.skillsRequired.length > 4 && (
              <span className="px-2 py-0.5 text-[11px] text-slate-400">
                +{job.skillsRequired.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          Posted {new Date(job.createdAt).toLocaleDateString()}
        </span>
        {onApply && (
          <button
            onClick={() => onApply(job)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
};

export default JobCard;
