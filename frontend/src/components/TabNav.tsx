import type { Colors } from '../App';
import { theme } from '../styles/theme';

export type Tab = 'diary' | 'questions';

interface TabNavProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
  colors: Colors;
}

export default function TabNav({ activeTab, onChange, colors }: TabNavProps) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', backgroundColor: colors.softGrey, padding: '6px', borderRadius: '14px' }}>
      <button
        onClick={() => onChange('diary')}
        style={{
          flex: 1, padding: '12px', fontSize: '15px', fontWeight: '500',
          backgroundColor: activeTab === 'diary' ? colors.bg : 'transparent',
          color: activeTab === 'diary' ? colors.sageDark : colors.textLight,
          boxShadow: activeTab === 'diary' ? theme.shadowActive : 'none',
          border: 'none', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease'
        }}
      >
        My Diary
      </button>
      <button
        onClick={() => onChange('questions')}
        style={{
          flex: 1, padding: '12px', fontSize: '15px', fontWeight: '500',
          backgroundColor: activeTab === 'questions' ? colors.bg : 'transparent',
          color: activeTab === 'questions' ? colors.sageDark : colors.textLight,
          boxShadow: activeTab === 'questions' ? theme.shadowActive : 'none',
          border: 'none', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease'
        }}
      >
        Questions for Doctor
      </button>
    </div>
  );
}
