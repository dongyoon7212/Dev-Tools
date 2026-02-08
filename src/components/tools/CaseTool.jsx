import { useState, useMemo, memo, useCallback } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useProcessingState } from '../../hooks/useProcessingState';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useToast } from '../../contexts/ToastContext';
import { camelCase, pascalCase, snakeCase, kebabCase, constantCase } from 'change-case';
import CopyButton from '../CopyButton';
import EmptyState from '../EmptyState';
import ErrorMessage from '../ErrorMessage';

function toTitleCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const CASES = [
  { name: 'camelCase', fn: camelCase },
  { name: 'PascalCase', fn: pascalCase },
  { name: 'snake_case', fn: snakeCase },
  { name: 'kebab-case', fn: kebabCase },
  { name: 'CONSTANT_CASE', fn: constantCase },
  { name: 'Title Case', fn: toTitleCase },
  { name: 'lower case', fn: (s) => s.toLowerCase() },
  { name: 'UPPER CASE', fn: (s) => s.toUpperCase() },
];

export default memo(function CaseTool() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const debouncedInput = useDebounce(input, 200);
  const { isProcessing } = useProcessingState(input, debouncedInput);
  const { copy } = useCopyToClipboard();
  const { addToast } = useToast();

  const results = useMemo(() => {
    if (!debouncedInput.trim()) return [];
    try {
      setError('');
      return CASES.map(({ name, fn }) => ({
        name,
        value: fn(debouncedInput),
      }));
    } catch (e) {
      setError('Failed to convert text: ' + e.message);
      return [];
    }
  }, [debouncedInput]);

  const copyAll = useCallback(() => {
    if (results.length > 0) {
      const text = results.map((r) => `${r.name}: ${r.value}`).join('\n');
      copy(text);
      addToast('Copied all conversions!', 'success');
    }
  }, [results, copy, addToast]);

  const shortcuts = useMemo(() => [
    { key: 'c', ctrl: true, shift: true, handler: copyAll },
  ], [copyAll]);
  useKeyboardShortcut(shortcuts);

  return (
    <div className="space-y-4">
      {/* Guide */}
      <p className="text-xs text-surface-500 dark:text-surface-400">
        Type text below to convert it to various naming conventions in real time.
      </p>

      {/* Input */}
      <div>
        <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
          Input Text
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='e.g. "hello world example"'
          className="w-full h-20 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none placeholder:text-surface-400 dark:placeholder:text-surface-500"
        />
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      {/* Processing indicator */}
      {isProcessing && input && (
        <span className="flex items-center gap-1.5 text-xs text-surface-400">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
          Processing...
        </span>
      )}

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {results.map(({ name, value }) => (
            <div
              key={name}
              className="bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
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
          title="Type text to see all case conversions"
          examples={['"hello world" → camelCase, snake_case, kebab-case...']}
        />
      )}
    </div>
  );
});
