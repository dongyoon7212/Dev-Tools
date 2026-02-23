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
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl">
            <button
              onClick={() => setMode('encode')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === 'encode'
                  ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === 'decode'
                  ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
              }`}
            >
              Decode
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
            Input
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text or URL to encode...' : 'Enter encoded URL to decode...'}
            className="w-full h-36 bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary-400 dark:focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 resize-none placeholder:text-surface-300 dark:placeholder:text-surface-600 text-surface-800 dark:text-surface-100"
          />
        </div>

        <ErrorMessage message={error} onDismiss={() => setError('')} />

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
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
              className="w-full h-36 bg-surface-50 dark:bg-surface-800/60 border-2 border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-sm font-mono resize-none text-surface-700 dark:text-surface-200 cursor-text select-all"
              placeholder="Output will appear here..."
            />
          )}
        </div>
      </div>

      {/* Query String Parser */}
      <div className="border-t border-surface-200 dark:border-surface-700 pt-6">
        <h3 className="text-sm font-bold text-surface-700 dark:text-surface-300 mb-3">
          Query String Parser
        </h3>
        <div>
          <textarea
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Paste a URL or query string... e.g. https://example.com?name=John&age=30"
            className="w-full h-28 bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary-400 dark:focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 resize-none placeholder:text-surface-300 dark:placeholder:text-surface-600 text-surface-800 dark:text-surface-100"
          />
        </div>
        {parsedQuery.length > 0 && (
          <div className="mt-4 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden card-pop">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-100 dark:bg-surface-800">
                  <th className="text-left px-4 py-3 font-semibold text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Key</th>
                  <th className="text-left px-4 py-3 font-semibold text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Value</th>
                </tr>
              </thead>
              <tbody>
                {parsedQuery.map(([key, value], i) => (
                  <tr key={i} className="border-t border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-primary-600 dark:text-primary-400 font-medium">{key}</td>
                    <td className="px-4 py-3 font-mono text-surface-700 dark:text-surface-300">
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
