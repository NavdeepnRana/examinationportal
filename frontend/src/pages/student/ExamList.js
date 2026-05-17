import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchExams = useCallback(() => {
    setLoading(true);
    api
      .get(`/exams?page=${page}&limit=10&status=published&search=${search}`)
      .then((res) => {
        setExams(res.data.data || []);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(fetchExams, 300);
    return () => clearTimeout(t);
  }, [fetchExams]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Available Exams</h1>
      <input
        type="search"
        placeholder="Search exams..."
        className="input-field max-w-md mb-6"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />
      {loading ? (
        <Loading />
      ) : exams.length === 0 ? (
        <p className="text-gray-500">No exams found.</p>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <div key={exam._id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">{exam.title}</h3>
                <p className="text-gray-500 text-sm">{exam.subject} · {exam.duration} min · {exam.totalMarks} marks</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(exam.startTime).toLocaleString()} — {new Date(exam.endTime).toLocaleString()}
                </p>
              </div>
              <Link to={`/student/exam/${exam._id}`} className="btn-primary shrink-0">Take Exam</Link>
            </div>
          ))}
        </div>
      )}
      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default ExamList;
