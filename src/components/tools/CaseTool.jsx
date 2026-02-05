import { useState, useMemo } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { camelCase, pascalCase, snakeCase, kebabCase, constantCase } from 'change-case';
import CopyButton from '../CopyButton';

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

export default function CaseTool() {
  const [input, setInput] = useState('');
  const debouncedInput = useDebounce(input, 200);

  const results = useMemo(() => {
    if (!debouncedInput.trim()) return [];
    return CASES.map(({ name, fn }) => ({
      name,
      value: fn(debouncedInput),
    }));
  }, [debouncedInput]);

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
      ) : (
        <div className="text-sm text-surface-400 dark:text-surface-500 text-center py-8 bg-surface-50 dark:bg-surface-800/30 rounded-lg border border-dashed border-surface-300 dark:border-surface-700">
          Converted results will appear here as you type
        </div>
      )}
    </div>
  );
}
