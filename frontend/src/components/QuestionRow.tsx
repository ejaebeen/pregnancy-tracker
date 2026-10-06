import type { Colors } from '../App';
import type { DoctorQuestion } from '../types';

interface QuestionRowProps {
  question: DoctorQuestion;
  colors: Colors;
  disabled?: boolean;
  deleting?: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

export default function QuestionRow({ question, colors, disabled = false, deleting = false, onToggle, onDelete }: QuestionRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', backgroundColor: question.is_answered ? colors.softGrey : colors.bg, border: `1px solid ${colors.border}`, borderRadius: '12px', transition: 'all 0.2s' }}>
      <input
        type="checkbox"
        checked={question.is_answered}
        disabled={disabled}
        onChange={onToggle}
        style={{ marginTop: '4px', width: '18px', height: '18px', accentColor: colors.sage, cursor: disabled ? 'default' : 'pointer' }}
      />
      <span style={{ flex: 1, minWidth: 0, textDecoration: question.is_answered ? 'line-through' : 'none', color: question.is_answered ? colors.textLight : colors.textMain, lineHeight: '1.5' }}>
        {question.text}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={onDelete}
        aria-label="Delete question"
        style={{ flexShrink: 0, marginTop: '2px', padding: '4px 8px', backgroundColor: 'transparent', border: 'none', cursor: disabled ? 'default' : 'pointer', fontSize: '13px', color: question.is_answered ? colors.textLight : colors.textMain, textDecoration: question.is_answered ? 'line-through' : 'none' }}
      >
        {deleting ? '…' : 'Delete'}
      </button>
    </div>
  );
}
