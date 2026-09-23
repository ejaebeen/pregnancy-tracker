import React, { useState, useEffect } from 'react';

interface DiaryEntry {
  id: string;
  date: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  isAnswered: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'diary' | 'questions'>('diary');
  
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => {
    const saved = localStorage.getItem('pregnancy_diary');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('pregnancy_questions');
    return saved ? JSON.parse(saved) : [];
  });

  const [newDiaryText, setNewDiaryText] = useState<string>('');
  const [newQuestionText, setNewQuestionText] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('pregnancy_diary', JSON.stringify(diaryEntries));
  }, [diaryEntries]);

  useEffect(() => {
    localStorage.setItem('pregnancy_questions', JSON.stringify(questions));
  }, [questions]);

  const handleAddDiary = (e: React.FormEvent) => {
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

  const handleAddQuestion = (e: React.FormEvent) => {
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
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, isAnswered: !q.isAnswered } : q
    ));
  };

  // Aesthetic color palette
  const colors = {
    sage: '#9fb4a4',
    sageDark: '#7f9183',
    bg: '#ffffff',
    softGrey: '#f4f5f3',
    border: '#e8ece9',
    textMain: '#4a4a4a',
    textLight: '#95a5a6'
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '40px auto', 
      padding: '30px', 
      backgroundColor: colors.bg,
      borderRadius: '20px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
    }}>
      <h1 style={{ color: colors.sageDark, textAlign: 'center', fontWeight: '600', marginBottom: '30px', fontSize: '28px' }}>
        Pregnancy Tracker
      </h1>
      
      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', backgroundColor: colors.softGrey, padding: '6px', borderRadius: '14px' }}>
        <button 
          onClick={() => setActiveTab('diary')}
          style={{ 
            flex: 1, padding: '12px', fontSize: '15px', fontWeight: '500',
            backgroundColor: activeTab === 'diary' ? colors.bg : 'transparent', 
            color: activeTab === 'diary' ? colors.sageDark : colors.textLight, 
            boxShadow: activeTab === 'diary' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
            border: 'none', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease'
          }}
        >
          My Diary
        </button>
        <button 
          onClick={() => setActiveTab('questions')}
          style={{ 
            flex: 1, padding: '12px', fontSize: '15px', fontWeight: '500',
            backgroundColor: activeTab === 'questions' ? colors.bg : 'transparent', 
            color: activeTab === 'questions' ? colors.sageDark : colors.textLight, 
            boxShadow: activeTab === 'questions' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
            border: 'none', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease'
          }}
        >
          Questions for Doctor
        </button>
      </div>

      {/* Diary Section */}
      {activeTab === 'diary' && (
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
            {diaryEntries.map(entry => (
              <div key={entry.id} style={{ padding: '20px', backgroundColor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '13px', color: colors.sageDark, fontWeight: '600', marginBottom: '8px' }}>
                  {entry.date}
                </div>
                <p style={{ margin: '0', lineHeight: '1.6', color: colors.textMain }}>{entry.text}</p>
              </div>
            ))}
            {diaryEntries.length === 0 && <p style={{ textAlign: 'center', color: colors.textLight }}>No entries yet. Start writing above!</p>}
          </div>
        </div>
      )}

      {/* Questions Section */}
      {activeTab === 'questions' && (
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
            {questions.map(q => (
              <div key={q.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', backgroundColor: q.isAnswered ? colors.softGrey : colors.bg, border: `1px solid ${colors.border}`, borderRadius: '12px', transition: 'all 0.2s' }}>
                <input 
                  type="checkbox" 
                  checked={q.isAnswered}
                  onChange={() => toggleQuestionStatus(q.id)}
                  style={{ marginTop: '4px', width: '18px', height: '18px', accentColor: colors.sage, cursor: 'pointer' }}
                />
                <span style={{ textDecoration: q.isAnswered ? 'line-through' : 'none', color: q.isAnswered ? colors.textLight : colors.textMain, lineHeight: '1.5' }}>
                  {q.text}
                </span>
              </div>
            ))}
            {questions.length === 0 && <p style={{ textAlign: 'center', color: colors.textLight }}>No questions logged. You're all set!</p>}
          </div>
        </div>
      )}
    </div>
  );
}