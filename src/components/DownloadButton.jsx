import { useCallback, memo } from 'react';

export default memo(function DownloadButton({ text, filename = 'output.txt', className = '' }) {
  const handleDownload = useCallback(() => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }, [text, filename]);

  if (!text) return null;

  return (
    <button
      onClick={handleDownload}
      title={`Download as ${filename}`}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
        transition-all duration-200 active:scale-95
        bg-surface-100 text-surface-600 hover:bg-surface-200
        dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700
        ${className}`}
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Save
    </button>
  );
});
