import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Colors } from '../App';
import QuestionRow from '../components/QuestionRow';
import EmptyMessage from '../components/EmptyMessage';

export interface Question {
  id: string;
  text: string;
  isAnswered: boolean;
}

interface QuestionsPageProps {
  colors: Colors;
}

export default function QuestionsPage({ colors }: QuestionsPageProps) {
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('pregnancy_questions');
    return saved ? JSON.parse(saved) : [];
  });

  const [newQuestionText, setNewQuestionText] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('pregnancy_questions', JSON.stringify(questions));
  }, [questions]);

  const handleAddQuestion = (e: FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const newQ: Question = {
      id: crypto.randomUUID(),
      text: newQuestionText,
      isAnswered: false
    };

    setQuestions([newQ, ...questions]);
    setNewQuestionText('');
  };

  const toggleQuestionStatus = (id: string) => {
    setQuestions(questions.map((q) =>
      q.id === id ? { ...q, isAnswered: !q.isAnswered } : q
    ));
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      <form onSubmit={handleAddQuestion} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input
          type="text"
          value={newQuestionText}
          onChange={(e) => setNewQuestionText(e.target.value)}
          placeholder="E.g. Is it safe to eat..."
          style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `1px solid ${colors.border}`, fontSize: '15px', outlineColor: colors.sage }}
        />
        <button type="submit" style={{ padding: '0 20px', backgroundColor: colors.sage, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '500' }}>
          Add
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {questions.map((q) => (
          <QuestionRow key={q.id} question={q} colors={colors} onToggle={toggleQuestionStatus} />
        ))}
        {questions.length === 0 && <EmptyMessage text="No questions logged. You're all set!" colors={colors} />}
      </div>
    </div>
  );
}
