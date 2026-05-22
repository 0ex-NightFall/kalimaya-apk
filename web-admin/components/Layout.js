import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLocale, t } from '../lib/i18n';

const NAV_BASE = [
  { key: 'dashboard', href: '/', icon: '🏠' },
  { key: 'announcements', href: '/announcements', icon: '📢' },
  { key: 'projects', href: '/projects', icon: '📁' },
  { key: 'files', href: '/files', icon: '📄' },
  { key: 'attendance', href: '/attendance', icon: '📍' },
  { key: 'employees', href: '/employees', icon: '👥' },
];

const NAV_ADMIN = [
  { key: 'auditLog', href: '/audit', icon: '🔍' },
];

export default function Layout({ children, title }) {
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const [user, setUser] = useState(null);
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [announceCount, setAnnounceCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') setDark(true);
    const savedOpen = localStorage.getItem('sidebar');
    if (savedOpen === 'closed') setOpen(false);
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    const tok = localStorage.getItem('token');
    if (tok) {
      fetch('/api/announcements', { headers: { Authorization: `Bearer ${tok}` } })
        .then(r => r.ok ? r.json() : [])
        .then(d => setAnnounceCount(Array.isArray(d) ? d.length : 0))
        .catch(() => {});
    }
    function checkMobile() { setMobile(window.innerWidth < 768); }
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--bg', dark ? '#0a0a0f' : '#f5f7fb');
    document.documentElement.style.setProperty('--card', dark ? '#161620' : '#ffffff');
    document.documentElement.style.setProperty('--text', dark ? '#fafafa' : '#0f172a');
    document.documentElement.style.setProperty('--sub', dark ? '#a1a1aa' : '#64748b');
    document.documentElement.style.setProperty('--bd', dark ? '#27272a' : '#e2e8f0');
    document.documentElement.style.setProperty('--pri', '#6366f1');
    document.body.style.background = dark ? '#0a0a0f' : '#f5f7fb';
    document.body.style.color = dark ? '#fafafa' : '#0f172a';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  function toggleSidebar() {
    const next = !open;
    setOpen(next);
    localStorage.setItem('sidebar', next ? 'open' : 'closed');
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.replace('/login');
  }

  const isAdmin = user?.roles?.some(r => ['DIRECTOR', 'ADMIN_IT'].includes(r));
  const navItems = isAdmin ? [...NAV_BASE, ...NAV_ADMIN] : NAV_BASE;

  // Mobile: bottom nav bar
  if (mobile) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingBottom: 64 }}>
        {/* Mobile top bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--card)', borderBottom: '1px solid var(--bd)', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/kalimaya-logo.png" alt="Kalimaya" style={{ height: 28, width: 'auto', objectFit: 'contain' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setLocale(locale === 'id' ? 'en' : 'id')} style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--bd)', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
              {locale === 'id' ? '🇮🇩' : '🇬🇧'}
            </button>
            <button onClick={() => setDark(!dark)} style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--bd)', background: 'transparent', cursor: 'pointer', fontSize: 14 }}>
              {dark ? '☀️' : '🌙'}
            </button>
            {user && (
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 13 }}>
                {user.fullName?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Page title */}
        {title && (
          <div style={{ padding: '10px 16px 0', fontSize: 11, color: 'var(--sub)', letterSpacing: 1, textTransform: 'uppercase' }}>{title}</div>
        )}

        {/* Content */}
        <div style={{ padding: '12px 16px' }}>
          {children}
        </div>

        {/* Bottom nav */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'var(--card)', borderTop: '1px solid var(--bd)', display: 'flex', justifyContent: 'space-around', alignItems: 'stretch', padding: 0 }}>
          {navItems.slice(0, 6).map(n => {
            const active = router.pathname === n.href;
            const badge = n.key === 'announcements' && announceCount > 0;
            return (
              <Link key={n.key} href={n.href} legacyBehavior>
                <a style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, textDecoration: 'none', color: active ? '#6366f1' : 'var(--sub)', position: 'relative', padding: '8px 0 10px', minWidth: 0 }}>
                  <span style={{ fontSize: 20, lineHeight: 1, display: 'block' }}>{n.icon}</span>
                  <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, lineHeight: 1 }}>{t(n.key, locale).slice(0, 6)}</span>
                  {badge && <span style={{ position: 'absolute', top: 6, right: '25%', width: 7, height: 7, background: '#dc2626', borderRadius: '50%' }} />}
                </a>
              </Link>
            );
          })}
          <button onClick={logout} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '8px 0 10px', minWidth: 0 }}>
            <span style={{ fontSize: 20, lineHeight: 1, display: 'block' }}>🚪</span>
            <span style={{ fontSize: 9, fontWeight: 500, lineHeight: 1 }}>{locale === 'id' ? 'Keluar' : 'Logout'}</span>
          </button>
        </div>
      </div>
    );
  }

  // Desktop: sidebar
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', color: 'var(--text)' }}>
      <aside style={{
        width: open ? 220 : 56,
        background: 'var(--card)',
        borderRight: '1px solid var(--bd)',
        padding: '16px 8px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
        transition: 'width .2s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', marginBottom: 16, padding: '0 4px' }}>
          {open && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/kalimaya-logo.png" alt="Kalimaya" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
            </div>
          )}
          <button onClick={toggleSidebar} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--bd)', background: 'var(--bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sub)', fontSize: 14, flexShrink: 0 }}>
            {open ? '◀' : '▶'}
          </button>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map(n => {
            const active = router.pathname === n.href;
            const badge = n.key === 'announcements' && announceCount > 0;
            const label = t(n.key, locale);
            return (
              <Link key={n.key} href={n.href} legacyBehavior>
                <a title={!open ? label : undefined} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', borderRadius: 10, marginBottom: 2, textDecoration: 'none', color: active ? 'white' : 'var(--text)', background: active ? 'var(--pri)' : 'transparent', fontWeight: 600, fontSize: 13, justifyContent: open ? 'flex-start' : 'center', position: 'relative' }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{n.icon}</span>
                  {open && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
                  {badge && !active && open && <span style={{ marginLeft: 'auto', background: '#dc2626', color: 'white', borderRadius: 99, fontSize: 10, padding: '1px 6px', fontWeight: 800 }}>{announceCount}</span>}
                  {badge && !active && !open && <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: '#dc2626', borderRadius: '50%' }} />}
                </a>
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: '1px solid var(--bd)', paddingTop: 10 }}>
          <button onClick={() => setLocale(locale === 'id' ? 'en' : 'id')} title={!open ? (locale === 'id' ? 'EN' : 'ID') : undefined} style={{ ...iconBtn, justifyContent: open ? 'flex-start' : 'center' }}>
            <span style={{ fontSize: 17, width: 22, textAlign: 'center', flexShrink: 0, lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{locale === 'id' ? '🇮🇩' : '🇬🇧'}</span>
            {open && <span style={{ fontSize: 13, fontWeight: 700 }}>{locale === 'id' ? 'ID / EN' : 'EN / ID'}</span>}
          </button>
          <button onClick={() => setDark(!dark)} title={!open ? (dark ? 'Light' : 'Dark') : undefined} style={{ ...iconBtn, justifyContent: open ? 'flex-start' : 'center' }}>
            <span style={{ fontSize: 17, width: 22, textAlign: 'center', flexShrink: 0, lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{dark ? '☀️' : '🌙'}</span>
            {open && <span style={{ fontSize: 13 }}>{dark ? 'Light' : 'Dark'}</span>}
          </button>
          <button onClick={logout} title={!open ? t('logout', locale) : undefined} style={{ ...iconBtn, color: '#dc2626', justifyContent: open ? 'flex-start' : 'center' }}>
            <span style={{ fontSize: 17, width: 22, textAlign: 'center', flexShrink: 0, lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>🚪</span>
            {open && <span style={{ fontSize: 13 }}>{t('logout', locale)}</span>}
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '24px 28px', overflow: 'auto', minWidth: 0 }}>
        {user && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--sub)', letterSpacing: 1, textTransform: 'uppercase' }}>{title || t('dashboard', locale)}</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{user.fullName}</div>
                <div style={{ fontSize: 12, color: 'var(--sub)' }}>{user.jobTitle || user.division?.name}</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, flexShrink: 0 }}>
                {user.fullName?.[0]?.toUpperCase()}
              </div>
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

const iconBtn = { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 8px', borderRadius: 10, border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', textAlign: 'left' };
