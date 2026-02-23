import { useState, useMemo, memo } from 'react';
import CopyButton from '../CopyButton';
import ErrorMessage from '../ErrorMessage';
import EmptyState from '../EmptyState';

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = str.length % 4;
  if (pad) str += '='.repeat(4 - pad);
  try {
    return JSON.parse(atob(str));
  } catch {
    return atob(str);
  }
}

function formatExpiry(ts) {
  if (!ts) return null;
  const date = new Date(ts * 1000);
  const now = Date.now();
  const diff = date.getTime() - now;
  const expired = diff < 0;
  return {
    date: date.toLocaleString(),
    expired,
    label: expired
      ? `Expired ${Math.round(Math.abs(diff) / 60000)}m ago`
      : `Expires in ${Math.round(diff / 60000)}m`,
  };
}

export default memo(function JwtTool() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const decoded = useMemo(() => {
    setError('');
    if (!input.trim()) return null;
    const parts = input.trim().split('.');
    if (parts.length !== 3) {
      setError('Invalid JWT: must have exactly 3 parts (header.payload.signature).');
      return null;
    }
    try {
      const header = base64UrlDecode(parts[0]);
      const payload = base64UrlDecode(parts[1]);
      return { header, payload, signature: parts[2] };
    } catch {
      setError('Failed to decode JWT. Make sure it is a valid token.');
      return null;
    }
  }, [input]);

  const expiry = decoded?.payload ? formatExpiry(decoded.payload.exp) : null;

  const Section = ({ title, data, extra }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-widest">{title}</h3>
        <CopyButton text={JSON.stringify(data, null, 2)} />
      </div>
      <pre className="bg-surface-50 dark:bg-surface-800/60 border-2 border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-sm font-mono text-surface-700 dark:text-surface-200 overflow-x-auto whitespace-pre-wrap break-all select-all">
        {JSON.stringify(data, null, 2)}
      </pre>
      {extra}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
          JWT Token
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your JWT token here... eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          className="w-full h-36 bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary-400 dark:focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 resize-none placeholder:text-surface-300 dark:placeholder:text-surface-600 text-surface-800 dark:text-surface-100"
          spellCheck={false}
        />
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      {decoded ? (
        <div className="space-y-5">
          {/* Header */}
          <Section title="Header" data={decoded.header} />

          {/* Payload */}
          <Section
            title="Payload"
            data={decoded.payload}
            extra={expiry && (
              <div className={`mt-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                expiry.expired
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                  : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
              }`}>
                {expiry.expired ? '⚠ ' : '✓ '}{expiry.label} · {expiry.date}
              </div>
            )}
          />

          {/* Signature */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-widest">Signature</h3>
            <div className="bg-surface-50 dark:bg-surface-800/60 border-2 border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <code className="text-sm font-mono text-surface-500 dark:text-surface-400 break-all">{decoded.signature}</code>
              <CopyButton text={decoded.signature} />
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-xs text-amber-700 dark:text-amber-300">
            ⚠ Signature is not verified here. Never trust JWT claims without server-side verification.
          </div>
        </div>
      ) : !error && (
        <EmptyState
          title="Paste a JWT token to decode it"
          examples={['header.payload.signature', 'Supports HS256, RS256, and any other algorithm']}
        />
      )}
    </div>
  );
});
