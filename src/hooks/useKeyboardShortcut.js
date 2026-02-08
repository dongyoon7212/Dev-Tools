import { useEffect } from 'react';

export function useKeyboardShortcut(shortcuts) {
  useEffect(() => {
    if (!shortcuts || shortcuts.length === 0) return;

    const handler = (e) => {
      for (const s of shortcuts) {
        const ctrlMatch = s.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
        const shiftMatch = s.shift ? e.shiftKey : !e.shiftKey;
        const keyMatch = e.key.toLowerCase() === s.key.toLowerCase() ||
          (s.key === 'Enter' && e.key === 'Enter');

        if (ctrlMatch && shiftMatch && keyMatch) {
          e.preventDefault();
          s.handler();
          return;
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
