import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import ShowResultsButton from '../../components/Teacher/ShowResultsButton';

const TeacherExamList = () => {
  const [exams, setExams] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/exams?page=${page}&limit=10&search=${search}`)
      .then((res) => {
        setExams(res.data.data || []);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Exams</h1>
        <Link to="/teacher/create-exam" className="btn-primary">+ Create</Link>
      </div>
      <input type="search" placeholder="Search..." className="input-field max-w-md mb-6" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      {loading ? <Loading /> : (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <div key={exam._id} className="card flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{exam.title}</h3>
                <p className="text-sm text-gray-500">{exam.subject} · {exam.duration}min · {exam.status}</p>
              </div>
              <ShowResultsButton examId={exam._id} resultCount={exam.resultCount} hasResults={exam.hasResults} />
            </div>
          ))}
        </div>
      )}
      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default TeacherExamList;
