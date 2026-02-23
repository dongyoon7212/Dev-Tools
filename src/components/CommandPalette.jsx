import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';

export default memo(function CommandPalette({ tools, activeTool, onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = tools.filter((t) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q);
  });

  useEffect(() => {
    setCursor(0);
  }, [query]);

  const select = useCallback((toolId) => {
    onSelect(toolId);
    onClose();
  }, [onSelect, onClose]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[cursor]) select(filtered[cursor].id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filtered, cursor, select, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.children[cursor];
    active?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-200 dark:border-surface-700">
          <svg className="w-4 h-4 text-surface-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools..."
            className="flex-1 bg-transparent text-sm text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none"
          />
          <kbd className="hidden sm:block px-2 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-[10px] text-surface-400 font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-surface-400">
              No tools found for "{query}"
            </div>
          ) : (
            filtered.map((tool, i) => (
              <button
                key={tool.id}
                onMouseDown={() => select(tool.id)}
                onMouseEnter={() => setCursor(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  cursor === i
                    ? 'bg-primary-50 dark:bg-primary-900/30'
                    : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'
                } ${tool.id === activeTool ? 'opacity-60' : ''}`}
              >
                <span className={`transition-colors ${cursor === i ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400'}`}>
                  {tool.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${cursor === i ? 'text-primary-700 dark:text-primary-300' : 'text-surface-800 dark:text-surface-200'}`}>
                    {tool.name}
                  </div>
                  <div className="text-xs text-surface-400 dark:text-surface-500">{tool.description}</div>
                </div>
                {tool.category && (
                  <span className="text-[10px] text-surface-400 dark:text-surface-500 bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded-md font-medium">
                    {tool.category}
                  </span>
                )}
                {tool.id === activeTool && (
                  <span className="text-[10px] text-primary-500 font-semibold">active</span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-surface-200 dark:border-surface-700 flex items-center gap-4 text-[11px] text-surface-400">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>ESC close</span>
        </div>
      </div>
    </div>,
    document.body
  );
});
