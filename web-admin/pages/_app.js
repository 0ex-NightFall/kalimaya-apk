import { LocaleProvider } from '../lib/i18n';

export default function App({ Component, pageProps }) {
  return (
    <LocaleProvider>
      <style jsx global>{`
        :root {
          --bg: #f5f7fb;
          --card: #ffffff;
          --text: #0f172a;
          --sub: #64748b;
          --bd: #e2e8f0;
          --pri: #6366f1;
          --font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          --mono: 'JetBrains Mono', 'Courier New', monospace;
        }
        * { box-sizing: border-box; }
        html, body {
          margin: 0; padding: 0;
          background: var(--bg);
          color: var(--text);
          font-family: var(--font);
          font-size: 15px;
          line-height: 1.5;
          letter-spacing: -0.01em;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          transition: background .2s, color .2s;
        }
        a { color: inherit; }
        input, select, textarea, button { font-family: var(--font); letter-spacing: -0.01em; }
        code, pre, .mono { font-family: var(--mono); }
        h1, h2, h3, h4 { letter-spacing: -0.03em; font-weight: 700; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: var(--bd); border-radius: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }

        /* Mobile responsive */
        @media (max-width: 767px) {
          h1 { font-size: 20px !important; }
          h2 { font-size: 17px !important; }
          h3 { font-size: 15px !important; }

          /* Force single column grids on mobile */
          [style*="grid-template-columns: 1fr 1fr"],
          [style*="grid-template-columns: repeat(auto-fit"],
          [style*="grid-template-columns: repeat(auto-fill"] {
            grid-template-columns: 1fr !important;
          }

          /* Full width buttons on mobile */
          [style*="display: flex"][style*="gap"] > button,
          [style*="display: flex"][style*="gap"] > a {
            flex: 1;
          }

          /* Audit log table scroll */
          [style*="grid-template-columns: 160px"] {
            grid-template-columns: 100px 80px 100px 1fr !important;
            font-size: 11px !important;
          }
        }
      `}</style>
      <Component {...pageProps} />
    </LocaleProvider>
  );
}
