import type { Colors } from '../App';
import type { DoctorQuestion } from '../types';

interface QuestionRowProps {
  question: DoctorQuestion;
  colors: Colors;
  disabled?: boolean;
  onToggle: () => void;
}

export default function QuestionRow({ question, colors, disabled = false, onToggle }: QuestionRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', backgroundColor: question.is_answered ? colors.softGrey : colors.bg, border: `1px solid ${colors.border}`, borderRadius: '12px', transition: 'all 0.2s' }}>
      <input
        type="checkbox"
        checked={question.is_answered}
        disabled={disabled}
        onChange={onToggle}
        style={{ marginTop: '4px', width: '18px', height: '18px', accentColor: colors.sage, cursor: disabled ? 'default' : 'pointer' }}
      />
      <span style={{ textDecoration: question.is_answered ? 'line-through' : 'none', color: question.is_answered ? colors.textLight : colors.textMain, lineHeight: '1.5' }}>
        {question.text}
      </span>
    </div>
  );
}
