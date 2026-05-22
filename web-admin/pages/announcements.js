import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useLocale, t } from '../lib/i18n';

const PRIORITY_COLOR = { HIGH: '#dc2626', NORMAL: '#6366f1', LOW: '#64748b' };

export default function Announcements() {
  const router = useRouter();
  const { locale } = useLocale();
  const [items, setItems] = useState([]);
  const [myRoles, setMyRoles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', priority: 'NORMAL' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const tok = localStorage.getItem('token');
    if (!tok) return router.replace('/login');
    const u = localStorage.getItem('user');
    if (u) setMyRoles(JSON.parse(u).roles || []);
    load(tok);
  }, []);

  async function load(tok) {
    const res = await fetch('/api/announcements', { headers: { Authorization: `Bearer ${tok || localStorage.getItem('token')}` } });
    if (res.ok) setItems(await res.json());
  }

  async function submit(e) {
    e.preventDefault();
    const tok = localStorage.getItem('token');
    const res = await fetch('/api/announcements', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` }, body: JSON.stringify(form),
    });
    if (res.ok) { setMsg(locale === 'id' ? 'Pengumuman berhasil dikirim' : 'Announcement sent'); setShowForm(false); setForm({ title: '', body: '', priority: 'NORMAL' }); load(tok); }
    else { const d = await res.json(); setMsg(d.message || 'Error'); }
  }

  async function remove(id) {
    const tok = localStorage.getItem('token');
    const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tok}` } });
    if (res.ok) { setMsg(locale === 'id' ? 'Dihapus' : 'Deleted'); load(tok); }
  }

  const canPost = myRoles.some(r => ['DIRECTOR', 'HR', 'ADMIN_IT'].includes(r));

  return (
    <Layout title={t('announcements', locale)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>📢 {t('announcements', locale)}</h2>
        {canPost && <button onClick={() => setShowForm(!showForm)} style={primaryBtn}>{t('newAnnouncement', locale)}</button>}
      </div>
      {msg && <div style={msgBox}>{msg}</div>}
      {showForm && (
        <form onSubmit={submit} style={{ ...card, marginBottom: 14 }}>
          <h3 style={{ marginTop: 0 }}>{locale === 'id' ? 'Pengumuman Baru' : 'New Announcement'}</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>{t('title', locale)}</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={inp} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>{t('message', locale)}</label>
            <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} required rows={4} style={{ ...inp, resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>{t('priority', locale)}</label>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={inp}>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">🔴 {locale === 'id' ? 'Penting' : 'Important'}</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={primaryBtn}>{t('sendAll', locale)}</button>
            <button type="button" onClick={() => setShowForm(false)} style={secBtn}>{t('cancel', locale)}</button>
          </div>
        </form>
      )}
      <div style={{ display: 'grid', gap: 12 }}>
        {items.map(item => (
          <div key={item.id} style={{ ...card, borderLeft: `4px solid ${PRIORITY_COLOR[item.priority] || '#6366f1'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800, fontSize: 16 }}>{item.title}</span>
                  {item.priority === 'HIGH' && <span style={{ background: '#dc262622', color: '#dc2626', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{t('important', locale)}</span>}
                </div>
                <div style={{ lineHeight: 1.6, marginBottom: 8, whiteSpace: 'pre-wrap' }}>{item.body}</div>
                <div style={{ fontSize: 12, color: 'var(--sub)' }}>{new Date(item.createdAt).toLocaleString(locale === 'id' ? 'id-ID' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              {canPost && <button onClick={() => remove(item.id)} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: '#dc262622', color: '#dc2626', cursor: 'pointer', fontWeight: 700 }}>{t('delete', locale)}</button>}
            </div>
          </div>
        ))}
        {items.length === 0 && <div style={{ textAlign: 'center', color: 'var(--sub)', padding: 48 }}><div style={{ fontSize: 40, marginBottom: 12 }}>📭</div><div>{t('noAnnouncements', locale)}</div></div>}
      </div>
    </Layout>
  );
}

const card = { background: 'var(--card)', border: '1px solid var(--bd)', borderRadius: 14, padding: 16 };
const primaryBtn = { padding: '10px 16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 };
const secBtn = { padding: '10px 16px', background: 'transparent', color: 'inherit', border: '1px solid var(--bd)', borderRadius: 10, cursor: 'pointer' };
const msgBox = { padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, marginBottom: 12, color: '#16a34a' };
const lbl = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 };
const inp = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--bd)', fontSize: 14, background: 'var(--card)', color: 'inherit', boxSizing: 'border-box', fontFamily: 'inherit' };
