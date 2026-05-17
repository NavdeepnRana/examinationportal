import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';

const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [resultId, setResultId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  const submitExam = useCallback(async (autoSubmitted = false) => {
    if (submittedRef.current || !resultId) return;
    submittedRef.current = true;
    setSubmitting(true);

    const payload = Object.entries(answers).map(([question, answer]) => ({ question, answer }));

    try {
      const res = await api.post(`/results/${resultId}/submit`, { answers: payload, autoSubmitted });
      toast.success(autoSubmitted ? 'Time up! Exam auto-submitted.' : 'Exam submitted successfully!');
      navigate('/student/results', { state: { result: res.data.result } });
    } catch (err) {
      submittedRef.current = false;
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }, [answers, resultId, navigate]);

  useEffect(() => {
    const init = async () => {
      try {
        const [examRes, startRes] = await Promise.all([
          api.get(`/exams/${examId}`),
          api.post(`/results/start/${examId}`),
        ]);
        setExam(examRes.data.exam);
        setQuestions(examRes.data.questions || []);
        setResultId(startRes.data.resultId);
        setTimeLeft(startRes.data.duration * 60);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Cannot start exam');
        navigate('/student/exams');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [examId, navigate]);

  useEffect(() => {
    if (timeLeft <= 0 || !resultId) return undefined;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          submitExam(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, resultId, submitExam]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && resultId) {
        api.patch(`/results/${resultId}/tab-switch`).catch(() => {});
        toast.error('Tab switch detected! This has been recorded.', { id: 'tab-switch' });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [resultId]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const setAnswer = (qId, value) => setAnswers((prev) => ({ ...prev, [qId]: value }));

  if (loading) return <Loading fullScreen text="Preparing exam..." />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="sticky top-16 z-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold">{exam?.title}</h1>
          <p className="text-sm text-gray-500">{exam?.subject}</p>
        </div>
        <div className={`text-2xl font-mono font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-primary-600'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q._id} className="card">
            <p className="font-medium mb-3">
              Q{idx + 1}. {q.questionText}
              <span className="text-sm text-gray-400 ml-2">({q.maxMarks} marks)</span>
            </p>
            {q.type === 'mcq' ? (
              <div className="space-y-2">
                {q.options?.map((opt, i) => (
                  <label key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <input
                      type="radio"
                      name={q._id}
                      checked={answers[q._id] === opt}
                      onChange={() => setAnswer(q._id, opt)}
                      className="text-primary-600"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                className="input-field min-h-[120px]"
                placeholder="Write your answer..."
                value={answers[q._id] || ''}
                onChange={(e) => setAnswer(q._id, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="sticky bottom-4 mt-6 flex justify-end">
        <button type="button" onClick={() => submitExam(false)} disabled={submitting} className="btn-primary px-8 py-3">
          {submitting ? 'Submitting...' : 'Submit Exam'}
        </button>
      </div>
    </div>
  );
};

export default TakeExam;
