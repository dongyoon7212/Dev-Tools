import { useState, useCallback, useMemo, memo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useToast } from '../../contexts/ToastContext';
import CopyButton from '../CopyButton';
import EmptyState from '../EmptyState';
import ErrorMessage from '../ErrorMessage';

export default memo(function UuidTool() {
  const [uuids, setUuids] = useState([]);
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [error, setError] = useState('');
  const { copy } = useCopyToClipboard();
  const { addToast } = useToast();

  const generate = useCallback(() => {
    try {
      const list = Array.from({ length: count }, () => {
        let id = uuidv4();
        if (!hyphens) id = id.replace(/-/g, '');
        if (uppercase) id = id.toUpperCase();
        return id;
      });
      setUuids(list);
      setError('');
    } catch (e) {
      setError('Failed to generate UUIDs: ' + e.message);
    }
  }, [count, uppercase, hyphens]);

  const allText = uuids.join('\n');

  const copyAll = useCallback(() => {
    if (allText) {
      copy(allText);
      addToast('Copied all UUIDs!', 'success');
    }
  }, [allText, copy, addToast]);

  const shortcuts = useMemo(() => [
    { key: 'Enter', ctrl: true, handler: generate },
    { key: 'c', ctrl: true, shift: true, handler: copyAll },
  ], [generate, copyAll]);
  useKeyboardShortcut(shortcuts);

  return (
    <div className="space-y-4">
      {/* Guide */}
      <p className="text-xs text-surface-500 dark:text-surface-400">
        Generate random UUID v4 identifiers. Customize the format and quantity below.
      </p>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={generate}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          title="Generate UUID (Ctrl+Enter)"
        >
          Generate UUID
        </button>

        <select
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="px-3 py-2 rounded-lg text-sm bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value={1}>1 UUID</option>
          <option value={5}>5 UUIDs</option>
          <option value={10}>10 UUIDs</option>
        </select>
      </div>

      {/* Format Options */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400 cursor-pointer">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="rounded border-surface-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500"
          />
          Uppercase
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400 cursor-pointer">
          <input
            type="checkbox"
            checked={hyphens}
            onChange={(e) => setHyphens(e.target.checked)}
            className="rounded border-surface-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500"
          />
          Include hyphens
        </label>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      {/* Results */}
      {uuids.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">
              Generated UUIDs ({uuids.length})
            </label>
            <CopyButton text={allText} className="" />
          </div>
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {uuids.map((id, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2"
              >
                <code className="text-sm font-mono text-surface-700 dark:text-surface-300 break-all select-all">
                  {id}
                </code>
                <CopyButton text={id} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title='Click "Generate UUID" to create new identifiers'
          examples={['Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx', 'Ctrl+Enter to generate']}
        />
      )}
    </div>
  );
});
