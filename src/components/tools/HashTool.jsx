import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { useDebounce } from '../../hooks/useDebounce';
import CopyButton from '../CopyButton';

const ALGORITHMS = [
  { name: 'MD5', fn: (text) => CryptoJS.MD5(text).toString() },
  { name: 'SHA-1', fn: (text) => CryptoJS.SHA1(text).toString() },
  { name: 'SHA-256', fn: (text) => CryptoJS.SHA256(text).toString() },
  { name: 'SHA-512', fn: (text) => CryptoJS.SHA512(text).toString() },
];

export default function HashTool() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState([]);
  const debouncedInput = useDebounce(input, 200);

  useEffect(() => {
    if (!debouncedInput) {
      setHashes([]);
      return;
    }
    const results = ALGORITHMS.map(({ name, fn }) => ({
      name,
      value: fn(debouncedInput),
    }));
    setHashes(results);
  }, [debouncedInput]);

  return (
    <div className="space-y-4">
      {/* Guide */}
      <p className="text-xs text-surface-500 dark:text-surface-400">
        Enter text below to generate hashes in multiple algorithms simultaneously.
      </p>

      {/* Input */}
      <div>
        <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
          Input Text
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash..."
          className="w-full h-28 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none placeholder:text-surface-400 dark:placeholder:text-surface-500"
        />
      </div>

      {/* Hash Results */}
      {hashes.length > 0 ? (
        <div className="space-y-3">
          {hashes.map(({ name, value }) => (
            <div
              key={name}
              className="bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
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
          Hash results will appear here as you type
        </div>
      )}
    </div>
  );
}
