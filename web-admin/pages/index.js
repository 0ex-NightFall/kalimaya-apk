import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useLocale, t } from '../lib/i18n';

export default function Home() {
  const router = useRouter();
  const { locale } = useLocale();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ users: 0, projects: 0, today: 0, files: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const tok = localStorage.getItem('token');
    if (!tok) return router.replace('/login');
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    load(tok);
  }, []);

  async function load(tok) {
    const headers = { Authorization: `Bearer ${tok}` };
    const [users, projects, today, files, announ] = await Promise.all([
      fetch('/api/users', { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/projects', { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/attendance/today', { headers }).then(r => r.ok ? r.json() : null),
      fetch('/api/files', { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/announcements', { headers }).then(r => r.ok ? r.json() : []),
    ]);
    setStats({
      users: Array.isArray(users) ? users.length : 0,
      projects: Array.isArray(projects) ? projects.filter(p => p.status === 'ACTIVE').length : 0,
      today: today?.checkInAt ? 1 : 0,
      files: Array.isArray(files) ? files.length : 0,
    });
    setRecentProjects(Array.isArray(projects) ? projects.slice(0, 4) : []);
    setAnnouncements(Array.isArray(announ) ? announ.slice(0, 3) : []);
  }

  return (
    <Layout title={t('dashboard', locale)}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>{t('welcomeBack', locale)}, {user?.fullName?.split(' ')[0] || ''} 👋</h1>
        <div style={{ color: 'var(--sub)', marginTop: 4, fontSize: 14 }}>
          {new Date().toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 18 }}>
        <Stat color="#6366f1" icon="👥" label={t('totalEmployees', locale)} value={stats.users} />
        <Stat color="#16a34a" icon="📁" label={t('activeProjects', locale)} value={stats.projects} />
        <Stat color="#ea580c" icon="📍" label={t('presentToday', locale)} value={stats.today === 1 ? '✓' : '—'} />
        <Stat color="#a855f7" icon="📄" label={t('totalFiles', locale)} value={stats.files} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>📁 {t('projects', locale)}</h3>
            <Link href="/projects" legacyBehavior><a style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>{locale === 'id' ? 'Lihat Semua →' : 'View All →'}</a></Link>
          </div>
          {recentProjects.map(p => (
            <div key={p.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--bd)' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <div style={{ flex: 1, height: 5, background: 'var(--bd)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${p.progressPercent}%`, height: '100%', background: '#6366f1', borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sub)', minWidth: 32 }}>{p.progressPercent}%</span>
              </div>
            </div>
          ))}
          {recentProjects.length === 0 && <div style={{ color: 'var(--sub)', textAlign: 'center', padding: 16 }}>{t('noData', locale)}</div>}
        </div>

        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>📢 {t('announcements', locale)}</h3>
            <Link href="/announcements" legacyBehavior><a style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>{locale === 'id' ? 'Lihat Semua →' : 'View All →'}</a></Link>
          </div>
          {announcements.map(a => (
            <div key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--bd)' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{new Date(a.createdAt).toLocaleString(locale === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          ))}
          {announcements.length === 0 && <div style={{ color: 'var(--sub)', textAlign: 'center', padding: 16 }}>{t('noAnnouncements', locale)}</div>}
        </div>
      </div>
    </Layout>
  );
}

function Stat({ color, icon, label, value }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--bd)', borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, color: 'var(--sub)', letterSpacing: .5, textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      </div>
    </div>
  );
}

const card = { background: 'var(--card)', border: '1px solid var(--bd)', borderRadius: 14, padding: 14 };
