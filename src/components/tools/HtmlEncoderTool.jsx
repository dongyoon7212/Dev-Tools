import { useState, useMemo, memo, useCallback } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useProcessingState } from '../../hooks/useProcessingState';
import CopyButton from '../CopyButton';
import EmptyState from '../EmptyState';

const ENTITIES = [
  ['&', '&amp;'],
  ['<', '&lt;'],
  ['>', '&gt;'],
  ['"', '&quot;'],
  ["'", '&#39;'],
];

function encodeHtml(str) {
  return ENTITIES.reduce((s, [char, entity]) => s.split(char).join(entity), str);
}

function decodeHtml(str) {
  const el = document.createElement('textarea');
  el.innerHTML = str;
  return el.value;
}

export default memo(function HtmlEncoderTool() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const debouncedInput = useDebounce(input, 200);
  const { isProcessing } = useProcessingState(input, debouncedInput);

  const output = useMemo(() => {
    if (!debouncedInput) return '';
    return mode === 'encode' ? encodeHtml(debouncedInput) : decodeHtml(debouncedInput);
  }, [debouncedInput, mode]);

  const swap = useCallback(() => {
    if (!output) return;
    setMode((m) => (m === 'encode' ? 'decode' : 'encode'));
    setInput(output);
  }, [output]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
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
          {mode === 'encode' ? 'HTML Input' : 'Encoded Input'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? '<h1>Hello & "World"</h1>' : '&lt;h1&gt;Hello &amp; &quot;World&quot;&lt;/h1&gt;'}
          className="w-full h-44 bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary-400 dark:focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 resize-none placeholder:text-surface-300 dark:placeholder:text-surface-600 text-surface-800 dark:text-surface-100"
        />
      </div>

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
          {output && <CopyButton text={output} />}
        </div>
        {!input ? (
          <EmptyState
            title="Encode HTML special characters or decode entities"
            examples={['< > & " \' → &lt; &gt; &amp; &quot; &#39;']}
          />
        ) : (
          <textarea
            value={output}
            readOnly
            className="w-full h-44 bg-surface-50 dark:bg-surface-800/60 border-2 border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-sm font-mono resize-none text-surface-700 dark:text-surface-200 cursor-text select-all"
          />
        )}
      </div>

      {/* Reference table */}
      <div className="border-t border-surface-200 dark:border-surface-700 pt-5">
        <h3 className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-widest mb-3">Entity Reference</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {ENTITIES.map(([char, entity]) => (
            <div key={char} className="bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2 text-center">
              <div className="text-sm font-mono font-bold text-primary-600 dark:text-primary-400">{char}</div>
              <div className="text-xs text-surface-400 mt-0.5">{entity}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
