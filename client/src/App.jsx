import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ChatModal from './components/ChatModal';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SeekerJobs from './pages/seeker/SeekerJobs';
import SeekerDashboard from './pages/seeker/SeekerDashboard';
import SeekerApplications from './pages/seeker/SeekerApplications';
import SeekerResumeAnalyzer from './pages/seeker/SeekerResumeAnalyzer';
import SeekerCareerChat from './pages/seeker/SeekerCareerChat';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterPostJob from './pages/recruiter/RecruiterPostJob';
import RecruiterManageJobs from './pages/recruiter/RecruiterManageJobs';
import RecruiterApplicants from './pages/recruiter/RecruiterApplicants';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAILogs from './pages/admin/AdminAILogs';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/jobs" element={<SeekerJobs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Seeker Routes */}
          <Route element={<ProtectedRoute allowedRoles={['seeker']} />}>
            <Route path="/seeker/dashboard" element={<SeekerDashboard />} />
            <Route path="/seeker/applications" element={<SeekerApplications />} />
            <Route path="/seeker/resume-analyzer" element={<SeekerResumeAnalyzer />} />
            <Route path="/seeker/career-chat" element={<SeekerCareerChat />} />
          </Route>

          {/* Recruiter Routes */}
          <Route element={<ProtectedRoute allowedRoles={['recruiter', 'admin']} />}>
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/post-job" element={<RecruiterPostJob />} />
            <Route path="/recruiter/manage-jobs" element={<RecruiterManageJobs />} />
            <Route path="/recruiter/jobs/:jobId/applicants" element={<RecruiterApplicants />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/ai-logs" element={<AdminAILogs />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <ChatModal />
    </div>
  );
}

export default App;
