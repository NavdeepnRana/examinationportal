import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';
import ShowResultsButton from '../../components/Teacher/ShowResultsButton';

const TeacherDashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/exams?limit=5')
      .then((res) => setExams(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        <Link to="/teacher/create-exam" className="btn-primary">+ Create Exam</Link>
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-3xl font-bold text-primary-600">{exams.length}</p>
          <p className="text-gray-500 text-sm">Recent Exams</p>
        </div>
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Your Exams</h2>
        {exams.length === 0 ? (
          <p className="text-gray-500 text-sm">No exams yet. Create your first exam!</p>
        ) : (
          <ul className="space-y-3">
            {exams.map((exam) => (
              <li key={exam._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium">{exam.title}</p>
                  <p className="text-xs text-gray-500">{exam.subject} · {exam.status}</p>
                </div>
                <ShowResultsButton examId={exam._id} resultCount={exam.resultCount} hasResults={exam.hasResults} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
