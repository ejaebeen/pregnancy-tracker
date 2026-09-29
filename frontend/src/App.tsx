import { useState } from 'react';
import TabNav from './components/TabNav';
import type { Tab } from './components/TabNav';
import DiaryPage from './pages/DiaryPage';
import QuestionsPage from './pages/QuestionsPage';

export interface Colors {
  sage: string;
  sageDark: string;
  bg: string;
  softGrey: string;
  border: string;
  textMain: string;
  textLight: string;
}

const colors: Colors = {
  sage: '#9fb4a4',
  sageDark: '#7f9183',
  bg: '#ffffff',
  softGrey: '#f4f5f3',
  border: '#e8ece9',
  textMain: '#4a4a4a',
  textLight: '#95a5a6',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('diary');

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

      <TabNav activeTab={activeTab} onChange={setActiveTab} colors={colors} />

      {activeTab === 'diary' && <DiaryPage colors={colors} />}
      {activeTab === 'questions' && <QuestionsPage colors={colors} />}
    </div>
  );
}
