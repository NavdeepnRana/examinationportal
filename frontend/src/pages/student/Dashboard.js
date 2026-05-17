import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';

const StudentDashboard = () => {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/exams?limit=5&status=published'),
      api.get('/results/my?limit=5'),
    ])
      .then(([examsRes, resultsRes]) => {
        setExams(examsRes.data.data || []);
        setResults(resultsRes.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Student Dashboard</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Available Exams</h2>
            <Link to="/student/exams" className="text-primary-600 text-sm hover:underline">View all</Link>
          </div>
          {exams.length === 0 ? (
            <p className="text-gray-500 text-sm">No exams available right now.</p>
          ) : (
            <ul className="space-y-3">
              {exams.map((exam) => (
                <li key={exam._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium">{exam.title}</p>
                    <p className="text-xs text-gray-500">{exam.subject} · {exam.duration} min</p>
                  </div>
                  <Link to={`/student/exam/${exam._id}`} className="btn-primary text-sm py-1.5 px-3">Start</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Results</h2>
            <Link to="/student/results" className="text-primary-600 text-sm hover:underline">View all</Link>
          </div>
          {results.length === 0 ? (
            <p className="text-gray-500 text-sm">No results yet.</p>
          ) : (
            <ul className="space-y-3">
              {results.map((r) => (
                <li key={r._id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="font-medium">{r.exam?.title}</p>
                  <p className="text-sm text-primary-600">{r.totalScore}/{r.maxScore} marks</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
