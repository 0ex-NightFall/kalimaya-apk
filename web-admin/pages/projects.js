import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useLocale, t } from '../lib/i18n';

const STATUS_COLOR = { ACTIVE: '#16a34a', PLANNING: '#d97706', COMPLETED: '#6366f1', ON_HOLD: '#64748b' };
const STATUS_LABEL = {
  ACTIVE: { id: 'Aktif', en: 'Active' },
  PLANNING: { id: 'Perencanaan', en: 'Planning' },
  COMPLETED: { id: 'Selesai', en: 'Completed' },
  ON_HOLD: { id: 'Ditunda', en: 'On Hold' },
};

export default function Projects() {
  const router = useRouter();
  const { locale } = useLocale();
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', status: 'PLANNING', progressPercent: 0, description: '' });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const tok = localStorage.getItem('token');
    if (!tok) return router.replace('/login');
    load(tok);
  }, []);

  async function load(tok) {
    const res = await fetch('/api/projects', { headers: { Authorization: `Bearer ${tok || localStorage.getItem('token')}` } });
    if (res.ok) setItems(await res.json());
  }

  async function submit(e) {
    e.preventDefault();
    const tok = localStorage.getItem('token');
    const url = editId ? `/api/projects/${editId}` : '/api/projects';
    const method = editId ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` }, body: JSON.stringify(form) });
    if (res.ok) { setMsg(locale === 'id' ? 'Tersimpan' : 'Saved'); setShowForm(false); setEditId(null); setForm({ name: '', code: '', status: 'PLANNING', progressPercent: 0, description: '' }); load(tok); }
    else { const d = await res.json(); setMsg(d.message || 'Error'); }
  }

  function edit(p) { setForm({ name: p.name, code: p.code, status: p.status, progressPercent: p.progressPercent, description: p.description || '' }); setEditId(p.id); setShowForm(true); }

  return (
    <Layout title={t('projects', locale)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>📁 {t('projects', locale)}</h2>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', code: '', status: 'PLANNING', progressPercent: 0, description: '' }); }} style={primaryBtn}>
          + {locale === 'id' ? 'Proyek Baru' : 'New Project'}
        </button>
      </div>
      {msg && <div style={msgBox}>{msg}</div>}
      {showForm && (
        <form onSubmit={submit} style={{ ...card, marginBottom: 14 }}>
          <h3 style={{ marginTop: 0 }}>{editId ? (locale === 'id' ? 'Edit Proyek' : 'Edit Project') : (locale === 'id' ? 'Proyek Baru' : 'New Project')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={lbl}>{t('projectName', locale)}</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inp} /></div>
            <div><label style={lbl}>{t('projectCode', locale)}</label><input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required style={inp} /></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={lbl}>{t('description', locale)}</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} style={{ ...inp, resize: 'vertical' }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div><label style={lbl}>{t('status', locale)}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inp}>
                {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v[locale]}</option>)}
              </select>
            </div>
            <div><label style={lbl}>{t('progress', locale)}: {form.progressPercent}%</label>
              <input type="range" min={0} max={100} value={form.progressPercent} onChange={e => setForm({ ...form, progressPercent: +e.target.value })} style={{ width: '100%', marginTop: 8 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={primaryBtn}>{t('save', locale)}</button>
            <button type="button" onClick={() => setShowForm(false)} style={secBtn}>{t('cancel', locale)}</button>
          </div>
        </form>
      )}
      <div style={{ display: 'grid', gap: 12 }}>
        {items.map(p => {
          const color = STATUS_COLOR[p.status] || '#64748b';
          const statusLabel = STATUS_LABEL[p.status]?.[locale] || p.status;
          return (
            <div key={p.id} style={{ ...card, borderLeft: `4px solid ${color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: 15 }}>{p.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--sub)' }}>{p.code}</span>
                    <span style={{ background: color + '22', color, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{statusLabel}</span>
                  </div>
                  {p.description && <div style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 10 }}>{p.description}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 8, background: 'var(--bd)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${p.progressPercent}%`, height: '100%', background: color, borderRadius: 4, transition: 'width .3s' }} />
                    </div>
                    <span style={{ fontWeight: 700, color, fontSize: 13, minWidth: 36 }}>{p.progressPercent}%</span>
                  </div>
                </div>
                <button onClick={() => edit(p)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--bd)', background: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  {locale === 'id' ? 'Edit' : 'Edit'}
                </button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <div style={{ textAlign: 'center', color: 'var(--sub)', padding: 48 }}>{t('noData', locale)}</div>}
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
