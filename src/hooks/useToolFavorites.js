import { useState, useCallback } from 'react';

const STORAGE_KEY = 'devtools-favorites';

function loadFavorites() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function useToolFavorites() {
  const [favorites, setFavorites] = useState(loadFavorites);

  const toggleFavorite = useCallback((toolId) => {
    setFavorites((prev) => {
      const next = prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback((toolId) => favorites.includes(toolId), [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}
