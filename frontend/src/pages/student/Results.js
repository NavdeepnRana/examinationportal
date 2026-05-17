import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';

const Results = () => {
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/results/my?page=${page}&limit=10`)
      .then((res) => {
        setResults(res.data.data || []);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Results</h1>
      {results.length === 0 ? (
        <p className="text-gray-500">No results yet. Complete an exam to see your scores.</p>
      ) : (
        <div className="grid gap-4">
          {results.map((r) => (
            <div key={r._id} className="card flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{r.exam?.title}</h3>
                <p className="text-sm text-gray-500">{r.exam?.subject}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Submitted: {r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '—'}
                  {r.tabSwitchCount > 0 && (
                    <span className="text-amber-600 ml-2">· Tab switches: {r.tabSwitchCount}</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">{r.totalScore}/{r.maxScore}</p>
                <p className="text-xs text-gray-400">MCQ: {r.mcqScore} · Theory: {r.theoryScore}</p>
                <Link to={`/student/result/${r._id}`} className="text-sm text-primary-600 hover:underline mt-1 inline-block">
                  View feedback
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default Results;
