import { useState, useMemo, useCallback, memo } from 'react';
import * as yaml from 'js-yaml';
import { useDebounce } from '../../hooks/useDebounce';
import { useProcessingState } from '../../hooks/useProcessingState';
import CopyButton from '../CopyButton';
import EmptyState from '../EmptyState';
import ErrorMessage from '../ErrorMessage';

export default memo(function YamlJsonTool() {
  const [mode, setMode] = useState('yaml2json'); // yaml2json | json2yaml
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const debouncedInput = useDebounce(input, 300);
  const { isProcessing } = useProcessingState(input, debouncedInput);

  const output = useMemo(() => {
    setError('');
    if (!debouncedInput.trim()) return '';
    try {
      if (mode === 'yaml2json') {
        const parsed = yaml.load(debouncedInput);
        return JSON.stringify(parsed, null, 2);
      } else {
        const parsed = JSON.parse(debouncedInput);
        return yaml.dump(parsed, { indent: 2, lineWidth: -1 });
      }
    } catch (e) {
      setError(e.message);
      return '';
    }
  }, [debouncedInput, mode]);

  const swap = useCallback(() => {
    if (!output) return;
    setMode((m) => (m === 'yaml2json' ? 'json2yaml' : 'yaml2json'));
    setInput(output);
  }, [output]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl">
          <button
            onClick={() => setMode('yaml2json')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === 'yaml2json'
                ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
            }`}
          >
            YAML → JSON
          </button>
          <button
            onClick={() => setMode('json2yaml')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === 'json2yaml'
                ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
            }`}
          >
            JSON → YAML
          </button>
        </div>
        <button
          onClick={swap}
          disabled={!output}
          className="p-2.5 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 disabled:opacity-40"
          title="Swap"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
        </button>
      </div>

      <div>
        <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
          {mode === 'yaml2json' ? 'YAML Input' : 'JSON Input'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'yaml2json'
            ? 'name: John\nage: 30\nhobbies:\n  - coding\n  - reading'
            : '{\n  "name": "John",\n  "age": 30\n}'}
          className="w-full h-52 bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary-400 dark:focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 resize-none placeholder:text-surface-300 dark:placeholder:text-surface-600 text-surface-800 dark:text-surface-100"
          spellCheck={false}
        />
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
              {mode === 'yaml2json' ? 'JSON Output' : 'YAML Output'}
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
        {!input ? (
          <EmptyState
            title={mode === 'yaml2json' ? 'Paste YAML to convert to JSON' : 'Paste JSON to convert to YAML'}
            examples={mode === 'yaml2json' ? ['name: hello\nvalue: 42'] : ['{ "name": "hello", "value": 42 }']}
          />
        ) : (
          <textarea
            value={output}
            readOnly
            className="w-full h-52 bg-surface-50 dark:bg-surface-800/60 border-2 border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-sm font-mono resize-none text-surface-700 dark:text-surface-200 cursor-text select-all"
            placeholder="Output will appear here..."
          />
        )}
      </div>
    </div>
  );
});
