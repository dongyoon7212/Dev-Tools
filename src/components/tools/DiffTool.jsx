import { useState, useMemo } from 'react';
import { diffLines, diffWords } from 'diff';

export default function DiffTool() {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [viewMode, setViewMode] = useState('side'); // 'side' or 'inline'
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [compared, setCompared] = useState(false);

  const diffs = useMemo(() => {
    if (!compared) return null;

    let l = left;
    let r = right;
    if (ignoreCase) {
      l = l.toLowerCase();
      r = r.toLowerCase();
    }

    return diffLines(l, r, { ignoreWhitespace });
  }, [compared, left, right, ignoreCase, ignoreWhitespace]);

  const handleCompare = () => setCompared(true);

  // Reset on edit
  const handleLeftChange = (e) => {
    setLeft(e.target.value);
    setCompared(false);
  };
  const handleRightChange = (e) => {
    setRight(e.target.value);
    setCompared(false);
  };

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

  // Build side-by-side view data
  const sideBySideRows = useMemo(() => {
    if (!diffs) return [];
    const rows = [];
    let leftLine = 1;
    let rightLine = 1;

    for (let i = 0; i < diffs.length; i++) {
      const part = diffs[i];
      const lines = part.value.replace(/\n$/, '').split('\n');

      if (!part.added && !part.removed) {
        // Unchanged
        lines.forEach((line) => {
          rows.push({ type: 'unchanged', left: line, right: line, leftNum: leftLine++, rightNum: rightLine++ });
        });
      } else if (part.removed && diffs[i + 1]?.added) {
        // Modified: removed + added pair
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
        i++; // Skip the added part
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

  return (
    <div className="space-y-4">
      {/* Guide */}
      <p className="text-xs text-surface-500 dark:text-surface-400">
        Paste two texts and compare them line by line. Differences are highlighted by color.
      </p>

      {/* Input Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
            Original Text
          </label>
          <textarea
            value={left}
            onChange={handleLeftChange}
            placeholder="Paste original text..."
            className="w-full h-40 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none placeholder:text-surface-400 dark:placeholder:text-surface-500"
            spellCheck={false}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
            Modified Text
          </label>
          <textarea
            value={right}
            onChange={handleRightChange}
            placeholder="Paste modified text..."
            className="w-full h-40 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none placeholder:text-surface-400 dark:placeholder:text-surface-500"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleCompare}
          disabled={!left && !right}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Compare
        </button>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('side')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'side'
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                : 'text-surface-500 dark:text-surface-400'
            }`}
          >
            Side by Side
          </button>
          <button
            onClick={() => setViewMode('inline')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'inline'
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                : 'text-surface-500 dark:text-surface-400'
            }`}
          >
            Inline
          </button>
        </div>

        {/* Options */}
        <label className="flex items-center gap-2 text-xs text-surface-600 dark:text-surface-400 cursor-pointer">
          <input
            type="checkbox"
            checked={ignoreCase}
            onChange={(e) => { setIgnoreCase(e.target.checked); setCompared(false); }}
            className="rounded border-surface-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500"
          />
          Ignore case
        </label>
        <label className="flex items-center gap-2 text-xs text-surface-600 dark:text-surface-400 cursor-pointer">
          <input
            type="checkbox"
            checked={ignoreWhitespace}
            onChange={(e) => { setIgnoreWhitespace(e.target.checked); setCompared(false); }}
            className="rounded border-surface-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500"
          />
          Ignore whitespace
        </label>
      </div>

      {/* Stats */}
      {stats && (
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="text-green-600 dark:text-green-400">+{stats.added} added</span>
          <span className="text-red-500 dark:text-red-400">-{stats.removed} removed</span>
          <span className="text-surface-500 dark:text-surface-400">{stats.unchanged} unchanged</span>
        </div>
      )}

      {/* Diff Results */}
      {diffs && viewMode === 'side' && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <tbody>
              {sideBySideRows.map((row, i) => (
                <tr key={i}>
                  {/* Left line number */}
                  <td className="w-8 px-2 py-0.5 text-right text-surface-400 dark:text-surface-500 bg-surface-50 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 select-none">
                    {row.leftNum}
                  </td>
                  {/* Left content */}
                  <td
                    className={`px-2 py-0.5 whitespace-pre-wrap border-r border-surface-200 dark:border-surface-700 ${
                      row.type === 'removed'
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                        : row.type === 'modified'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                        : 'text-surface-700 dark:text-surface-300'
                    }`}
                  >
                    {row.left ?? ''}
                  </td>
                  {/* Right line number */}
                  <td className="w-8 px-2 py-0.5 text-right text-surface-400 dark:text-surface-500 bg-surface-50 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 select-none">
                    {row.rightNum}
                  </td>
                  {/* Right content */}
                  <td
                    className={`px-2 py-0.5 whitespace-pre-wrap ${
                      row.type === 'added'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                        : row.type === 'modified'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                        : 'text-surface-700 dark:text-surface-300'
                    }`}
                  >
                    {row.right ?? ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {diffs && viewMode === 'inline' && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden">
          <div className="text-xs font-mono">
            {diffs.map((part, i) => {
              const lines = part.value.replace(/\n$/, '').split('\n');
              return lines.map((line, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`px-3 py-0.5 whitespace-pre-wrap ${
                    part.added
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                      : part.removed
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 line-through'
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

      {!diffs && (
        <div className="text-sm text-surface-400 dark:text-surface-500 text-center py-8 bg-surface-50 dark:bg-surface-800/30 rounded-lg border border-dashed border-surface-300 dark:border-surface-700">
          Enter two texts and click "Compare" to see differences
        </div>
      )}
    </div>
  );
}
