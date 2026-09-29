import type { Colors } from '../App';
import type { DiaryEntry } from '../pages/DiaryPage';

interface DiaryCardProps {
  entry: DiaryEntry;
  colors: Colors;
}

export default function DiaryCard({ entry, colors }: DiaryCardProps) {
  return (
    <div style={{ padding: '20px', backgroundColor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
      <div style={{ fontSize: '13px', color: colors.sageDark, fontWeight: '600', marginBottom: '8px' }}>
        {entry.date}
      </div>
      <p style={{ margin: '0', lineHeight: '1.6', color: colors.textMain }}>{entry.text}</p>
    </div>
  );
}
