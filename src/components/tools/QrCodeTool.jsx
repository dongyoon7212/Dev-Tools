import { useState, useEffect, useRef, useCallback, memo } from 'react';
import QRCode from 'qrcode';
import { useDebounce } from '../../hooks/useDebounce';
import EmptyState from '../EmptyState';
import ErrorMessage from '../ErrorMessage';

export default memo(function QrCodeTool() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [color, setColor] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [size, setSize] = useState(300);
  const [errorLevel, setErrorLevel] = useState('M');
  const canvasRef = useRef(null);
  const debouncedInput = useDebounce(input, 300);

  useEffect(() => {
    if (!debouncedInput.trim()) { setError(''); return; }
    setError('');
    QRCode.toCanvas(canvasRef.current, debouncedInput.trim(), {
      width: size,
      margin: 2,
      color: { dark: color, light: bg },
      errorCorrectionLevel: errorLevel,
    }).catch((err) => setError(err.message));
  }, [debouncedInput, color, bg, size, errorLevel]);

  const download = useCallback(() => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  }, []);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
          Content
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter URL, text, or any data to encode as QR..."
          className="w-full h-36 bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary-400 dark:focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 resize-none placeholder:text-surface-300 dark:placeholder:text-surface-600 text-surface-800 dark:text-surface-100"
        />
        {input && (
          <div className="mt-1 text-xs text-surface-400">{input.length} characters</div>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1.5">QR Color</label>
          <div className="flex items-center gap-2 p-2 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-xl">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" />
            <span className="text-xs font-mono text-surface-600 dark:text-surface-400">{color}</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1.5">Background</label>
          <div className="flex items-center gap-2 p-2 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-xl">
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" />
            <span className="text-xs font-mono text-surface-600 dark:text-surface-400">{bg}</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1.5">Size (px)</label>
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl text-sm bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {[200, 300, 400, 512].map(s => <option key={s} value={s}>{s}×{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1.5">Error Level</label>
          <select
            value={errorLevel}
            onChange={(e) => setErrorLevel(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {['L', 'M', 'Q', 'H'].map(l => <option key={l} value={l}>{l} — {l === 'L' ? '7%' : l === 'M' ? '15%' : l === 'Q' ? '25%' : '30%'}</option>)}
          </select>
        </div>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      {/* QR Canvas */}
      <div className="flex flex-col items-center gap-4">
        <div className={`transition-all duration-300 ${!debouncedInput ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <canvas
            ref={canvasRef}
            className="rounded-2xl border-2 border-surface-200 dark:border-surface-700 shadow-lg"
          />
        </div>

        {!debouncedInput && (
          <EmptyState
            title="Enter content to generate a QR code"
            examples={['Works with URLs, text, email, phone numbers']}
          />
        )}

        {debouncedInput && !error && (
          <button
            onClick={download}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-primary-600 text-white hover:bg-primary-700 active:scale-95 transition-all duration-200 shadow-sm shadow-primary-500/30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PNG
          </button>
        )}
      </div>
    </div>
  );
});
