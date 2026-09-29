import type { Colors } from '../App';
import type { DiaryEntry } from '../types';
import { theme } from '../styles/theme';

interface DiaryCardProps {
  entry: DiaryEntry;
  colors: Colors;
  deleting?: boolean;
  disabled?: boolean;
  onDelete: () => void;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

export default function DiaryCard({ entry, colors, deleting = false, disabled = false, onDelete }: DiaryCardProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '20px', backgroundColor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '14px', boxShadow: theme.shadowCard }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', color: colors.sageDark, fontWeight: '600', marginBottom: '8px' }}>
          {dateFormatter.format(new Date(entry.created_at))}
        </div>
        <p style={{ margin: '0', lineHeight: '1.6', color: colors.textMain }}>{entry.text}</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onDelete}
        aria-label="Delete entry"
        title="Delete entry"
        style={{ flexShrink: 0, marginTop: '2px', padding: '6px 10px', backgroundColor: theme.danger, color: 'white', border: 'none', borderRadius: '8px', cursor: disabled ? 'default' : 'pointer', fontSize: '13px', fontWeight: '500', opacity: disabled ? 0.5 : 1 }}
      >
        {deleting ? '…' : 'Delete'}
      </button>
    </div>
  );
}
