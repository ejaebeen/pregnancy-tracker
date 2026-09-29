import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Colors } from '../App';
import type { DoctorQuestion } from '../types';
import { createQuestion, deleteQuestion, getQuestions, toggleQuestion } from '../api/questions';
import QuestionRow from '../components/QuestionRow';
import EmptyMessage from '../components/EmptyMessage';
import ErrorBanner from '../components/ErrorBanner';

interface QuestionsPageProps {
  colors: Colors;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong';
}

export default function QuestionsPage({ colors }: QuestionsPageProps) {
  const [questions, setQuestions] = useState<DoctorQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newQuestionText, setNewQuestionText] = useState<string>('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setQuestions(await getQuestions());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAddQuestion = async (e: FormEvent) => {
    e.preventDefault();
    const text = newQuestionText.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const question = await createQuestion(text);
      setQuestions([question, ...questions]);
      setNewQuestionText('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleQuestionStatus = async (question: DoctorQuestion) => {
    if (togglingId) return;

    setTogglingId(question.id);
    setError(null);
    try {
      const updated = await toggleQuestion(question.id, !question.is_answered);
      setQuestions(questions.map((q) => (q.id === updated.id ? updated : q)));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteQuestion = async (question: DoctorQuestion) => {
    if (deletingId) return;

    setDeletingId(question.id);
    setError(null);
    try {
      await deleteQuestion(question.id);
      setQuestions(questions.filter((q) => q.id !== question.id));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDeletingId(null);
    }
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
        <button
          type="submit"
          disabled={submitting}
          style={{ padding: '0 20px', backgroundColor: colors.sage, color: 'white', border: 'none', borderRadius: '10px', cursor: submitting ? 'default' : 'pointer', fontWeight: '500', opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? 'Adding…' : 'Add'}
        </button>
      </form>

      {error && (
        <div style={{ marginBottom: '20px' }}>
          <ErrorBanner message={error} onRetry={() => void load()} colors={colors} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading && <p style={{ textAlign: 'center', color: colors.textLight, fontSize: '14px' }}>Loading…</p>}
        {!loading && !error && questions.map((q) => (
          <QuestionRow
            key={q.id}
            question={q}
            colors={colors}
            disabled={togglingId !== null || deletingId !== null}
            deleting={deletingId === q.id}
            onToggle={() => void toggleQuestionStatus(q)}
            onDelete={() => void handleDeleteQuestion(q)}
          />
        ))}
        {!loading && !error && questions.length === 0 && <EmptyMessage text="No questions logged. You're all set!" colors={colors} />}
      </div>
    </div>
  );
}
