import { useState, useMemo, useCallback, memo } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useProcessingState } from '../../hooks/useProcessingState';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useToast } from '../../contexts/ToastContext';
import CopyButton from '../CopyButton';
import EmptyState from '../EmptyState';
import ErrorMessage from '../ErrorMessage';

export default memo(function RegexTool() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [error, setError] = useState('');
  const debouncedPattern = useDebounce(pattern, 200);
  const debouncedTest = useDebounce(testString, 200);
  const { isProcessing } = useProcessingState(pattern, debouncedPattern);
  const { copy } = useCopyToClipboard();
  const { addToast } = useToast();

  const flagOptions = [
    { flag: 'g', label: 'Global' },
    { flag: 'i', label: 'Case Insensitive' },
    { flag: 'm', label: 'Multiline' },
    { flag: 's', label: 'Dot All' },
  ];

  const toggleFlag = useCallback((f) => {
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, '') : prev + f));
  }, []);

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
          if (!match[0]) break;
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
      setError('Invalid regex: ' + e.message);
      return { matches: [], highlighted: null };
    }
  }, [debouncedPattern, debouncedTest, flags]);

  const copyMatches = useCallback(() => {
    if (matches.length > 0) {
      const text = matches.map((m) => m.value).join('\n');
      copy(text);
      addToast('Copied all matches!', 'success');
    }
  }, [matches, copy, addToast]);

  const shortcuts = useMemo(() => [
    { key: 'c', ctrl: true, shift: true, handler: copyMatches },
  ], [copyMatches]);
  useKeyboardShortcut(shortcuts);

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

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">
            Test String
          </label>
          {isProcessing && (
            <span className="flex items-center gap-1.5 text-xs text-surface-400">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
              Processing...
            </span>
          )}
        </div>
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

      {!pattern && !testString && (
        <EmptyState
          title="Enter a regex pattern and test string to find matches"
          examples={['/\\d+/g matches "abc 123 def 456"']}
        />
      )}
    </div>
  );
});
