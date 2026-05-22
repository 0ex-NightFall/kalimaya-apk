import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useLocale, t } from '../lib/i18n';

const ACTION_COLOR = {
  LOGIN: '#6366f1',
  LOGOUT: '#64748b',
  CHECKIN: '#16a34a',
  CHECKOUT: '#ea580c',
  CREATE_USER: '#0ea5e9',
  DELETE_USER: '#dc2626',
  UPDATE_USER: '#d97706',
  CREATE_PROJECT: '#0ea5e9',
  UPDATE_PROJECT: '#d97706',
  UPLOAD_FILE: '#a855f7',
  DELETE_FILE: '#dc2626',
  CREATE_ANNOUNCEMENT: '#f59e0b',
  DELETE_ANNOUNCEMENT: '#dc2626',
};

export default function AuditLog() {
  const router = useRouter();
  const { locale } = useLocale();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [myRoles, setMyRoles] = useState([]);

  useEffect(() => {
    const tok = localStorage.getItem('token');
    if (!tok) return router.replace('/login');
    const u = localStorage.getItem('user');
    const roles = u ? JSON.parse(u).roles || [] : [];
    setMyRoles(roles);
    if (!roles.some(r => ['DIRECTOR', 'ADMIN_IT'].includes(r))) {
      router.replace('/');
      return;
    }
    fetch('/api/audit', { headers: { Authorization: `Bearer ${tok}` } })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setLogs(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l =>
    !filter || l.action?.includes(filter.toUpperCase()) || l.username?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Layout title={locale === 'id' ? 'Audit Log' : 'Audit Log'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0 }}>🔍 Audit Log</h2>
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder={locale === 'id' ? 'Filter aksi / user...' : 'Filter action / user...'}
          style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid var(--bd)', background: 'var(--card)', color: 'inherit', width: 220 }}
        />
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--bd)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 120px 140px 1fr', padding: '10px 16px', borderBottom: '2px solid var(--bd)', fontSize: 12, fontWeight: 700, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: .5 }}>
          <div>{locale === 'id' ? 'Waktu' : 'Time'}</div>
          <div>User</div>
          <div>{locale === 'id' ? 'Aksi' : 'Action'}</div>
          <div>{locale === 'id' ? 'Detail' : 'Detail'}</div>
        </div>
        {loading && <div style={{ padding: 32, textAlign: 'center', color: 'var(--sub)' }}>{t('loading', locale)}</div>}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--sub)' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
            <div>{locale === 'id' ? 'Belum ada log' : 'No logs yet'}</div>
          </div>
        )}
        {filtered.map((log, i) => {
          const color = ACTION_COLOR[log.action] || '#64748b';
          return (
            <div key={log.id} style={{
              display: 'grid', gridTemplateColumns: '160px 120px 140px 1fr',
              padding: '10px 16px',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--bd)' : 'none',
              fontSize: 13,
              background: i % 2 === 0 ? 'transparent' : 'var(--bg)',
              alignItems: 'center',
            }}>
              <div style={{ color: 'var(--sub)', fontSize: 12 }}>
                {new Date(log.createdAt).toLocaleString(locale === 'id' ? 'id-ID' : 'en-GB', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit'
                })}
              </div>
              <div style={{ fontWeight: 600 }}>{log.username}</div>
              <div>
                <span style={{ background: color + '22', color, padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                  {log.action}
                </span>
              </div>
              <div style={{ color: 'var(--sub)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {log.target || (log.meta ? JSON.stringify(log.meta) : '—')}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--sub)', textAlign: 'right' }}>
        {filtered.length} {locale === 'id' ? 'entri' : 'entries'} · {locale === 'id' ? 'Hanya terlihat oleh Admin' : 'Visible to Admin only'}
      </div>
    </Layout>
  );
}
