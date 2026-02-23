import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { initGA, trackEvent, trackPageView } from './utils/analytics';
import { useToolFavorites } from './hooks/useToolFavorites';
import CommandPalette from './components/CommandPalette';

// Lazy load all tool components
const Base64Tool = lazy(() => import('./components/tools/Base64Tool'));
const JsonFormatterTool = lazy(() => import('./components/tools/JsonFormatterTool'));
const TimestampTool = lazy(() => import('./components/tools/TimestampTool'));
const UrlEncoderTool = lazy(() => import('./components/tools/UrlEncoderTool'));
const RegexTool = lazy(() => import('./components/tools/RegexTool'));
const ColorPickerTool = lazy(() => import('./components/tools/ColorPickerTool'));
const UuidTool = lazy(() => import('./components/tools/UuidTool'));
const HashTool = lazy(() => import('./components/tools/HashTool'));
const DiffTool = lazy(() => import('./components/tools/DiffTool'));
const CaseTool = lazy(() => import('./components/tools/CaseTool'));
const MarkdownTool = lazy(() => import('./components/tools/MarkdownTool'));
const JwtTool = lazy(() => import('./components/tools/JwtTool'));
const YamlJsonTool = lazy(() => import('./components/tools/YamlJsonTool'));
const NumberBaseTool = lazy(() => import('./components/tools/NumberBaseTool'));
const HtmlEncoderTool = lazy(() => import('./components/tools/HtmlEncoderTool'));
const PasswordTool = lazy(() => import('./components/tools/PasswordTool'));
const CronTool = lazy(() => import('./components/tools/CronTool'));
const QrCodeTool = lazy(() => import('./components/tools/QrCodeTool'));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent" />
        <span className="text-sm text-surface-400">Loading tool...</span>
      </div>
    </div>
  );
}

