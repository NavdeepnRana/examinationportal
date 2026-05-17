import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';

const Submissions = () => {
  const { examId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/results/exam/${examId}/submissions?page=${page}&limit=10`)
      .then((res) => {
        setSubmissions(res.data.data || []);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [examId, page]);

  if (loading) return <Loading />;

  return (
    <div>
      <Link to="/teacher/exams" className="text-primary-600 text-sm hover:underline mb-4 inline-block">← Back</Link>
      <h1 className="text-2xl font-bold mb-6">Student Results</h1>
      <p className="text-sm text-gray-500 mb-4">Only shows results that students can see on their dashboard (after exam submission).</p>
      {submissions.length === 0 ? (
        <p className="text-gray-500">No results yet. Students must complete and submit the exam first.</p>
      ) : (
        <div className="grid gap-3">
          {submissions.map((s) => (
            <div key={s._id} className="card flex justify-between items-center">
              <div>
                <p className="font-medium">{s.student?.name}</p>
                <p className="text-sm text-gray-500">{s.student?.email}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary-600">{s.totalScore}/{s.maxScore}</p>
                <Link to={`/teacher/review/${s._id}`} className="text-sm text-primary-600 hover:underline">Review & Edit</Link>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default Submissions;
