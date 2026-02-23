import { useState, useEffect, lazy, Suspense } from 'react';
import { initGA, trackEvent, trackPageView } from './utils/analytics';

// Lazy load all tool components for code splitting
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

// Loading spinner component
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
      {
        id: 'base64',
        name: 'Base64',
        description: 'Encode / Decode',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
        ),
        component: Base64Tool,
      },
      {
        id: 'url',
        name: 'URL',
        description: 'Encode & Parse',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
        ),
        component: UrlEncoderTool,
      },
    ],
  },
  {
    name: 'Generators',
    tools: [
      {
        id: 'uuid',
        name: 'UUID',
        description: 'Generate UUIDs',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
          </svg>
        ),
        component: UuidTool,
      },
      {
        id: 'hash',
        name: 'Hash',
        description: 'Generate Hashes',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
          </svg>
        ),
        component: HashTool,
      },
    ],
  },
  {
    name: 'Formatters',
    tools: [
      {
        id: 'json',
        name: 'JSON',
        description: 'Format & Validate',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        ),
        component: JsonFormatterTool,
      },
      {
        id: 'timestamp',
        name: 'Timestamp',
        description: 'Convert & Format',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        component: TimestampTool,
      },
    ],
  },
  {
    name: 'Text Tools',
    tools: [
      {
        id: 'diff',
        name: 'Diff',
        description: 'Compare Texts',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
        ),
        component: DiffTool,
      },
      {
        id: 'case',
        name: 'Case',
        description: 'Convert Cases',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
          </svg>
        ),
        component: CaseTool,
      },
      {
        id: 'markdown',
        name: 'Markdown',
        description: 'Preview & Edit',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        ),
        component: MarkdownTool,
      },
    ],
  },
  {
    name: 'Development',
    tools: [
      {
        id: 'regex',
        name: 'Regex',
        description: 'Test & Match',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        ),
        component: RegexTool,
      },
      {
        id: 'color',
        name: 'Color',
        description: 'Pick & Convert',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
          </svg>
        ),
        component: ColorPickerTool,
      },
    ],
  },
];

// Flat tools list for lookup
const allTools = categories.flatMap((cat) => cat.tools);

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

export default function App() {
  const [activeTool, setActiveTool] = useState('base64');
  const [dark, setDark] = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ActiveComponent = allTools.find((t) => t.id === activeTool)?.component;
  const activeToolData = allTools.find((t) => t.id === activeTool);

  // Initialize GA on mount
  useEffect(() => {
    initGA();
    trackPageView('base64', 'Base64');
  }, []);

  const handleToolSwitch = (toolId) => {
    if (toolId === activeTool) { setSidebarOpen(false); return; }
    const tool = allTools.find((t) => t.id === toolId);
    setActiveTool(toolId);
    setSidebarOpen(false);
    trackEvent('tool_switch', { tool_name: tool?.name, tool_id: toolId });
    trackPageView(toolId, tool?.name);
  };

  const handleThemeToggle = () => {
    const newTheme = !dark;
    setDark(newTheme);
    trackEvent('theme_toggle', { theme: newTheme ? 'dark' : 'light' });
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 transition-colors">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-72 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
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
                <h1 className="text-sm font-bold text-surface-900 dark:text-white tracking-tight">DevTools</h1>
                <p className="text-xs text-surface-400 dark:text-surface-500">Mini Toolkit</p>
              </div>
            </div>
          </div>

          {/* Navigation with categories */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {categories.map((category) => (
              <div key={category.name} className="mb-5">
                <div className="px-3 mb-2">
                  <span className="text-[10px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest">
                    {category.name}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {category.tools.map((tool) => (
                    <button
                      key={tool.id}
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
                      <div>
                        <div className="text-sm font-semibold leading-tight">{tool.name}</div>
                        <div className="text-xs text-surface-400 dark:text-surface-500 leading-tight mt-0.5">{tool.description}</div>
                      </div>
                      {activeTool === tool.id && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Dark mode toggle */}
          <div className="px-4 py-4 border-t border-surface-200 dark:border-surface-800">
            <button
              onClick={handleThemeToggle}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-200 transition-all duration-200 group"
            >
              <span className="transition-transform duration-200 group-hover:scale-110">
                {dark ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
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
            <div className="ml-auto hidden sm:flex items-center gap-2 text-[11px] text-surface-400 dark:text-surface-500 font-mono">
              <kbd className="px-2 py-1 rounded-md bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400">Ctrl+Enter</kbd>
              <span className="text-surface-300 dark:text-surface-600">Action</span>
              <span className="mx-1 text-surface-200 dark:text-surface-700">·</span>
              <kbd className="px-2 py-1 rounded-md bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400">Ctrl+Shift+C</kbd>
              <span className="text-surface-300 dark:text-surface-600">Copy</span>
            </div>
          </div>
        </header>

        {/* Tool content */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10">
          <div
            key={activeTool}
            className="tool-fade-in bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 sm:p-8 shadow-sm"
          >
            <Suspense fallback={<LoadingSpinner />}>
              {ActiveComponent && <ActiveComponent />}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
