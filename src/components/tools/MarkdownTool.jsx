import { useState, useMemo, useCallback, memo } from 'react';
import { marked } from 'marked';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useToast } from '../../contexts/ToastContext';
import EmptyState from '../EmptyState';
import ErrorMessage from '../ErrorMessage';

const SAMPLE_MD = `# Markdown Preview

## Features

This tool supports **bold**, *italic*, and ~~strikethrough~~ text.

### Lists

- Item one
- Item two
  - Nested item
- Item three

1. First
2. Second
3. Third

### Links & Images

[Visit GitHub](https://github.com)

### Code

Inline \`code\` and code blocks:

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Blockquote

> "The best way to predict the future is to invent it."
> — Alan Kay

### Table

| Feature | Status |
|---------|--------|
| Headings | Supported |
| Lists | Supported |
| Code blocks | Supported |
| Tables | Supported |

### Checkbox

- [x] Task completed
- [ ] Task pending
`;

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

export default memo(function MarkdownTool() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const { copied, copy } = useCopyToClipboard();
  const { addToast } = useToast();

  const html = useMemo(() => {
    if (!input.trim()) return '';
    try {
      setError('');
      return marked.parse(input);
    } catch (e) {
      setError('Failed to parse Markdown: ' + e.message);
      return '';
    }
  }, [input]);

  const loadSample = useCallback(() => setInput(SAMPLE_MD), []);

  const copyHtml = useCallback(() => {
    if (html) {
      copy(html);
      addToast('Copied HTML to clipboard!', 'success');
    }
  }, [html, copy, addToast]);

  const shortcuts = useMemo(() => [
    { key: 'c', ctrl: true, shift: true, handler: copyHtml },
  ], [copyHtml]);
  useKeyboardShortcut(shortcuts);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <button
          onClick={loadSample}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700 transition-all duration-200 active:scale-95"
        >
          Load Sample
        </button>
        <button
          onClick={copyHtml}
          disabled={!html}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 disabled:opacity-40 ${
            copied
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700'
          }`}
        >
          {copied ? 'Copied HTML!' : 'Copy HTML'}
        </button>
        <button
          onClick={() => setInput('')}
          disabled={!input}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700 transition-all duration-200 disabled:opacity-40 active:scale-95"
        >
          Clear
        </button>
        {input && (
          <span className="ml-auto text-xs text-surface-400 dark:text-surface-500">
            {input.length} chars
          </span>
        )}
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      {/* Split View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ minHeight: '500px' }}>
        {/* Editor */}
        <div className="flex flex-col">
          <label className="block text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-widest mb-2">
            Editor
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write your markdown here..."
            className="flex-1 w-full bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary-400 dark:focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 resize-none placeholder:text-surface-300 dark:placeholder:text-surface-600 text-surface-800 dark:text-surface-100"
            style={{ minHeight: '480px' }}
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col">
          <label className="block text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-widest mb-2">
            Preview
          </label>
          {html ? (
            <div
              className="flex-1 bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded-xl px-5 py-4 overflow-y-auto markdown-preview"
              style={{ minHeight: '480px' }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded-xl" style={{ minHeight: '480px' }}>
              <EmptyState
                title="Write Markdown to see the preview"
                examples={['Supports GitHub Flavored Markdown']}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
