import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import Loading from './components/common/Loading';

import Login from './pages/Login';
import Register from './pages/Register';

import StudentDashboard from './pages/student/Dashboard';
import ExamList from './pages/student/ExamList';
import TakeExam from './pages/student/TakeExam';
import Results from './pages/student/Results';
import ResultDetail from './pages/student/ResultDetail';

import TeacherDashboard from './pages/teacher/Dashboard';
import CreateExam from './pages/teacher/CreateExam';
import TeacherExamList from './pages/teacher/ExamList';
import Submissions from './pages/teacher/Submissions';
import ReviewResult from './pages/teacher/ReviewResult';

import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ReviewFeedback from './pages/admin/ReviewFeedback';

const HomeRedirect = () => {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return <Loading fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
};

const StudentRoutes = () => (
  <Layout>
    <Routes>
      <Route index element={<StudentDashboard />} />
      <Route path="exams" element={<ExamList />} />
      <Route path="exam/:examId" element={<TakeExam />} />
      <Route path="results" element={<Results />} />
      <Route path="result/:id" element={<ResultDetail />} />
    </Routes>
  </Layout>
);

const TeacherRoutes = () => (
  <Layout>
    <Routes>
      <Route index element={<TeacherDashboard />} />
      <Route path="create-exam" element={<CreateExam />} />
      <Route path="exams" element={<TeacherExamList />} />
      <Route path="submissions/:examId" element={<Submissions />} />
      <Route path="review/:resultId" element={<ReviewResult />} />
    </Routes>
  </Layout>
);

const AdminRoutes = () => (
  <Layout>
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="users" element={<ManageUsers />} />
      <Route path="feedback" element={<ReviewFeedback />} />
    </Routes>
  </Layout>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/student/*"
              element={
                <ProtectedRoute roles={['student']}>
                  <StudentRoutes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/*"
              element={
                <ProtectedRoute roles={['teacher']}>
                  <TeacherRoutes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminRoutes />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
