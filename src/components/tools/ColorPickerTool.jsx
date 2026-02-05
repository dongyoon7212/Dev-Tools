import { useState, useEffect, useCallback } from 'react';
import CopyButton from '../CopyButton';

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  if (clean.length !== 6 && clean.length !== 3) return null;
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  const num = parseInt(full, 16);
  if (isNaN(num)) return null;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

function rgbToHsl({ r, g, b }) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  switch (max) {
    case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
    case gn: h = ((bn - rn) / d + 2) / 6; break;
    default: h = ((rn - gn) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb({ h, s, l }) {
  const sn = s / 100, ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let rn, gn, bn;
  if (h < 60) { rn = c; gn = x; bn = 0; }
  else if (h < 120) { rn = x; gn = c; bn = 0; }
  else if (h < 180) { rn = 0; gn = c; bn = x; }
  else if (h < 240) { rn = 0; gn = x; bn = c; }
  else if (h < 300) { rn = x; gn = 0; bn = c; }
  else { rn = c; gn = 0; bn = x; }
  return {
    r: Math.round((rn + m) * 255),
    g: Math.round((gn + m) * 255),
    b: Math.round((bn + m) * 255),
  };
}

export default function ColorPickerTool() {
  const [hex, setHex] = useState('#3b82f6');
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });
  const [hexInput, setHexInput] = useState('#3b82f6');

  const updateFromRgb = useCallback((newRgb) => {
    setRgb(newRgb);
    setHex(rgbToHex(newRgb));
    setHexInput(rgbToHex(newRgb));
    setHsl(rgbToHsl(newRgb));
  }, []);

  const updateFromHex = useCallback((newHex) => {
    const parsed = hexToRgb(newHex);
    if (parsed) {
      setHex(newHex.startsWith('#') ? newHex : '#' + newHex);
      setRgb(parsed);
      setHsl(rgbToHsl(parsed));
    }
  }, []);

  const updateFromHsl = useCallback((newHsl) => {
    setHsl(newHsl);
    const newRgb = hslToRgb(newHsl);
    setRgb(newRgb);
    const newHex = rgbToHex(newRgb);
    setHex(newHex);
    setHexInput(newHex);
  }, []);

  useEffect(() => {
    setHexInput(hex);
  }, [hex]);

  const handleHexBlur = () => {
    const clean = hexInput.replace('#', '');
    if (/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(clean)) {
      updateFromHex('#' + (clean.length === 3 ? clean.split('').map(c => c+c).join('') : clean));
    } else {
      setHexInput(hex);
    }
  };

  const hexStr = hex.toUpperCase();
  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  return (
    <div className="space-y-5">
      {/* Color Preview */}
      <div className="flex items-stretch gap-4">
        <div
          className="w-28 h-28 rounded-xl border-2 border-surface-200 dark:border-surface-600 shadow-inner shrink-0"
          style={{ backgroundColor: hex }}
        />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-surface-500 dark:text-surface-400 w-8">HEX</span>
            <span className="font-mono text-sm text-surface-700 dark:text-surface-300">{hexStr}</span>
            <CopyButton text={hexStr} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-surface-500 dark:text-surface-400 w-8">RGB</span>
            <span className="font-mono text-sm text-surface-700 dark:text-surface-300">{rgbStr}</span>
            <CopyButton text={rgbStr} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-surface-500 dark:text-surface-400 w-8">HSL</span>
            <span className="font-mono text-sm text-surface-700 dark:text-surface-300">{hslStr}</span>
            <CopyButton text={hslStr} />
          </div>
        </div>
      </div>

      {/* Color Picker Input */}
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={hex}
          onChange={(e) => updateFromHex(e.target.value)}
          className="w-12 h-10 rounded-lg border border-surface-300 dark:border-surface-600 cursor-pointer bg-transparent"
        />
        <div className="flex-1">
          <label className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">HEX</label>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            onBlur={handleHexBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleHexBlur()}
            className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* RGB Sliders */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">RGB</h4>
        {[
          { label: 'R', key: 'r', color: 'accent-red-500' },
          { label: 'G', key: 'g', color: 'accent-green-500' },
          { label: 'B', key: 'b', color: 'accent-blue-500' },
        ].map(({ label, key, color }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xs font-mono text-surface-500 w-4">{label}</span>
            <input
              type="range"
              min="0"
              max="255"
              value={rgb[key]}
              onChange={(e) => updateFromRgb({ ...rgb, [key]: Number(e.target.value) })}
              className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer ${color} bg-surface-200 dark:bg-surface-700`}
            />
            <input
              type="number"
              min="0"
              max="255"
              value={rgb[key]}
              onChange={(e) => updateFromRgb({ ...rgb, [key]: Math.min(255, Math.max(0, Number(e.target.value))) })}
              className="w-16 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-2 py-1 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        ))}
      </div>

      {/* HSL Sliders */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">HSL</h4>
        {[
          { label: 'H', key: 'h', max: 360, suffix: '°' },
          { label: 'S', key: 's', max: 100, suffix: '%' },
          { label: 'L', key: 'l', max: 100, suffix: '%' },
        ].map(({ label, key, max, suffix }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xs font-mono text-surface-500 w-4">{label}</span>
            <input
              type="range"
              min="0"
              max={max}
              value={hsl[key]}
              onChange={(e) => updateFromHsl({ ...hsl, [key]: Number(e.target.value) })}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-surface-200 dark:bg-surface-700"
            />
            <div className="w-16 flex items-center">
              <input
                type="number"
                min="0"
                max={max}
                value={hsl[key]}
                onChange={(e) => updateFromHsl({ ...hsl, [key]: Math.min(max, Math.max(0, Number(e.target.value))) })}
                className="w-12 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-2 py-1 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-xs text-surface-400 ml-0.5">{suffix}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
