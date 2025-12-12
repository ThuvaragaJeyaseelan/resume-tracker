import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth';

// Auth Pages
import { LoginPage, SignupPage } from './pages/auth';

// Public Pages
import { JobBoardPage, JobDetailPage } from './pages/public';

// Recruiter Pages
import { 
  DashboardPage, 
  JobsPage, 
  CreateJobPage,
  EditJobPage,
  JobApplicantsPage 
} from './pages/recruiter';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<JobBoardPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailPage />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Protected Recruiter Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jobs" 
            element={
              <ProtectedRoute>
                <JobsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jobs/create" 
            element={
              <ProtectedRoute>
                <CreateJobPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jobs/:jobId/applicants" 
            element={
              <ProtectedRoute>
                <JobApplicantsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jobs/:jobId/edit" 
            element={
              <ProtectedRoute>
                <EditJobPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
