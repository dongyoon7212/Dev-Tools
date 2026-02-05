import { useState, useMemo } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import CopyButton from '../CopyButton';

export default function RegexTool() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [error, setError] = useState('');
  const debouncedPattern = useDebounce(pattern, 200);
  const debouncedTest = useDebounce(testString, 200);

  const flagOptions = [
    { flag: 'g', label: 'Global' },
    { flag: 'i', label: 'Case Insensitive' },
    { flag: 'm', label: 'Multiline' },
    { flag: 's', label: 'Dot All' },
  ];

  const toggleFlag = (f) => {
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, '') : prev + f));
  };

  const { matches, highlighted } = useMemo(() => {
    if (!debouncedPattern || !debouncedTest) {
      setError('');
      return { matches: [], highlighted: null };
    }
    try {
      const regex = new RegExp(debouncedPattern, flags);
      setError('');

      const matchList = [];
      let match;

      if (flags.includes('g')) {
        while ((match = regex.exec(debouncedTest)) !== null) {
          matchList.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          if (!match[0]) break; // prevent infinite loop on empty match
        }
      } else {
        match = regex.exec(debouncedTest);
        if (match) {
          matchList.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      // Build highlighted string
      let parts = [];
      let lastIndex = 0;
      const colors = ['bg-yellow-200 dark:bg-yellow-800', 'bg-green-200 dark:bg-green-800', 'bg-blue-200 dark:bg-blue-800', 'bg-pink-200 dark:bg-pink-800'];

      matchList.forEach((m, i) => {
        if (m.index > lastIndex) {
          parts.push({ text: debouncedTest.slice(lastIndex, m.index), highlight: false });
        }
        parts.push({ text: m.value, highlight: true, color: colors[i % colors.length] });
        lastIndex = m.index + m.value.length;
      });
      if (lastIndex < debouncedTest.length) {
        parts.push({ text: debouncedTest.slice(lastIndex), highlight: false });
      }

      return { matches: matchList, highlighted: parts };
    } catch (e) {
      setError(e.message);
      return { matches: [], highlighted: null };
    }
  }, [debouncedPattern, debouncedTest, flags]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
          Regular Expression
        </label>
        <div className="flex items-center gap-1">
          <span className="text-surface-400 dark:text-surface-500 font-mono text-lg">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            className="flex-1 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-surface-400 dark:placeholder:text-surface-500"
          />
          <span className="text-surface-400 dark:text-surface-500 font-mono text-lg">/{flags}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {flagOptions.map(({ flag, label }) => (
          <button
            key={flag}
            onClick={() => toggleFlag(flag)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              flags.includes(flag)
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 ring-1 ring-primary-300 dark:ring-primary-700'
                : 'bg-surface-100 text-surface-500 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700'
            }`}
          >
            {flag} - {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg font-mono">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
          Test String
        </label>
        <textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter test string..."
          className="w-full h-28 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none placeholder:text-surface-400 dark:placeholder:text-surface-500"
        />
      </div>

      {/* Highlighted Result */}
      {highlighted && highlighted.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
            Match Highlight
          </label>
          <div className="bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm font-mono whitespace-pre-wrap break-all">
            {highlighted.map((part, i) =>
              part.highlight ? (
                <mark key={i} className={`${part.color} rounded px-0.5`}>
                  {part.text}
                </mark>
              ) : (
                <span key={i} className="text-surface-700 dark:text-surface-300">{part.text}</span>
              )
            )}
          </div>
        </div>
      )}

      {/* Match Details */}
      {matches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">
              Matches ({matches.length})
            </label>
            <CopyButton text={matches.map((m) => m.value).join('\n')} />
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {matches.map((m, i) => (
              <div key={i} className="bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2 text-sm font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-surface-400 min-w-[3rem]">#{i + 1}</span>
                  <span className="text-surface-700 dark:text-surface-300">"{m.value}"</span>
                  <span className="text-xs text-surface-400">@{m.index}</span>
                </div>
                {m.groups.length > 0 && (
                  <div className="mt-1 ml-12 text-xs text-surface-500">
                    Groups: {m.groups.map((g, gi) => (
                      <span key={gi} className="mr-2">${gi + 1}="{g}"</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
