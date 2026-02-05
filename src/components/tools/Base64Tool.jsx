import { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import CopyButton from '../CopyButton';

export default function Base64Tool() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const debouncedInput = useDebounce(input, 200);

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
      setError(mode === 'encode' ? 'Failed to encode input' : 'Invalid Base64 string');
      setOutput('');
    }
  }, [debouncedInput, mode]);

  const swap = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setInput(output);
  };

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
          title="Swap input/output"
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

      {error && (
        <div className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">
            {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
          </label>
          {output && <CopyButton text={output} />}
        </div>
        <textarea
          value={output}
          readOnly
          className="w-full h-32 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2 text-sm font-mono resize-none text-surface-700 dark:text-surface-300"
          placeholder="Output will appear here..."
        />
      </div>
    </div>
  );
}
