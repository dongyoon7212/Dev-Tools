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
    <div className="space-y-4">
      {/* Guide */}
      <p className="text-xs text-surface-500 dark:text-surface-400">
        Enter text below to generate hashes in multiple algorithms simultaneously.
      </p>

      {/* Input */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">
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
          className="w-full h-28 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none placeholder:text-surface-400 dark:placeholder:text-surface-500"
        />
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      {/* Hash Results */}
      {hashes.length > 0 ? (
        <div className="space-y-3">
          {hashes.map(({ name, value }) => (
            <div
              key={name}
              className="bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                  {name}
                </span>
                <CopyButton text={value} />
              </div>
              <code className="text-sm font-mono text-surface-700 dark:text-surface-300 break-all block select-all">
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
