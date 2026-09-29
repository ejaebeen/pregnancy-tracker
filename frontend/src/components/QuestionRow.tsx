import type { Colors } from '../App';
import type { Question } from '../pages/QuestionsPage';

interface QuestionRowProps {
  question: Question;
  colors: Colors;
  onToggle: (id: string) => void;
}

export default function QuestionRow({ question, colors, onToggle }: QuestionRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', backgroundColor: question.isAnswered ? colors.softGrey : colors.bg, border: `1px solid ${colors.border}`, borderRadius: '12px', transition: 'all 0.2s' }}>
      <input
        type="checkbox"
        checked={question.isAnswered}
        onChange={() => onToggle(question.id)}
        style={{ marginTop: '4px', width: '18px', height: '18px', accentColor: colors.sage, cursor: 'pointer' }}
      />
      <span style={{ textDecoration: question.isAnswered ? 'line-through' : 'none', color: question.isAnswered ? colors.textLight : colors.textMain, lineHeight: '1.5' }}>
        {question.text}
      </span>
    </div>
  );
}
