import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useProcessingState } from '../../hooks/useProcessingState';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useToast } from '../../contexts/ToastContext';
import CopyButton from '../CopyButton';
import EmptyState from '../EmptyState';
import ErrorMessage from '../ErrorMessage';

export default memo(function Base64Tool() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const debouncedInput = useDebounce(input, 200);
  const { isProcessing } = useProcessingState(input, debouncedInput);
  const { copy } = useCopyToClipboard();
  const { addToast } = useToast();

  useEffect(() => {
    if (!debouncedInput) {
      setOutput('');
      setError('');
      return;
    }
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(debouncedInput))));
      } else {
        setOutput(decodeURIComponent(escape(atob(debouncedInput))));
      }
      setError('');
    } catch {
      setError(mode === 'encode' ? 'Failed to encode input. Please check for unsupported characters.' : 'Invalid Base64 string. Make sure the input is properly encoded.');
      setOutput('');
    }
  }, [debouncedInput, mode]);

  const swap = useCallback(() => {
    if (!output) return;
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setInput(output);
  }, [output, mode]);

  const shortcuts = useMemo(() => [
    { key: 'Enter', ctrl: true, handler: swap },
    { key: 'c', ctrl: true, shift: true, handler: () => { if (output) { copy(output); addToast('Copied to clipboard!', 'success'); } } },
  ], [swap, output, copy, addToast]);
  useKeyboardShortcut(shortcuts);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode('encode')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'encode'
              ? 'bg-primary-600 text-white'
              : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300'
          }`}
        >
          Encode
        </button>
        <button
          onClick={() => setMode('decode')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'decode'
              ? 'bg-primary-600 text-white'
              : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300'
          }`}
        >
          Decode
        </button>
        <button
          onClick={swap}
          disabled={!output}
          className="ml-auto p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors disabled:opacity-40"
          title="Swap input/output (Ctrl+Enter)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
          {mode === 'encode' ? 'Text Input' : 'Base64 Input'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'}
          className="w-full h-32 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none placeholder:text-surface-400 dark:placeholder:text-surface-500"
        />
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">
              {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
            </label>
            {isProcessing && (
              <span className="flex items-center gap-1.5 text-xs text-surface-400">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                Processing...
              </span>
            )}
          </div>
          {output && <CopyButton text={output} />}
        </div>
        {!input && !output ? (
          <EmptyState
            title="Enter text to encode or Base64 string to decode"
            examples={['"Hello World" → "SGVsbG8gV29ybGQ="']}
          />
        ) : (
          <textarea
            value={output}
            readOnly
            className="w-full h-32 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2 text-sm font-mono resize-none text-surface-700 dark:text-surface-300"
            placeholder="Output will appear here..."
          />
        )}
      </div>
    </div>
  );
});
