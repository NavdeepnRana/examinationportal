import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';

const ReviewResult = () => {
  const { resultId } = useParams();
  const [data, setData] = useState(null);
  const [edits, setEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    api.get(`/results/${resultId}`)
      .then((res) => {
        setData(res.data);
        const initial = {};
        (res.data.feedback || []).forEach((fb) => {
          initial[fb._id] = { teacherScore: fb.teacherScore ?? fb.aiScore, teacherFeedback: fb.teacherFeedback || fb.aiFeedback };
        });
        setEdits(initial);
      })
      .finally(() => setLoading(false));
  }, [resultId]);

  const saveFeedback = async (feedbackId) => {
    setSaving(feedbackId);
    try {
      await api.put(`/results/feedback/${feedbackId}`, edits[feedbackId]);
      toast.success('Feedback updated');
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <Loading />;
  if (!data) return <p>Not found</p>;

  const { result, feedback } = data;

  return (
    <div>
      <Link to={`/teacher/submissions/${result.exam?._id || result.exam}`} className="text-primary-600 text-sm hover:underline mb-4 inline-block">← Back</Link>
      <h1 className="text-2xl font-bold mb-2">Review: {result.student?.name}</h1>
      <p className="text-primary-600 font-semibold mb-6">Total: {result.totalScore}/{result.maxScore}</p>

      <div className="space-y-4">
        {feedback?.map((fb) => (
          <div key={fb._id} className="card">
            <p className="font-medium mb-2">{fb.question?.questionText}</p>
            <p className="text-sm text-gray-500 mb-2">Student: {fb.studentAnswer}</p>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-3 text-sm">
              <p className="font-medium text-blue-700 dark:text-blue-300">AI Score: {fb.aiScore} · {fb.aiFeedback}</p>
              {fb.suggestions?.map((s, i) => <p key={i} className="text-gray-500">• {s}</p>)}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Teacher Score</label>
                <input
                  type="number"
                  className="input-field"
                  value={edits[fb._id]?.teacherScore ?? ''}
                  onChange={(e) => setEdits({ ...edits, [fb._id]: { ...edits[fb._id], teacherScore: Number(e.target.value) } })}
                />
              </div>
              <div>
                <label className="label">Teacher Feedback</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={edits[fb._id]?.teacherFeedback ?? ''}
                  onChange={(e) => setEdits({ ...edits, [fb._id]: { ...edits[fb._id], teacherFeedback: e.target.value } })}
                />
              </div>
            </div>
            <button type="button" onClick={() => saveFeedback(fb._id)} disabled={saving === fb._id} className="btn-primary mt-3 text-sm">
              {saving === fb._id ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewResult;
