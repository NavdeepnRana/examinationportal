import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';

const ReviewFeedback = () => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(() => {
    setLoading(true);
    api.get(`/admin/feedback/pending?page=${page}&limit=10`)
      .then((res) => {
        setItems(res.data.data || []);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const approve = async (id, approved) => {
    try {
      await api.patch(`/admin/feedback/${id}/review`, { adminApproved: approved, adminNotes: approved ? 'Approved by admin' : 'Needs revision' });
      toast.success(approved ? 'Approved' : 'Rejected');
      fetchItems();
    } catch {
      toast.error('Failed');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Review AI Feedback</h1>
      {items.length === 0 ? (
        <p className="text-gray-500">No pending feedback to review.</p>
      ) : (
        <div className="space-y-4">
          {items.map((fb) => (
            <div key={fb._id} className="card">
              <p className="text-sm text-gray-500">{fb.result?.student?.name} · {fb.result?.exam?.title}</p>
              <p className="font-medium mt-1">{fb.question?.questionText}</p>
              <p className="text-sm mt-2">Answer: {fb.studentAnswer}</p>
              <p className="text-sm mt-2 text-primary-600">AI: {fb.aiScore} marks — {fb.aiFeedback}</p>
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => approve(fb._id, true)} className="btn-primary text-sm">Approve</button>
                <button type="button" onClick={() => approve(fb._id, false)} className="btn-secondary text-sm">Flag</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default ReviewFeedback;
