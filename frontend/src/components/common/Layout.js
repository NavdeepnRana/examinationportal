import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const navItems = {
  student: [
    { path: '/student', label: 'Dashboard', exact: true },
    { path: '/student/exams', label: 'Exams' },
    { path: '/student/results', label: 'Results' },
  ],
  teacher: [
    { path: '/teacher', label: 'Dashboard', exact: true },
    { path: '/teacher/create-exam', label: 'Create Exam' },
    { path: '/teacher/exams', label: 'My Exams' },
  ],
  admin: [
    { path: '/admin', label: 'Dashboard', exact: true },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/feedback', label: 'Review Feedback' },
  ],
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const items = navItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path, exact) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to={`/${user?.role}`} className="text-xl font-bold text-primary-600">
                ExamPortal
              </Link>
              <div className="hidden md:flex gap-1">
                {items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path, item.exact)
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Toggle theme">
                {darkMode ? '☀️' : '🌙'}
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">{user?.name}</span>
              <button type="button" onClick={handleLogout} className="btn-secondary text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
};

export default Layout;
