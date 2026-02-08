export default function EmptyState({ title, examples }) {
  return (
    <div className="text-center py-8 px-6 bg-surface-50 dark:bg-surface-800/30 rounded-lg border border-dashed border-surface-300 dark:border-surface-700">
      <div className="text-surface-300 dark:text-surface-600 mb-3 flex justify-center">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <p className="text-sm text-surface-400 dark:text-surface-500 font-medium">{title}</p>
      {examples && examples.length > 0 && (
        <div className="mt-4 flex flex-col items-center gap-1.5">
          {examples.map((ex, i) => (
            <span
              key={i}
              className="text-xs font-mono text-surface-400 dark:text-surface-500 bg-surface-100 dark:bg-surface-800 rounded px-3 py-1.5"
            >
              {ex}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
