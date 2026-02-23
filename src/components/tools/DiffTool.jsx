import { useState, useMemo, useCallback, memo } from 'react';
import { diffLines } from 'diff';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import EmptyState from '../EmptyState';
import ErrorMessage from '../ErrorMessage';

export default memo(function DiffTool() {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [viewMode, setViewMode] = useState('side');
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [compared, setCompared] = useState(false);
  const [error, setError] = useState('');

  const diffs = useMemo(() => {
    if (!compared) return null;
    try {
      let l = left;
      let r = right;
      if (ignoreCase) { l = l.toLowerCase(); r = r.toLowerCase(); }
      setError('');
      return diffLines(l, r, { ignoreWhitespace });
    } catch (e) {
      setError('Failed to compare texts: ' + e.message);
      return null;
    }
  }, [compared, left, right, ignoreCase, ignoreWhitespace]);

  const handleCompare = useCallback(() => setCompared(true), []);
  const handleLeftChange = useCallback((e) => { setLeft(e.target.value); setCompared(false); }, []);
  const handleRightChange = useCallback((e) => { setRight(e.target.value); setCompared(false); }, []);

  const stats = useMemo(() => {
    if (!diffs) return null;
    let added = 0, removed = 0, unchanged = 0;
    diffs.forEach((part) => {
      const lines = part.value.split('\n').filter((l) => l !== '').length;
      if (part.added) added += lines;
      else if (part.removed) removed += lines;
      else unchanged += lines;
    });
    return { added, removed, unchanged };
  }, [diffs]);

  const sideBySideRows = useMemo(() => {
    if (!diffs) return [];
    const rows = [];
    let leftLine = 1;
    let rightLine = 1;

    for (let i = 0; i < diffs.length; i++) {
      const part = diffs[i];
      const lines = part.value.replace(/\n$/, '').split('\n');

      if (!part.added && !part.removed) {
        lines.forEach((line) => {
          rows.push({ type: 'unchanged', left: line, right: line, leftNum: leftLine++, rightNum: rightLine++ });
        });
      } else if (part.removed && diffs[i + 1]?.added) {
        const addedLines = diffs[i + 1].value.replace(/\n$/, '').split('\n');
        const maxLen = Math.max(lines.length, addedLines.length);
        for (let j = 0; j < maxLen; j++) {
          rows.push({
            type: 'modified',
            left: j < lines.length ? lines[j] : null,
            right: j < addedLines.length ? addedLines[j] : null,
            leftNum: j < lines.length ? leftLine++ : null,
            rightNum: j < addedLines.length ? rightLine++ : null,
          });
        }
        i++;
      } else if (part.removed) {
        lines.forEach((line) => {
          rows.push({ type: 'removed', left: line, right: null, leftNum: leftLine++, rightNum: null });
        });
      } else if (part.added) {
        lines.forEach((line) => {
          rows.push({ type: 'added', left: null, right: line, leftNum: null, rightNum: rightLine++ });
        });
      }
    }
    return rows;
  }, [diffs]);

  const shortcuts = useMemo(() => [
    { key: 'Enter', ctrl: true, handler: handleCompare },
  ], [handleCompare]);
  useKeyboardShortcut(shortcuts);

  return (
    <div className="space-y-6">
      {/* Input Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
            Original Text
          </label>
          <textarea
            value={left}
            onChange={handleLeftChange}
            placeholder="Paste original text..."
            className="w-full h-52 bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-red-400 dark:focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200 resize-none placeholder:text-surface-300 dark:placeholder:text-surface-600 text-surface-800 dark:text-surface-100"
            spellCheck={false}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
            Modified Text
          </label>
          <textarea
            value={right}
            onChange={handleRightChange}
            placeholder="Paste modified text..."
            className="w-full h-52 bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-green-400 dark:focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 resize-none placeholder:text-surface-300 dark:placeholder:text-surface-600 text-surface-800 dark:text-surface-100"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleCompare}
          disabled={!left && !right}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 active:scale-95 transition-all duration-200 shadow-sm shadow-primary-500/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          title="Compare (Ctrl+Enter)"
        >
          Compare
        </button>

        <div className="flex items-center gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl">
          <button
            onClick={() => setViewMode('side')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              viewMode === 'side'
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
            }`}
          >
            Side by Side
          </button>
          <button
            onClick={() => setViewMode('inline')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              viewMode === 'inline'
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
            }`}
          >
            Inline
          </button>
        </div>

        <label className="flex items-center gap-2 text-xs text-surface-600 dark:text-surface-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={ignoreCase}
            onChange={(e) => { setIgnoreCase(e.target.checked); setCompared(false); }}
            className="rounded border-surface-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500"
          />
          Ignore case
        </label>
        <label className="flex items-center gap-2 text-xs text-surface-600 dark:text-surface-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={ignoreWhitespace}
            onChange={(e) => { setIgnoreWhitespace(e.target.checked); setCompared(false); }}
            className="rounded border-surface-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500"
          />
          Ignore whitespace
        </label>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      {/* Stats */}
      {stats && (
        <div className="flex items-center gap-4 text-sm font-semibold p-3 bg-surface-50 dark:bg-surface-800/50 rounded-xl border border-surface-200 dark:border-surface-700">
          <span className="text-green-600 dark:text-green-400">+{stats.added} added</span>
          <span className="text-surface-300 dark:text-surface-600">·</span>
          <span className="text-red-500 dark:text-red-400">-{stats.removed} removed</span>
          <span className="text-surface-300 dark:text-surface-600">·</span>
          <span className="text-surface-500 dark:text-surface-400">{stats.unchanged} unchanged</span>
        </div>
      )}

      {/* Diff Results */}
      {diffs && viewMode === 'side' && (
        <div className="rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden overflow-x-auto card-pop">
          <table className="w-full text-xs font-mono border-collapse">
            <tbody>
              {sideBySideRows.map((row, i) => (
                <tr key={i} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/30">
                  <td className="w-8 px-2 py-1 text-right text-surface-400 dark:text-surface-500 bg-surface-50 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 select-none">
                    {row.leftNum}
                  </td>
                  <td className={`px-3 py-1 whitespace-pre-wrap border-r border-surface-200 dark:border-surface-700 ${
                    row.type === 'removed' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                    : row.type === 'modified' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                    : 'text-surface-700 dark:text-surface-300'
                  }`}>
                    {row.left ?? ''}
                  </td>
                  <td className="w-8 px-2 py-1 text-right text-surface-400 dark:text-surface-500 bg-surface-50 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 select-none">
                    {row.rightNum}
                  </td>
                  <td className={`px-3 py-1 whitespace-pre-wrap ${
                    row.type === 'added' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                    : row.type === 'modified' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                    : 'text-surface-700 dark:text-surface-300'
                  }`}>
                    {row.right ?? ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {diffs && viewMode === 'inline' && (
        <div className="rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden card-pop">
          <div className="text-xs font-mono">
            {diffs.map((part, i) => {
              const lines = part.value.replace(/\n$/, '').split('\n');
              return lines.map((line, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`px-4 py-1 whitespace-pre-wrap ${
                    part.added ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                    : part.removed ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 line-through'
                    : 'text-surface-700 dark:text-surface-300'
                  }`}
                >
                  <span className="inline-block w-4 text-surface-400 select-none mr-2">
                    {part.added ? '+' : part.removed ? '-' : ' '}
                  </span>
                  {line}
                </div>
              ));
            })}
          </div>
        </div>
      )}

      {!diffs && !error && (
        <EmptyState
          title='Enter two texts and click "Compare" to see differences'
          examples={['Supports side-by-side and inline views', 'Ctrl+Enter to compare']}
        />
      )}
    </div>
  );
});