const categories = [
  {
    name: 'Encoders / Decoders',
    tools: [
      { id: 'base64', name: 'Base64', description: 'Encode / Decode', component: Base64Tool, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg> },
      { id: 'url', name: 'URL', description: 'Encode & Parse', component: UrlEncoderTool, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg> },
      { id: 'html', name: 'HTML Entities', description: 'Encode & Decode', component: HtmlEncoderTool, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25" /></svg> },
      { id: 'jwt', name: 'JWT', description: 'Decode & Inspect', component: JwtTool, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg> },
    ],
  },
  {
    name: 'Generators',
    tools: [
      { id: 'uuid', name: 'UUID', description: 'Generate UUIDs', component: UuidTool, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" /></svg> },
      { id: 'hash', name: 'Hash', description: 'Generate Hashes', component: HashTool, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" /></svg> },
      { id: 'password', name: 'Password', description: 'Secure Generator', component: PasswordTool, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg> },
      { id: 'qr', name: 'QR Code', description: 'Generate QR', component: QrCodeTool, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 18.75h.75v.75h-.75v-.75zM18.75 13.5h.75v.75h-.75v-.75zM18.75 18.75h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" /></svg> },
    ],
  },
  {
    name: 'Formatters',
    tools: [
      { id: 'json', name: 'JSON', description: 'Format & Validate', component: JsonFormatterTool, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> },
      { id: 'yaml', name: 'YAML ↔ JSON', description: 'Convert Formats', component: YamlJsonTool, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg> },
      { id: 'timestamp', name: 'Timestamp', description: 'Convert & Format', component: TimestampTool, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
      { id: 'cron', name: 'Cron', description: 'Parse Expressions', component: CronTool, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    ],
  },
  {
    name: 'Text Tools',
    tools: [
      { id: 'diff', name: 'Diff', description: 'Compare Texts', component: DiffTool, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg> },
      { id: 'case', name: 'Case', description: 'Convert Cases', component: CaseTool, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" /></svg> },
      { id: 'markdown', name: 'Markdown', description: 'Preview & Edit', component: MarkdownTool, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> },
    ],
  },
  {
    name: 'Development',
    tools: [
      { id: 'regex', name: 'Regex', description: 'Test & Match', component: RegexTool, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg> },
      { id: 'number', name: 'Number Base', description: 'BIN / OCT / HEX', component: NumberBaseTool, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.616 4.5 4.709v.051l-.005 1.174.002.009A67.14 67.14 0 004.5 6v3.045m8.25-4.5v5.402l3.119 3.119-1.591 1.591-3.119-3.119H12A.75.75 0 0112 12V6.546c0-.414.336-.75.75-.75h.75l2.625 2.625M12 9.75a.75.75 0 110 1.5.75.75 0 010-1.5z" /></svg> },
      { id: 'color', name: 'Color', description: 'Pick & Convert', component: ColorPickerTool, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" /></svg> },
    ],
  },
];

// Flat list with category info for command palette
const allTools = categories.flatMap((cat) =>
  cat.tools.map((t) => ({ ...t, category: cat.name }))
);

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('devtools-dark');
      if (stored !== null) return stored === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('devtools-dark', dark);
  }, [dark]);
  return [dark, setDark];
}

function getInitialTool() {
  const hash = window.location.hash.slice(1);
  if (hash && allTools.find((t) => t.id === hash)) return hash;
  return 'base64';
}

export default function App() {
  const [activeTool, setActiveTool] = useState(getInitialTool);
  const [dark, setDark] = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { favorites, toggleFavorite, isFavorite } = useToolFavorites();

  const ActiveComponent = allTools.find((t) => t.id === activeTool)?.component;
  const activeToolData = allTools.find((t) => t.id === activeTool);

  useEffect(() => {
    initGA();
    trackPageView(activeTool, activeToolData?.name);
  }, []);

  // Sync URL hash
  useEffect(() => {
    window.location.hash = activeTool;
  }, [activeTool]);

  const handleToolSwitch = useCallback((toolId) => {
    if (toolId === activeTool) { setSidebarOpen(false); return; }
    const tool = allTools.find((t) => t.id === toolId);
    setActiveTool(toolId);
    setSidebarOpen(false);
    trackEvent('tool_switch', { tool_name: tool?.name, tool_id: toolId });
    trackPageView(toolId, tool?.name);
  }, [activeTool]);

  const handleThemeToggle = useCallback(() => {
    const newTheme = !dark;
    setDark(newTheme);
    trackEvent('theme_toggle', { theme: newTheme ? 'dark' : 'light' });
  }, [dark, setDark]);

  // Ctrl+K / Cmd+K opens command palette
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Share link via URL hash
  const shareLink = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}#${activeTool}`;
    navigator.clipboard.writeText(url).catch(() => {});
    // Small toast-like feedback via title flicker — using existing toast would need prop drilling
    const orig = document.title;
    document.title = '✓ Link copied!';
    setTimeout(() => { document.title = orig; }, 1500);
  }, [activeTool]);

  // Favorites section: tools pinned by user
  const favoritedTools = allTools.filter((t) => isFavorite(t.id));

  const NavItem = ({ tool }) => (
    <button
      onClick={() => handleToolSwitch(tool.id)}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group ${
        activeTool === tool.id
          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
          : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-200'
      }`}
    >
      <span className={`transition-transform duration-200 group-hover:scale-110 ${activeTool === tool.id ? 'text-primary-600 dark:text-primary-400' : ''}`}>
        {tool.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold leading-tight truncate">{tool.name}</div>
        <div className="text-xs text-surface-400 dark:text-surface-500 leading-tight mt-0.5 truncate">{tool.description}</div>
      </div>
      <div className="flex items-center gap-1">
        {activeTool === tool.id && <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(tool.id); }}
          className={`p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${
            isFavorite(tool.id) ? '!opacity-100 text-amber-500' : 'text-surface-300 dark:text-surface-600 hover:text-amber-400'
          }`}
          title={isFavorite(tool.id) ? 'Unpin' : 'Pin to favorites'}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={isFavorite(tool.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </button>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 transition-colors">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Command Palette */}
      {paletteOpen && (
        <CommandPalette
          tools={allTools}
          activeTool={activeTool}
          onSelect={handleToolSwitch}
          onClose={() => setPaletteOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen w-72 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-surface-200 dark:border-surface-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/30">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.049.58.025 1.194-.14 1.743" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-bold text-surface-900 dark:text-white">DevTools</h1>
                <p className="text-xs text-surface-400 dark:text-surface-500">Mini Toolkit</p>
              </div>
            </div>
          </div>

          {/* Search shortcut */}
          <div className="px-4 pt-3 pb-1">
            <button
              onClick={() => setPaletteOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-400 dark:text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span className="flex-1 text-left text-xs">Search tools...</span>
              <kbd className="text-[10px] bg-surface-200 dark:bg-surface-700 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-2 px-3">
            {/* Favorites section */}
            {favoritedTools.length > 0 && (
              <div className="mb-4">
                <div className="px-3 mb-1">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Pinned</span>
                </div>
                <div className="space-y-0.5">
                  {favoritedTools.map((tool) => <NavItem key={tool.id} tool={tool} />)}
                </div>
              </div>
            )}

            {/* All categories */}
            {categories.map((category) => (
              <div key={category.name} className="mb-4">
                <div className="px-3 mb-1">
                  <span className="text-[10px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest">
                    {category.name}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {category.tools.map((tool) => <NavItem key={tool.id} tool={tool} />)}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom bar */}
          <div className="px-4 py-3 border-t border-surface-200 dark:border-surface-800 space-y-1">
            <button
              onClick={handleThemeToggle}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-200 transition-all duration-200 group"
            >
              <span className="transition-transform duration-200 group-hover:scale-110">
                {dark ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
                )}
              </span>
              <span className="font-medium">{dark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-72 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/90 dark:bg-surface-900/90 backdrop-blur-md border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-4 px-5 py-4 sm:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div>
              <h2 className="text-lg font-bold text-surface-900 dark:text-white leading-tight">
                {activeToolData?.name}
              </h2>
              <p className="text-xs text-surface-400 dark:text-surface-500">
                {activeToolData?.description}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              {/* Share button */}
              <button
                onClick={shareLink}
                title="Copy link to this tool"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
                Share
              </button>
              {/* Keyboard hints */}
              <div className="hidden md:flex items-center gap-2 text-[11px] text-surface-400 dark:text-surface-500 font-mono">
                <kbd className="px-2 py-1 rounded-md bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">⌘K</kbd>
                <span className="text-surface-300 dark:text-surface-600">Search</span>
                <span className="mx-1 text-surface-200 dark:text-surface-700">·</span>
                <kbd className="px-2 py-1 rounded-md bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">Ctrl+↵</kbd>
                <span className="text-surface-300 dark:text-surface-600">Action</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tool content */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10">
          <div key={activeTool} className="tool-fade-in bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 sm:p-8 shadow-sm">
            <Suspense fallback={<LoadingSpinner />}>
              {ActiveComponent && <ActiveComponent />}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
