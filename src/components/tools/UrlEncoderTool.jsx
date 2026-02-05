import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import CopyButton from '../CopyButton';

export default function UrlEncoderTool() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const debouncedInput = useDebounce(input, 200);
  const debouncedQuery = useDebounce(queryInput, 300);

  useEffect(() => {
    if (!debouncedInput) {
      setOutput('');
      return;
    }
    try {
      setOutput(
        mode === 'encode'
          ? encodeURIComponent(debouncedInput)
          : decodeURIComponent(debouncedInput)
      );
    } catch {
      setOutput('Invalid input');
    }
  }, [debouncedInput, mode]);

  const parsedQuery = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    try {
      let queryString = debouncedQuery;
      // Extract query string from full URL if needed
      const qIndex = queryString.indexOf('?');
      if (qIndex !== -1) queryString = queryString.slice(qIndex + 1);
      // Remove hash
      const hashIndex = queryString.indexOf('#');
      if (hashIndex !== -1) queryString = queryString.slice(0, hashIndex);

      const params = new URLSearchParams(queryString);
      return Array.from(params.entries());
    } catch {
      return [];
    }
  }, [debouncedQuery]);

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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">
              Output
            </label>
            {output && <CopyButton text={output} />}
          </div>
          <textarea
            value={output}
            readOnly
            className="w-full h-24 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2 text-sm font-mono resize-none text-surface-700 dark:text-surface-300"
            placeholder="Output will appear here..."
          />
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
}
