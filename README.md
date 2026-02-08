<div align="center">

<!-- PROJECT LOGO -->
<br />
<img src="public/favicon.svg" alt="DevTools Logo" width="80" height="80">

# DevTools

**A fast, free, and privacy-focused toolkit for developers.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/dongyoon7212/Dev-Tools)

[Live Demo](https://dev-tools-dongyoon.vercel.app) · [Report Bug](https://github.com/dongyoon7212/Dev-Tools/issues) · [Request Feature](https://github.com/dongyoon7212/Dev-Tools/issues)

---

<!-- SCREENSHOT -->
<!-- Replace the path below with an actual screenshot or GIF of the app -->
<!-- <img src="docs/screenshot.png" alt="DevTools Screenshot" width="800"> -->

</div>

## Why DevTools?

Most online developer utilities are bloated with ads, require sign-ups, or send your data to remote servers. **DevTools** is the alternative you have been looking for:

- **The problem** — Existing tools are slow, ad-heavy, and raise privacy concerns.
- **The solution** — A fast, lightweight, and completely client-side toolkit that never leaves your browser.
- **Built for developers, by developers.**

---

## Features

- ✨ **No ads, completely free** — Use every tool without interruptions
- 🚀 **Fast and lightweight** — Code-split and lazy-loaded for instant startup
- 🎨 **Dark mode support** — Automatic system detection with manual toggle
- 📱 **Fully responsive** — Works on desktop, tablet, and mobile
- 🔒 **Privacy-focused** — All processing happens client-side, zero data sent to servers
- ⚡ **PWA ready** — Install as a native app and use offline
- 📋 **One-click copy** — Copy any output to your clipboard instantly

---

## Tools

### Encoders & Decoders

| Tool | Description |
| --- | --- |
| **Base64 Encoder/Decoder** | Encode and decode text with Base64. Swap input/output in one click. |
| **URL Encoder/Decoder** | Encode and decode URLs with a built-in query string parser. |

### Text Tools

| Tool | Description |
| --- | --- |
| **Diff Checker** | Compare two blocks of text line by line. Side-by-side and inline views with options to ignore case and whitespace. |
| **Case Converter** | Convert between 8 formats — camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, and more. |
| **Markdown Preview** | Edit Markdown with a real-time preview. Full GFM support with HTML export. |

### Generators

| Tool | Description |
| --- | --- |
| **UUID Generator** | Generate UUID v4 identifiers in bulk (1, 5, or 10 at a time) with case and hyphen options. |
| **Hash Generator** | Compute MD5, SHA-1, SHA-256, and SHA-512 hashes simultaneously. |

### Formatters & Validators

| Tool | Description |
| --- | --- |
| **JSON Formatter** | Beautify or minify JSON with configurable indentation and real-time validation. |
| **Timestamp Converter** | Convert between Unix timestamps and human-readable dates. Supports timezones and multiple units. |

### Development Tools

| Tool | Description |
| --- | --- |
| **Regex Tester** | Test regular expressions with flag toggles, match highlighting, and capture group display. |
| **Color Picker** | Pick colors and convert between HEX, RGB, and HSL with interactive sliders. |

---

## Privacy First

Your data never leaves your browser. DevTools processes everything on the client side — no server calls, no tracking, no cookies, and no account required. Close the tab and your data is gone.

---

## Live Demo

Try it now — **[dev-tools-dongyoon.vercel.app](https://dev-tools-dongyoon.vercel.app)**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dongyoon7212/Dev-Tools)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/dongyoon7212/Dev-Tools)

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | [React 19](https://react.dev) |
| **Build Tool** | [Vite 7](https://vite.dev) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com) |
| **Deployment** | [Vercel](https://vercel.com) / [Netlify](https://netlify.com) |

**Key libraries:**

- [`uuid`](https://www.npmjs.com/package/uuid) — UUID v4 generation
- [`crypto-js`](https://www.npmjs.com/package/crypto-js) — Hash algorithms (MD5, SHA-1, SHA-256, SHA-512)
- [`diff`](https://www.npmjs.com/package/diff) — Text comparison engine
- [`change-case`](https://www.npmjs.com/package/change-case) — Case transformation
- [`marked`](https://www.npmjs.com/package/marked) — Markdown parsing with GFM support

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18 or later
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/dongyoon7212/Dev-Tools.git

# Navigate to the directory
cd Dev-Tools

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
# Create an optimized build
npm run build

# Preview the production build locally
npm run preview
```

---

## Project Structure

```
src/
├── App.jsx                          # Main app — routing, sidebar, lazy loading
├── main.jsx                         # Entry point
├── index.css                        # Global styles and Tailwind theme
├── components/
│   ├── CopyButton.jsx               # Reusable copy-to-clipboard button
│   └── tools/
│       ├── Base64Tool.jsx           # Base64 encoder/decoder
│       ├── UrlEncoderTool.jsx       # URL encoder/decoder
│       ├── UuidTool.jsx             # UUID generator
│       ├── HashTool.jsx             # Hash generator
│       ├── JsonFormatterTool.jsx    # JSON formatter & validator
│       ├── TimestampTool.jsx        # Timestamp converter
│       ├── DiffTool.jsx             # Diff checker
│       ├── CaseTool.jsx             # Case converter
│       ├── MarkdownTool.jsx         # Markdown editor & preview
│       ├── RegexTool.jsx            # Regex tester
│       └── ColorPickerTool.jsx      # Color picker & converter
└── hooks/
    ├── useDebounce.js               # Input debouncing hook
    └── useCopyToClipboard.js        # Clipboard copy hook

public/
├── favicon.svg                      # SVG favicon
├── manifest.json                    # PWA manifest
├── sw.js                            # Service Worker
├── robots.txt                       # Crawler configuration
├── sitemap.xml                      # Sitemap
└── icons/                           # PWA icons
```

---

## Contributing

Contributions are what make the open-source community great. Any contribution you make is **greatly appreciated**.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Ways to Contribute

- **Report bugs** — Open an [issue](https://github.com/dongyoon7212/Dev-Tools/issues) with steps to reproduce
- **Request features** — Describe the tool or enhancement you would like to see
- **Submit PRs** — Fix a bug, improve docs, or add a new tool
- **Spread the word** — Star the repo and share it with fellow developers

---

## Roadmap

- [ ] Add Word Counter tool
- [ ] Add SQL Formatter tool
- [ ] Add JWT Decoder tool
- [ ] Add Lorem Ipsum Generator
- [ ] Add keyboard shortcuts for power users
- [ ] Add history and favorites
- [ ] Add export/import settings
- [ ] Multi-language support (i18n)

Check the [open issues](https://github.com/dongyoon7212/Dev-Tools/issues) for the full list of proposed features and known issues.

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

## Author

**dongyoon7212**

- GitHub: [@dongyoon7212](https://github.com/dongyoon7212)

---

## Acknowledgments

- [React](https://react.dev) — UI library
- [Vite](https://vite.dev) — Next-generation build tool
- [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS framework
- [Vercel](https://vercel.com) — Deployment and hosting
- [crypto-js](https://github.com/brix/crypto-js) — Cryptographic algorithms
- [jsdiff](https://github.com/kpdecker/jsdiff) — Text diff implementation
- [marked](https://github.com/markedjs/marked) — Markdown parser
- [Shields.io](https://shields.io) — Badges

---

<div align="center">

If you find this project useful, consider giving it a star.

[![Star this repo](https://img.shields.io/github/stars/dongyoon7212/Dev-Tools?style=social)](https://github.com/dongyoon7212/Dev-Tools)

</div>
