import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import {
  Sparkles,
  Sun,
  Moon,
  Bell,
  Briefcase,
  FileText,
  MessageSquare,
  User,
  LogOut,
  Shield,
  PlusCircle,
  BarChart2,
  Menu,
  X
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isSeeker, isRecruiter, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAllNotificationsRead } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                JobSphere<span className="text-slate-900 dark:text-white">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800">
                MERN + Cloud
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/jobs"
              className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors"
            >
              Explore Jobs
            </Link>

            {isSeeker && (
              <>
                <Link
                  to="/seeker/dashboard"
                  className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/seeker/applications"
                  className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors"
                >
                  My Applications
                </Link>
                <Link
                  to="/seeker/resume-analyzer"
                  className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors"
                >
                  ATS Analyzer
                </Link>
                <Link
                  to="/seeker/career-chat"
                  className="px-3 py-2 rounded-lg text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Coach
                </Link>
              </>
            )}

            {isRecruiter && (
              <>
                <Link
                  to="/recruiter/dashboard"
                  className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/recruiter/post-job"
                  className="px-3 py-2 rounded-lg text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post a Job
                </Link>
                <Link
                  to="/recruiter/manage-jobs"
                  className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors"
                >
                  Manage Jobs
                </Link>
              </>
            )}

            {isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="px-3 py-2 rounded-lg text-purple-600 dark:text-purple-400 font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors flex items-center gap-1"
                >
                  <Shield className="w-4 h-4" />
                  Admin Console
                </Link>
                <Link
                  to="/admin/users"
                  className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors"
                >
                  User Management
                </Link>
                <Link
                  to="/admin/ai-logs"
                  className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors"
                >
                  AI Telemetry
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllNotificationsRead}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 py-1">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((n) => (
                            <div
                              key={n._id}
                              className={`py-2.5 px-2 rounded-lg text-xs transition-colors ${
                                !n.isRead ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                              }`}
                            >
                              <div className="font-medium text-slate-900 dark:text-slate-100">{n.title}</div>
                              <p className="text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar & Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-semibold flex items-center justify-center text-xs shadow">
                      {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="hidden sm:block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in duration-100">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="font-medium text-sm text-slate-900 dark:text-white truncate">{user?.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
                        <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {user?.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Explore Jobs
          </Link>
          {isSeeker && (
            <>
              <Link
                to="/seeker/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Dashboard
              </Link>
              <Link
                to="/seeker/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                My Applications
              </Link>
              <Link
                to="/seeker/resume-analyzer"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ATS Analyzer
              </Link>
              <Link
                to="/seeker/career-chat"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-indigo-600 dark:text-indigo-400 font-semibold"
              >
                AI Career Coach
              </Link>
            </>
          )}
          {isRecruiter && (
            <>
              <Link
                to="/recruiter/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Dashboard
              </Link>
              <Link
                to="/recruiter/post-job"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-indigo-600 dark:text-indigo-400 font-semibold"
              >
                Post a Job
              </Link>
              <Link
                to="/recruiter/manage-jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Manage Jobs
              </Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-purple-600 dark:text-purple-400 font-semibold"
              >
                Admin Console
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                User Management
              </Link>
              <Link
                to="/admin/ai-logs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                AI Telemetry
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
