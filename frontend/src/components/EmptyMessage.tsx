import type { Colors } from '../App';

interface EmptyMessageProps {
  text: string;
  colors: Colors;
}

export default function EmptyMessage({ text, colors }: EmptyMessageProps) {
  return <p style={{ textAlign: 'center', color: colors.textLight }}>{text}</p>;
}
