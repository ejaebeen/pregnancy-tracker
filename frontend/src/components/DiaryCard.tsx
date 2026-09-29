import type { Colors } from '../App';
import type { DiaryEntry } from '../types';
import { theme } from '../styles/theme';

interface DiaryCardProps {
  entry: DiaryEntry;
  colors: Colors;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

export default function DiaryCard({ entry, colors }: DiaryCardProps) {
  return (
    <div style={{ padding: '20px', backgroundColor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '14px', boxShadow: theme.shadowCard }}>
      <div style={{ fontSize: '13px', color: colors.sageDark, fontWeight: '600', marginBottom: '8px' }}>
        {dateFormatter.format(new Date(entry.created_at))}
      </div>
      <p style={{ margin: '0', lineHeight: '1.6', color: colors.textMain }}>{entry.text}</p>
    </div>
  );
}
