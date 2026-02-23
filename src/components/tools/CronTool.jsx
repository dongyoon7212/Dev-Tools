import { useState, useMemo, memo } from 'react';
import cronstrue from 'cronstrue';
import { parseExpression } from 'cron-parser';
import ErrorMessage from '../ErrorMessage';
import EmptyState from '../EmptyState';
import CopyButton from '../CopyButton';

const PRESETS = [
  { label: 'Every minute', cron: '* * * * *' },
  { label: 'Every hour', cron: '0 * * * *' },
  { label: 'Every day at midnight', cron: '0 0 * * *' },
  { label: 'Every Monday', cron: '0 0 * * 1' },
  { label: 'Every 1st of month', cron: '0 0 1 * *' },
  { label: 'Every 15 minutes', cron: '*/15 * * * *' },
  { label: 'Weekdays at 9am', cron: '0 9 * * 1-5' },
];

function getNextRuns(expression, n = 5) {
  try {
    const interval = parseExpression(expression);
    const dates = [];
    for (let i = 0; i < n; i++) {
      dates.push(interval.next().toDate());
    }
    return dates;
  } catch {
    return [];
  }
}

export default memo(function CronTool() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const result = useMemo(() => {
    setError('');
    if (!input.trim()) return null;
    try {
      const human = cronstrue.toString(input.trim(), { throwExceptionOnParseError: true });
      const nextRuns = getNextRuns(input.trim());
      return { human, nextRuns };
    } catch (e) {
      setError(e.toString().replace('Error: ', ''));
      return null;
    }
  }, [input]);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
          Cron Expression
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="* * * * *"
            className="flex-1 bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-lg font-mono focus:outline-none focus:border-primary-400 dark:focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 placeholder:text-surface-300 dark:placeholder:text-surface-600 text-surface-800 dark:text-surface-100 tracking-widest"
          />
          {input && <CopyButton text={input} />}
        </div>
        <div className="mt-2 grid grid-cols-5 text-center">
          {['Minute', 'Hour', 'Day', 'Month', 'Weekday'].map((f) => (
            <div key={f} className="text-[10px] text-surface-400 dark:text-surface-500 font-medium">{f}</div>
          ))}
        </div>
      </div>

      {/* Presets */}
      <div>
        <div className="text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest mb-2">Presets</div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(({ label, cron }) => (
            <button
              key={cron}
              onClick={() => setInput(cron)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                input === cron
                  ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 ring-1 ring-primary-300 dark:ring-primary-700'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      {result ? (
        <div className="space-y-5 card-pop">
          {/* Human readable */}
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl px-5 py-4">
            <div className="text-xs font-bold text-primary-500 dark:text-primary-400 uppercase tracking-widest mb-1">Meaning</div>
            <p className="text-base font-semibold text-primary-800 dark:text-primary-200">{result.human}</p>
          </div>

          {/* Next runs */}
          {result.nextRuns.length > 0 && (
            <div>
              <div className="text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest mb-3">Next 5 Executions</div>
              <div className="space-y-2">
                {result.nextRuns.map((date, i) => (
                  <div key={i} className="flex items-center gap-3 bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2.5">
                    <span className="text-xs font-bold text-surface-400 w-4">{i + 1}</span>
                    <span className="font-mono text-sm text-surface-700 dark:text-surface-200 flex-1">
                      {date.toLocaleString()}
                    </span>
                    <CopyButton text={date.toISOString()} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : !error && (
        <EmptyState
          title="Enter a cron expression to see its meaning"
          examples={['*/5 * * * * → Every 5 minutes', '0 9 * * 1-5 → Weekdays at 9am']}
        />
      )}
    </div>
  );
});
