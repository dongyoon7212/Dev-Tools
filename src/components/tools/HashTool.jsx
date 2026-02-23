import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import CryptoJS from 'crypto-js';
import { useDebounce } from '../../hooks/useDebounce';
import { useProcessingState } from '../../hooks/useProcessingState';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useToast } from '../../contexts/ToastContext';
import CopyButton from '../CopyButton';
import EmptyState from '../EmptyState';
import ErrorMessage from '../ErrorMessage';

const ALGORITHMS = [
  { name: 'MD5', fn: (text) => CryptoJS.MD5(text).toString() },
  { name: 'SHA-1', fn: (text) => CryptoJS.SHA1(text).toString() },
  { name: 'SHA-256', fn: (text) => CryptoJS.SHA256(text).toString() },
  { name: 'SHA-512', fn: (text) => CryptoJS.SHA512(text).toString() },
];

export default memo(function HashTool() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState([]);
  const [error, setError] = useState('');
  const debouncedInput = useDebounce(input, 200);
  const { isProcessing } = useProcessingState(input, debouncedInput);
  const { copy } = useCopyToClipboard();
  const { addToast } = useToast();

  useEffect(() => {
    if (!debouncedInput) {
      setHashes([]);
      setError('');
      return;
    }
    try {
      const results = ALGORITHMS.map(({ name, fn }) => ({
        name,
        value: fn(debouncedInput),
      }));
      setHashes(results);
      setError('');
    } catch (e) {
      setError('Failed to generate hashes: ' + e.message);
      setHashes([]);
    }
  }, [debouncedInput]);

  const copyAll = useCallback(() => {
    if (hashes.length > 0) {
      const text = hashes.map((h) => `${h.name}: ${h.value}`).join('\n');
      copy(text);
      addToast('Copied all hashes!', 'success');
    }
  }, [hashes, copy, addToast]);

  const shortcuts = useMemo(() => [
    { key: 'c', ctrl: true, shift: true, handler: copyAll },
  ], [copyAll]);
  useKeyboardShortcut(shortcuts);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
            Input Text
          </label>
          {isProcessing && (
            <span className="flex items-center gap-1.5 text-xs text-surface-400">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
              Processing...
            </span>
          )}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash..."
          className="w-full h-40 bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary-400 dark:focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 resize-none placeholder:text-surface-300 dark:placeholder:text-surface-600 text-surface-800 dark:text-surface-100"
        />
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      {/* Hash Results */}
      {hashes.length > 0 ? (
        <div className="space-y-3 card-pop">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">Results</span>
            <button
              onClick={copyAll}
              className="text-xs px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all duration-200"
            >
              Copy All
            </button>
          </div>
          {hashes.map(({ name, value }) => (
            <div
              key={name}
              className="bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 rounded-xl p-4 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                  {name}
                </span>
                <CopyButton text={value} />
              </div>
              <code className="text-sm font-mono text-surface-700 dark:text-surface-200 break-all block select-all leading-relaxed">
                {value}
              </code>
            </div>
          ))}
        </div>
      ) : !error && (
        <EmptyState
          title="Enter text to generate hashes"
          examples={['Supports MD5, SHA-1, SHA-256, SHA-512']}
        />
      )}
    </div>
  );
});
