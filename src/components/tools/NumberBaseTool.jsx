import { useState, useMemo, memo } from 'react';
import CopyButton from '../CopyButton';
import EmptyState from '../EmptyState';
import ErrorMessage from '../ErrorMessage';

const BASES = [
  { label: 'Binary', base: 2, prefix: '0b', placeholder: '1010 1111' },
  { label: 'Octal', base: 8, prefix: '0o', placeholder: '257' },
  { label: 'Decimal', base: 10, prefix: '', placeholder: '175' },
  { label: 'Hex', base: 16, prefix: '0x', placeholder: 'AF or af' },
];

function parseAny(str) {
  const clean = str.trim().replace(/\s/g, '');
  if (!clean) return null;
  if (/^0b[01]+$/i.test(clean)) return parseInt(clean.slice(2), 2);
  if (/^0o[0-7]+$/i.test(clean)) return parseInt(clean.slice(2), 8);
  if (/^0x[0-9a-f]+$/i.test(clean)) return parseInt(clean.slice(2), 16);
  if (/^[0-9]+$/.test(clean)) return parseInt(clean, 10);
  if (/^[0-9a-f]+$/i.test(clean)) return parseInt(clean, 16);
  if (/^[01\s]+$/.test(str) && str.includes(' ')) return parseInt(clean, 2);
  return null;
}

function toBase(n, base) {
  if (base === 2) return n.toString(2).replace(/(.{4})/g, '$1 ').trim();
  if (base === 16) return n.toString(16).toUpperCase();
  return n.toString(base);
}

export default memo(function NumberBaseTool() {
  const [input, setInput] = useState('');
  const [sourceBase, setSourceBase] = useState(10);
  const [error, setError] = useState('');

  const decimal = useMemo(() => {
    setError('');
    if (!input.trim()) return null;
    const clean = input.trim().replace(/\s/g, '');
    if (!clean) return null;
    try {
      const n = sourceBase === 0 ? parseAny(input) : parseInt(clean, sourceBase);
      if (n === null || isNaN(n)) {
        setError(`"${input}" is not a valid base-${sourceBase} number.`);
        return null;
      }
      return n;
    } catch {
      setError('Invalid input.');
      return null;
    }
  }, [input, sourceBase]);

  const results = useMemo(() => {
    if (decimal === null) return [];
    return BASES.map(({ label, base, prefix }) => ({
      label,
      base,
      prefix,
      value: toBase(decimal, base),
    }));
  }, [decimal]);

  return (
    <div className="space-y-6">
      {/* Input + source base */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
            Input
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a number..."
            className="w-full bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary-400 dark:focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 placeholder:text-surface-300 dark:placeholder:text-surface-600 text-surface-800 dark:text-surface-100"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
            From Base
          </label>
          <div className="flex items-center gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl h-[50px]">
            {[{ l: 'Auto', v: 0 }, { l: 'BIN', v: 2 }, { l: 'OCT', v: 8 }, { l: 'DEC', v: 10 }, { l: 'HEX', v: 16 }].map(({ l, v }) => (
              <button
                key={v}
                onClick={() => setSourceBase(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  sourceBase === v
                    ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      {/* Results */}
      {results.length > 0 ? (
        <div className="space-y-3 card-pop">
          <div className="text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest mb-1">
            Decimal value: {decimal?.toLocaleString()}
          </div>
          {results.map(({ label, base, prefix, value }) => (
            <div
              key={base}
              className="bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-4 flex items-center gap-4 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200"
            >
              <div className="w-16 shrink-0">
                <div className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase">{label}</div>
                <div className="text-[10px] text-surface-400">Base {base}</div>
              </div>
              <code className="flex-1 text-sm font-mono text-surface-700 dark:text-surface-200 break-all select-all">
                {prefix}<span className="text-primary-600 dark:text-primary-400">{value}</span>
              </code>
              <CopyButton text={prefix + value} />
            </div>
          ))}
        </div>
      ) : !error && (
        <EmptyState
          title="Enter a number to convert between bases"
          examples={['175 (decimal) = 0b10101111 = 0xAF', 'Supports auto-detect for 0x, 0b, 0o prefixes']}
        />
      )}
    </div>
  );
});
