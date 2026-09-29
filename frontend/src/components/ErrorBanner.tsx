import type { Colors } from '../App';

interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
  colors: Colors;
}

export default function ErrorBanner({ message, onRetry, colors }: ErrorBannerProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 16px', backgroundColor: '#fdf0f0', border: '1px solid #f0d3d3', borderRadius: '12px' }}>
      <span style={{ fontSize: '14px', color: '#a05c5c' }}>{message}</span>
      <button
        onClick={onRetry}
        style={{ flexShrink: 0, padding: '8px 14px', backgroundColor: colors.sageDark, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
      >
        Retry
      </button>
    </div>
  );
}
