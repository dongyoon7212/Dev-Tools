import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useProcessingState } from '../../hooks/useProcessingState';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useToast } from '../../contexts/ToastContext';
import CopyButton from '../CopyButton';
import EmptyState from '../EmptyState';
import ErrorMessage from '../ErrorMessage';

export default memo(function JsonFormatterTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const [isMinified, setIsMinified] = useState(false);
  const debouncedInput = useDebounce(input, 300);
  const { isProcessing } = useProcessingState(input, debouncedInput);
  const { copy } = useCopyToClipboard();
  const { addToast } = useToast();

  useEffect(() => {
    if (!debouncedInput.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      const parsed = JSON.parse(debouncedInput);
      const formatted = isMinified
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, indent);
      setOutput(formatted);
      setError('');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  }, [debouncedInput, indent, isMinified]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch {
      addToast('Unable to read clipboard. Please paste manually.', 'error');
    }
  }, [addToast]);

  const shortcuts = useMemo(() => [
    { key: 'c', ctrl: true, shift: true, handler: () => { if (output) { copy(output); addToast('Copied to clipboard!', 'success'); } } },
  ], [output, copy, addToast]);
  useKeyboardShortcut(shortcuts);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setIsMinified(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !isMinified
              ? 'bg-primary-600 text-white'
              : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300'
          }`}
        >
          Beautify
        </button>
        <button
          onClick={() => setIsMinified(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isMinified
              ? 'bg-primary-600 text-white'
              : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300'
          }`}
        >
          Minify
        </button>
        {!isMinified && (
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="px-3 py-2 rounded-lg text-sm bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={8}>Tab (8)</option>
          </select>
        )}
        <button
          onClick={handlePaste}
          className="ml-auto px-3 py-2 rounded-lg text-sm bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700 transition-colors"
        >
          Paste
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
          JSON Input
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Paste your JSON here... e.g. {"name": "value"}'
          className="w-full h-40 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none placeholder:text-surface-400 dark:placeholder:text-surface-500"
          spellCheck={false}
        />
      </div>

      <ErrorMessage message={error ? `Syntax Error: ${error}` : ''} onDismiss={() => setError('')} />

      {!error && debouncedInput.trim() && (
        <div className="text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Valid JSON
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">
              Formatted Output
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
            title="Paste JSON to format or validate"
            examples={['{ "key": "value" }']}
          />
        ) : (
          <textarea
            value={output}
            readOnly
            className="w-full h-48 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2 text-sm font-mono resize-none text-surface-700 dark:text-surface-300"
            placeholder="Formatted JSON will appear here..."
          />
        )}
      </div>
    </div>
  );
});
