import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then((res) => {
        setAnalytics(res.data.analytics);
        setRecent(res.data.recentSubmissions || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const stats = [
    { label: 'Students', value: analytics?.students, color: 'text-blue-600' },
    { label: 'Teachers', value: analytics?.teachers, color: 'text-green-600' },
    { label: 'Exams', value: analytics?.exams, color: 'text-purple-600' },
    { label: 'Submissions', value: analytics?.submissions, color: 'text-orange-600' },
    { label: 'Pending Review', value: analytics?.pendingFeedback, color: 'text-red-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Recent Submissions</h2>
          {recent.length === 0 ? <p className="text-gray-500 text-sm">None yet</p> : (
            <ul className="space-y-2">
              {recent.map((r) => (
                <li key={r._id} className="text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  {r.student?.name} — {r.exam?.title} — {r.totalScore}/{r.maxScore}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link to="/admin/users" className="block btn-secondary text-center">Manage Users</Link>
            <Link to="/admin/feedback" className="block btn-secondary text-center">Review AI Feedback</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
