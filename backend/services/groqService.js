const axios = require('axios');

const evaluateTheoryAnswer = async ({ question, modelAnswer, studentAnswer, maxMarks }) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured');

  const prompt = `You are an expert exam evaluator. Evaluate the student's theory answer.

Question: ${question}
${modelAnswer ? `Model/Reference Answer: ${modelAnswer}` : ''}
Student Answer: ${studentAnswer}
Maximum Marks: ${maxMarks}

Respond ONLY with valid JSON in this exact format (no markdown):
{
  "score": <number between 0 and ${maxMarks}>,
  "feedback": "<detailed feedback on the answer>",
  "suggestions": ["<suggestion 1>", "<suggestion 2>"]
}

Be fair, constructive, and grade based on accuracy, completeness, and clarity.`;

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a strict but fair academic evaluator. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  const content = response.data.choices[0]?.message?.content || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI returned invalid response format');

  const parsed = JSON.parse(jsonMatch[0]);
  const score = Math.min(maxMarks, Math.max(0, Number(parsed.score) || 0));

  return {
    score,
    feedback: parsed.feedback || 'No feedback provided.',
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
  };
};

const generateExamQuestions = async ({ topic, subject, numMcq = 3, numTheory = 2, difficulty = 'medium' }) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured');

  const prompt = `You are an expert teacher creating an exam.

Topic: ${topic}
${subject ? `Subject: ${subject}` : ''}
Difficulty: ${difficulty}
Create exactly ${numMcq} MCQ questions and ${numTheory} theory questions.

Respond ONLY with a valid JSON array (no markdown):
[
  {
    "type": "mcq",
    "questionText": "question text",
    "options": ["option A", "option B", "option C", "option D"],
    "correctAnswer": "exact text of the correct option from options array",
    "maxMarks": 2
  },
  {
    "type": "theory",
    "questionText": "question text",
    "modelAnswer": "detailed model answer for AI grading",
    "maxMarks": 5
  }
]

Make questions clear, accurate, and appropriate for the difficulty level.`;

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You create academic exam questions. Always respond with valid JSON array only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 4096,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );

  const content = response.data.choices[0]?.message?.content || '';
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('AI returned invalid question format');

  const parsed = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('AI returned no questions');
  }

  return parsed.map((q) => ({
    type: q.type === 'theory' ? 'theory' : 'mcq',
    questionText: q.questionText || '',
    options: q.type === 'mcq' ? (q.options || ['', '', '', '']) : [],
    correctAnswer: q.correctAnswer || '',
    modelAnswer: q.modelAnswer || '',
    maxMarks: Math.max(1, Number(q.maxMarks) || 1),
  }));
};

module.exports = { evaluateTheoryAnswer, generateExamQuestions };
