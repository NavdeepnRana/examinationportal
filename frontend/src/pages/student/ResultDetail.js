import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';

const ResultDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/results/${id}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (!data) return <p>Result not found.</p>;

  const { result, questions, feedback } = data;

  return (
    <div>
      <Link to="/student/results" className="text-primary-600 text-sm hover:underline mb-4 inline-block">← Back to results</Link>
      <h1 className="text-2xl font-bold mb-2">{result.exam?.title || 'Exam Result'}</h1>
      <p className="text-lg text-primary-600 font-semibold mb-6">Score: {result.totalScore}/{result.maxScore}</p>

      <div className="space-y-4">
        {questions.map((q) => {
          const ans = result.answers?.find((a) => a.question === q._id || a.question?._id === q._id);
          const fb = feedback?.find((f) => f.question?._id === q._id || f.question === q._id);
          return (
            <div key={q._id} className="card">
              <p className="font-medium mb-2">{q.questionText}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Your answer: {ans?.answer || '—'}
              </p>
              <p className="text-sm font-medium text-primary-600">Marks: {ans?.marksAwarded ?? 0}/{q.maxMarks}</p>
              {fb && q.type === 'theory' && (
                <div className="mt-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-sm">
                  <p className="font-medium text-primary-700 dark:text-primary-300 mb-1">AI Feedback</p>
                  <p>{fb.aiFeedback}</p>
                  {fb.suggestions?.length > 0 && (
                    <ul className="mt-2 list-disc list-inside text-gray-600 dark:text-gray-400">
                      {fb.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultDetail;
