import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useProcessingState } from '../../hooks/useProcessingState';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useToast } from '../../contexts/ToastContext';
import CopyButton from '../CopyButton';
import EmptyState from '../EmptyState';
import ErrorMessage from '../ErrorMessage';

export default memo(function UrlEncoderTool() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const debouncedInput = useDebounce(input, 200);
  const debouncedQuery = useDebounce(queryInput, 300);
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
      setOutput(
        mode === 'encode'
          ? encodeURIComponent(debouncedInput)
          : decodeURIComponent(debouncedInput)
      );
      setError('');
    } catch {
      setError(mode === 'encode' ? 'Failed to encode input.' : 'Invalid encoded URL. Check the format and try again.');
      setOutput('');
    }
  }, [debouncedInput, mode]);

  const parsedQuery = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    try {
      let queryString = debouncedQuery;
      const qIndex = queryString.indexOf('?');
      if (qIndex !== -1) queryString = queryString.slice(qIndex + 1);
      const hashIndex = queryString.indexOf('#');
      if (hashIndex !== -1) queryString = queryString.slice(0, hashIndex);

      const params = new URLSearchParams(queryString);
      return Array.from(params.entries());
    } catch {
      return [];
    }
  }, [debouncedQuery]);

  const copyOutput = useCallback(() => {
    if (output) {
      copy(output);
      addToast('Copied to clipboard!', 'success');
    }
  }, [output, copy, addToast]);

  const shortcuts = useMemo(() => [
    { key: 'c', ctrl: true, shift: true, handler: copyOutput },
  ], [copyOutput]);
  useKeyboardShortcut(shortcuts);

  return (
    <div className="space-y-6">
      {/* Encoder/Decoder */}
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
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
            Input
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text or URL to encode...' : 'Enter encoded URL to decode...'}
            className="w-full h-24 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none placeholder:text-surface-400 dark:placeholder:text-surface-500"
          />
        </div>

        <ErrorMessage message={error} onDismiss={() => setError('')} />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">
                Output
              </label>
              {isProcessing && (
                <span className="flex items-center gap-1.5 text-xs text-surface-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                  Processing...
                </span>
              )}
            </div>
            {output && !error && <CopyButton text={output} />}
          </div>
          {!input && !output ? (
            <EmptyState
              title="Enter text or URL to encode/decode"
              examples={['"hello world" → "hello%20world"']}
            />
          ) : (
            <textarea
              value={error ? '' : output}
              readOnly
              className="w-full h-24 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2 text-sm font-mono resize-none text-surface-700 dark:text-surface-300"
              placeholder="Output will appear here..."
            />
          )}
        </div>
      </div>

      {/* Query String Parser */}
      <div className="border-t border-surface-200 dark:border-surface-700 pt-5">
        <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">
          Query String Parser
        </h3>
        <div>
          <textarea
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Paste a URL or query string... e.g. https://example.com?name=John&age=30"
            className="w-full h-20 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none placeholder:text-surface-400 dark:placeholder:text-surface-500"
          />
        </div>
        {parsedQuery.length > 0 && (
          <div className="mt-3 rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-100 dark:bg-surface-800">
                  <th className="text-left px-3 py-2 font-medium text-surface-600 dark:text-surface-400">Key</th>
                  <th className="text-left px-3 py-2 font-medium text-surface-600 dark:text-surface-400">Value</th>
                </tr>
              </thead>
              <tbody>
                {parsedQuery.map(([key, value], i) => (
                  <tr key={i} className="border-t border-surface-200 dark:border-surface-700">
                    <td className="px-3 py-2 font-mono text-primary-600 dark:text-primary-400">{key}</td>
                    <td className="px-3 py-2 font-mono text-surface-700 dark:text-surface-300">
                      <div className="flex items-center gap-2">
                        <span className="break-all">{decodeURIComponent(value)}</span>
                        <CopyButton text={decodeURIComponent(value)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
});
