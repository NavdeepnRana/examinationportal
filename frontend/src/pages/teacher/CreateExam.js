import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const emptyQuestion = () => ({
  type: 'mcq', questionText: '', options: ['', '', '', ''], correctAnswer: '', modelAnswer: '', maxMarks: 1,
});

const QuestionEditor = ({ questions, setQuestions }) => {
  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIdx, oIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };

  const addQuestion = () => setQuestions([...questions, emptyQuestion()]);
  const removeQuestion = (idx) => setQuestions(questions.filter((_, i) => i !== idx));

  return (
    <>
      {questions.map((q, idx) => (
        <div key={idx} className="card space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Question {idx + 1}</h3>
            {questions.length > 1 && (
              <button type="button" onClick={() => removeQuestion(idx)} className="text-red-500 text-sm">Remove</button>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select className="input-field" value={q.type} onChange={(e) => updateQuestion(idx, 'type', e.target.value)}>
                <option value="mcq">MCQ</option>
                <option value="theory">Theory</option>
              </select>
            </div>
            <div>
              <label className="label">Max Marks</label>
              <input type="number" min={1} className="input-field" value={q.maxMarks} onChange={(e) => updateQuestion(idx, 'maxMarks', Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="label">Question Text</label>
            <textarea className="input-field" value={q.questionText} onChange={(e) => updateQuestion(idx, 'questionText', e.target.value)} required rows={2} />
          </div>
          {q.type === 'mcq' ? (
            <>
              {q.options.map((opt, oi) => (
                <div key={oi}>
                  <label className="label">Option {oi + 1}</label>
                  <input className="input-field" value={opt} onChange={(e) => updateOption(idx, oi, e.target.value)} />
                </div>
              ))}
              <div>
                <label className="label">Correct Answer</label>
                <input className="input-field" value={q.correctAnswer} onChange={(e) => updateQuestion(idx, 'correctAnswer', e.target.value)} required />
              </div>
            </>
          ) : (
            <div>
              <label className="label">Model Answer (for AI evaluation)</label>
              <textarea className="input-field" value={q.modelAnswer} onChange={(e) => updateQuestion(idx, 'modelAnswer', e.target.value)} rows={3} />
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={addQuestion} className="btn-secondary w-full">+ Add Question</button>
    </>
  );
};

const CreateExam = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('manual');
  const [form, setForm] = useState({
    title: '', description: '', subject: '', duration: 60,
    startTime: '', endTime: '', status: 'published',
  });
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiConfig, setAiConfig] = useState({
    topic: '', numMcq: 3, numTheory: 2, difficulty: 'medium',
  });
  const [aiGenerated, setAiGenerated] = useState(false);

  const updateForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGenerate = async () => {
    if (!aiConfig.topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    setGenerating(true);
    try {
      const res = await api.post('/exams/generate-questions', {
        topic: aiConfig.topic,
        subject: form.subject || aiConfig.topic,
        numMcq: aiConfig.numMcq,
        numTheory: aiConfig.numTheory,
        difficulty: aiConfig.difficulty,
      });
      setQuestions(res.data.questions);
      setAiGenerated(true);
      if (!form.title) setForm((f) => ({ ...f, title: `Exam: ${aiConfig.topic}`, subject: f.subject || aiConfig.topic }));
      toast.success('Questions generated! Review and edit below.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/exams', { ...form, questions });
      toast.success('Exam created!');
      navigate('/teacher/exams');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Create Exam</h1>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`px-4 py-2 rounded-lg font-medium transition ${mode === 'manual' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
        >
          Manual
        </button>
        <button
          type="button"
          onClick={() => setMode('ai')}
          className={`px-4 py-2 rounded-lg font-medium transition ${mode === 'ai' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
        >
          AI Generate
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Title</label>
              <input name="title" className="input-field" value={form.title} onChange={updateForm} required />
            </div>
            <div>
              <label className="label">Subject</label>
              <input name="subject" className="input-field" value={form.subject} onChange={updateForm} required />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea name="description" className="input-field" value={form.description} onChange={updateForm} rows={2} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Duration (minutes)</label>
              <input name="duration" type="number" min={1} className="input-field" value={form.duration} onChange={updateForm} required />
            </div>
            <div>
              <label className="label">Start Time</label>
              <input name="startTime" type="datetime-local" className="input-field" value={form.startTime} onChange={updateForm} required />
            </div>
            <div>
              <label className="label">End Time</label>
              <input name="endTime" type="datetime-local" className="input-field" value={form.endTime} onChange={updateForm} required />
            </div>
          </div>
        </div>

        {mode === 'ai' && (
          <div className="card space-y-4 border-2 border-primary-100 dark:border-primary-900">
            <h2 className="font-semibold text-primary-600">AI Question Generator</h2>
            <p className="text-sm text-gray-500">Enter a topic and AI will create questions. You can edit them before publishing.</p>
            <div>
              <label className="label">Topic *</label>
              <input
                className="input-field"
                placeholder="e.g. Photosynthesis, World War II, Data Structures"
                value={aiConfig.topic}
                onChange={(e) => setAiConfig({ ...aiConfig, topic: e.target.value })}
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="label">MCQ Count</label>
                <input type="number" min={1} max={10} className="input-field" value={aiConfig.numMcq} onChange={(e) => setAiConfig({ ...aiConfig, numMcq: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Theory Count</label>
                <input type="number" min={1} max={10} className="input-field" value={aiConfig.numTheory} onChange={(e) => setAiConfig({ ...aiConfig, numTheory: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Difficulty</label>
                <select className="input-field" value={aiConfig.difficulty} onChange={(e) => setAiConfig({ ...aiConfig, difficulty: e.target.value })}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            <button type="button" onClick={handleGenerate} disabled={generating} className="btn-primary w-full">
              {generating ? 'Generating with AI...' : 'Generate Questions'}
            </button>
          </div>
        )}

        {(mode === 'manual' || aiGenerated) && (
          <>
            {mode === 'ai' && aiGenerated && (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">✓ Questions generated — edit any question below before publishing</p>
            )}
            <QuestionEditor questions={questions} setQuestions={setQuestions} />
          </>
        )}

        <button type="submit" disabled={loading || (mode === 'ai' && !aiGenerated && questions.every((q) => !q.questionText))} className="btn-primary w-full py-3">
          {loading ? 'Creating...' : 'Publish Exam'}
        </button>
      </form>
    </div>
  );
};

export default CreateExam;
