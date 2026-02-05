import { useState, useMemo } from 'react';
import { marked } from 'marked';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

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

export default function MarkdownTool() {
  const [input, setInput] = useState('');
  const { copied, copy } = useCopyToClipboard();

  const html = useMemo(() => {
    if (!input.trim()) return '';
    try {
      return marked.parse(input);
    } catch {
      return '<p class="text-red-500">Failed to parse markdown</p>';
    }
  }, [input]);

  const loadSample = () => setInput(SAMPLE_MD);

  const copyHtml = () => {
    if (html) copy(html);
  };

  return (
    <div className="space-y-3">
      {/* Guide */}
      <p className="text-xs text-surface-500 dark:text-surface-400">
        Write Markdown on the left and see the live preview on the right. Supports GitHub Flavored Markdown.
      </p>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <button
          onClick={loadSample}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700 transition-colors"
        >
          Load Sample
        </button>
        <button
          onClick={copyHtml}
          disabled={!html}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95 disabled:opacity-40 ${
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
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700 transition-colors disabled:opacity-40"
        >
          Clear
        </button>
      </div>

      {/* Split View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ minHeight: '400px' }}>
        {/* Editor */}
        <div className="flex flex-col">
          <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1.5">
            Editor
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write your markdown here..."
            className="flex-1 w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none placeholder:text-surface-400 dark:placeholder:text-surface-500"
            style={{ minHeight: '380px' }}
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col">
          <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1.5">
            Preview
          </label>
          <div
            className="flex-1 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg px-4 py-3 overflow-y-auto markdown-preview"
            style={{ minHeight: '380px' }}
            dangerouslySetInnerHTML={{ __html: html || '<span class="text-surface-400 dark:text-surface-500 text-sm">Preview will appear here...</span>' }}
          />
        </div>
      </div>
    </div>
  );
}
