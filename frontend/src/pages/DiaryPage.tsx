import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Colors } from '../App';
import type { DiaryEntry } from '../types';
import { createDiary, getDiary } from '../api/diary';
import DiaryCard from '../components/DiaryCard';
import EmptyMessage from '../components/EmptyMessage';
import ErrorBanner from '../components/ErrorBanner';

interface DiaryPageProps {
  colors: Colors;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong';
}

export default function DiaryPage({ colors }: DiaryPageProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newDiaryText, setNewDiaryText] = useState<string>('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEntries(await getDiary());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAddDiary = async (e: FormEvent) => {
    e.preventDefault();
    const text = newDiaryText.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const entry = await createDiary(text);
      setEntries([entry, ...entries]);
      setNewDiaryText('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      <form onSubmit={handleAddDiary} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
        <textarea
          value={newDiaryText}
          onChange={(e) => setNewDiaryText(e.target.value)}
          placeholder="How are you feeling today? Any new symptoms or thoughts?"
          style={{ padding: '16px', height: '120px', borderRadius: '12px', border: `1px solid ${colors.border}`, backgroundColor: '#fafafa', fontSize: '15px', resize: 'vertical', outlineColor: colors.sage }}
        />
        <button
          type="submit"
          disabled={submitting}
          style={{ padding: '14px', backgroundColor: colors.sage, color: 'white', border: 'none', borderRadius: '10px', cursor: submitting ? 'default' : 'pointer', fontSize: '16px', fontWeight: '500', opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? 'Saving…' : 'Save to Diary'}
        </button>
      </form>

      {error && (
        <div style={{ marginBottom: '20px' }}>
          <ErrorBanner message={error} onRetry={() => void load()} colors={colors} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading && <p style={{ textAlign: 'center', color: colors.textLight, fontSize: '14px' }}>Loading…</p>}
        {!loading && !error && entries.map((entry) => (
          <DiaryCard key={entry.id} entry={entry} colors={colors} />
        ))}
        {!loading && !error && entries.length === 0 && <EmptyMessage text="No entries yet. Start writing above!" colors={colors} />}
      </div>
    </div>
  );
}
