import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Colors } from '../App';
import DiaryCard from '../components/DiaryCard';
import EmptyMessage from '../components/EmptyMessage';

export interface DiaryEntry {
  id: string;
  date: string;
  text: string;
}

interface DiaryPageProps {
  colors: Colors;
}

export default function DiaryPage({ colors }: DiaryPageProps) {
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => {
    const saved = localStorage.getItem('pregnancy_diary');
    return saved ? JSON.parse(saved) : [];
  });

  const [newDiaryText, setNewDiaryText] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('pregnancy_diary', JSON.stringify(diaryEntries));
  }, [diaryEntries]);

  const handleAddDiary = (e: FormEvent) => {
    e.preventDefault();
    if (!newDiaryText.trim()) return;

    const newEntry: DiaryEntry = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      text: newDiaryText
    };

    setDiaryEntries([newEntry, ...diaryEntries]);
    setNewDiaryText('');
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
        <button type="submit" style={{ padding: '14px', backgroundColor: colors.sage, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: '500' }}>
          Save to Diary
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {diaryEntries.map((entry) => (
          <DiaryCard key={entry.id} entry={entry} colors={colors} />
        ))}
        {diaryEntries.length === 0 && <EmptyMessage text="No entries yet. Start writing above!" colors={colors} />}
      </div>
    </div>
  );
}
