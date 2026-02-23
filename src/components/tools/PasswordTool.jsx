import { useState, useCallback, useMemo, memo } from 'react';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useToast } from '../../contexts/ToastContext';
import CopyButton from '../CopyButton';

const CHAR_SETS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
  ambiguous: 'l1IoO0',
};

function generatePassword(length, options) {
  let chars = '';
  if (options.upper) chars += CHAR_SETS.upper;
  if (options.lower) chars += CHAR_SETS.lower;
  if (options.digits) chars += CHAR_SETS.digits;
  if (options.symbols) chars += CHAR_SETS.symbols;
  if (options.excludeAmbiguous) {
    chars = chars.split('').filter(c => !CHAR_SETS.ambiguous.includes(c)).join('');
  }
  if (!chars) return '';

  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(n => chars[n % chars.length]).join('');
}

function calcStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 4) return { score, label: 'Fair', color: 'bg-amber-500' };
  if (score <= 5) return { score, label: 'Good', color: 'bg-yellow-400' };
  return { score, label: 'Strong', color: 'bg-green-500' };
}

export default memo(function PasswordTool() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({ upper: true, lower: true, digits: true, symbols: true, excludeAmbiguous: false });
  const [passwords, setPasswords] = useState([]);
  const [count, setCount] = useState(5);
  const { copy } = useCopyToClipboard();
  const { addToast } = useToast();

  const toggle = useCallback((key) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const generate = useCallback(() => {
    const list = Array.from({ length: count }, () => generatePassword(length, options)).filter(Boolean);
    setPasswords(list);
  }, [length, options, count]);

  const strength = useMemo(() => passwords.length ? calcStrength(passwords[0]) : null, [passwords]);

  return (
    <div className="space-y-6">
      {/* Length */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Length</label>
          <span className="text-lg font-bold font-mono text-primary-600 dark:text-primary-400 w-10 text-center">{length}</span>
        </div>
        <input
          type="range"
          min={4}
          max={128}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full h-2.5 rounded-full appearance-none cursor-pointer accent-primary-600 bg-surface-200 dark:bg-surface-700"
        />
        <div className="flex justify-between text-xs text-surface-400 mt-1">
          <span>4</span><span>32</span><span>64</span><span>128</span>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { key: 'upper', label: 'Uppercase (A-Z)' },
          { key: 'lower', label: 'Lowercase (a-z)' },
          { key: 'digits', label: 'Digits (0-9)' },
          { key: 'symbols', label: 'Symbols (!@#...)' },
          { key: 'excludeAmbiguous', label: 'Exclude Ambiguous' },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2.5 p-3 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-xl cursor-pointer select-none hover:border-primary-300 dark:hover:border-primary-700 transition-all">
            <input
              type="checkbox"
              checked={key === 'excludeAmbiguous' ? options.excludeAmbiguous : options[key]}
              onChange={() => toggle(key)}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
            />
            <span className="text-xs font-medium text-surface-600 dark:text-surface-400">{label}</span>
          </label>
        ))}
        <div className="flex items-center gap-2 p-3 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-xl">
          <span className="text-xs font-medium text-surface-600 dark:text-surface-400">Count</span>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="flex-1 bg-transparent text-xs font-semibold text-surface-700 dark:text-surface-300 focus:outline-none"
          >
            {[1, 3, 5, 10].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generate}
        className="w-full py-3 rounded-xl font-semibold text-sm bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.98] transition-all duration-200 shadow-sm shadow-primary-500/30"
      >
        Generate Passwords
      </button>

      {/* Results */}
      {passwords.length > 0 && (
        <div className="space-y-3 card-pop">
          {strength && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-surface-500 dark:text-surface-400">Strength</span>
              <div className="flex-1 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                  style={{ width: `${(strength.score / 7) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-bold ${
                strength.label === 'Strong' ? 'text-green-600 dark:text-green-400'
                : strength.label === 'Good' ? 'text-yellow-600 dark:text-yellow-400'
                : strength.label === 'Fair' ? 'text-amber-600 dark:text-amber-400'
                : 'text-red-600 dark:text-red-400'
              }`}>{strength.label}</span>
            </div>
          )}
          {passwords.map((pw, i) => (
            <div key={i} className="flex items-center gap-3 bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200">
              <code className="flex-1 text-sm font-mono text-surface-700 dark:text-surface-200 break-all select-all">{pw}</code>
              <CopyButton text={pw} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
