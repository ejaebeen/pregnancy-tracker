import { useState } from 'react';
import TabNav from './components/TabNav';
import type { Tab } from './components/TabNav';
import DiaryPage from './pages/DiaryPage';
import QuestionsPage from './pages/QuestionsPage';
import { theme } from './styles/theme';

export type Colors = typeof theme;

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('diary');
  const colors = theme;

  return (
    <div style={{
      maxWidth: '600px',
      margin: '40px auto',
      padding: '30px',
      backgroundColor: colors.bg,
      borderRadius: '20px',
      boxShadow: theme.shadowApp
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
