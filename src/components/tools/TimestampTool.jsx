import { useState, useEffect } from 'react';
import CopyButton from '../CopyButton';

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export default function TimestampTool() {
  const [currentTimestamp, setCurrentTimestamp] = useState(Math.floor(Date.now() / 1000));
  const [inputTimestamp, setInputTimestamp] = useState('');
  const [inputDate, setInputDate] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [unit, setUnit] = useState('seconds');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timestampToDate = (ts) => {
    if (!ts) return '';
    try {
      const ms = unit === 'seconds' ? Number(ts) * 1000 : Number(ts);
      const date = new Date(ms);
      if (isNaN(date.getTime())) return 'Invalid timestamp';
      return date.toLocaleString('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'short',
      });
    } catch {
      return 'Invalid timestamp';
    }
  };

  const dateToTimestamp = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid date';
      const ts = Math.floor(date.getTime() / 1000);
      return unit === 'seconds' ? ts.toString() : (ts * 1000).toString();
    } catch {
      return 'Invalid date';
    }
  };

  const isoString = (ts) => {
    if (!ts) return '';
    try {
      const ms = unit === 'seconds' ? Number(ts) * 1000 : Number(ts);
      return new Date(ms).toISOString();
    } catch {
      return '';
    }
  };

  const relativeTime = (ts) => {
    if (!ts) return '';
    try {
      const ms = unit === 'seconds' ? Number(ts) * 1000 : Number(ts);
      const diff = Date.now() - ms;
      const absDiff = Math.abs(diff);
      const future = diff < 0;
      const prefix = future ? 'in ' : '';
      const suffix = future ? '' : ' ago';
      if (absDiff < 60000) return `${prefix}${Math.floor(absDiff / 1000)}s${suffix}`;
      if (absDiff < 3600000) return `${prefix}${Math.floor(absDiff / 60000)}m${suffix}`;
      if (absDiff < 86400000) return `${prefix}${Math.floor(absDiff / 3600000)}h${suffix}`;
      return `${prefix}${Math.floor(absDiff / 86400000)}d${suffix}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-5">
      {/* Current time */}
      <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 dark:from-primary-500/20 dark:to-primary-600/20 rounded-xl p-4 border border-primary-200 dark:border-primary-800">
        <div className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">
          Current Unix Timestamp
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-mono font-bold text-primary-700 dark:text-primary-300">
            {currentTimestamp}
          </span>
          <CopyButton text={currentTimestamp.toString()} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="seconds">Seconds</option>
          <option value="milliseconds">Milliseconds</option>
        </select>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Timestamp → Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
            Timestamp → Date
          </label>
          <input
            type="text"
            value={inputTimestamp}
            onChange={(e) => setInputTimestamp(e.target.value)}
            placeholder={`e.g. ${currentTimestamp}`}
            className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-surface-400 dark:placeholder:text-surface-500"
          />
          {inputTimestamp && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-surface-700 dark:text-surface-300 font-mono">
                  {timestampToDate(inputTimestamp)}
                </span>
                <CopyButton text={timestampToDate(inputTimestamp)} />
              </div>
              {isoString(inputTimestamp) && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-surface-500 font-mono">
                    ISO: {isoString(inputTimestamp)}
                  </span>
                  <CopyButton text={isoString(inputTimestamp)} />
                </div>
              )}
              <div className="text-xs text-surface-400">{relativeTime(inputTimestamp)}</div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
            Date → Timestamp
          </label>
          <input
            type="datetime-local"
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
            className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {inputDate && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-surface-700 dark:text-surface-300 font-mono">
                {dateToTimestamp(inputDate)}
              </span>
              <CopyButton text={dateToTimestamp(inputDate)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
