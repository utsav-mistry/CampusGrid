import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import StudentRegister from './pages/Register';
import RecruiterRegister from './pages/RecruiterRegister';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import ExamCenter from './pages/student/ExamCenter';
import TakeExam from './pages/student/TakeExam';
import Progress from './pages/student/Progress';
import Profile from './pages/student/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import SubjectManagement from './pages/admin/SubjectManagement';
import QuestionBank from './pages/admin/QuestionBank';
import StudentManagement from './pages/admin/StudentManagement';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import CreateDrive from './pages/recruiter/CreateDrive';
import ApplicantManagement from './pages/recruiter/ApplicantManagement';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={!user ? <Landing /> : <Navigate to={`/${user.role}/dashboard`} />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <StudentRegister />} />
      <Route path="/recruiter/register" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <RecruiterRegister />} />


      {/* Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/exam-center"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <ExamCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/exam/:attemptId"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <TakeExam />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/progress"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Progress />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subjects"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SubjectManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/questions"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <QuestionBank />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <StudentManagement />
          </ProtectedRoute>
        }
      />

      {/* Recruiter Routes */}
      <Route
        path="/recruiter/dashboard"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <RecruiterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/create-drive"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <CreateDrive />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/drive/:driveId/applicants"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <ApplicantManagement />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
