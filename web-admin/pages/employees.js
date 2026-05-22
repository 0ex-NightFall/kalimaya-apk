import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useLocale, t } from '../lib/i18n';

const JOB_OPTIONS = [
  'Direktur', 'General Manager', 'Manager',
  'Kepala Arsitektur', 'Kepala Struktur', 'Kepala Estimator',
  'Koordinator Pengawas',
  'Arsitek', 'Senior Arsitek',
  'Drafter Senior', 'Drafter',
  '3D Artist', 'Interior Designer',
  'Estimator', 'RAB',
  'Staff Admin', 'Admin',
  'HR Manager', 'Staff HR',
  'Pengawas Lapangan',
  'Driver', 'Office Boy',
];

const EMPTY_FORM = { fullName: '', username: '', email: '', password: '', divisionId: '', jobTitle: '' };

export default function Employees() {
  const router = useRouter();
  const { locale } = useLocale();
  const [users, setUsers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [myRoles, setMyRoles] = useState([]);
  const [me, setMe] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const tok = localStorage.getItem('token');
    if (!tok) return router.replace('/login');
    const u = localStorage.getItem('user');
    if (u) {
      const parsed = JSON.parse(u);
      setMe(parsed);
      setMyRoles(parsed.roles || []);
    }
    load(tok);
  }, []);

  async function load(tok) {
    const t2 = tok || localStorage.getItem('token');
    const [u, d] = await Promise.all([
      fetch('/api/users', { headers: { Authorization: `Bearer ${t2}` } }).then(r => r.ok ? r.json() : []),
      fetch('/api/users/divisions', { headers: { Authorization: `Bearer ${t2}` } }).then(r => r.ok ? r.json() : []),
    ]);
    setUsers(Array.isArray(u) ? u : []);
    setDivisions(Array.isArray(d) ? d : []);
  }

  function openAdd() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(u) {
    setEditId(u.id);
    setForm({
      fullName: u.fullName || '',
      username: u.username || '',
      email: u.email || '',
      password: '',
      divisionId: u.divisionId || '',
      jobTitle: u.jobTitle || '',
    });
    setShowForm(true);
  }

  async function submit(e) {
    e.preventDefault();
    const tok = localStorage.getItem('token');
    const payload = { ...form };
    if (!payload.divisionId) delete payload.divisionId;
    let res;
    if (editId) {
      if (!payload.password) delete payload.password;
      res = await fetch(`/api/users/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
        body: JSON.stringify(payload),
      });
    } else {
      payload.roleCodes = ['EMPLOYEE'];
      res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
        body: JSON.stringify(payload),
      });
    }
    if (res.ok) {
      setMsg(editId
        ? (locale === 'id' ? '✅ Perubahan disimpan' : '✅ Changes saved')
        : (locale === 'id' ? '✅ Karyawan ditambahkan' : '✅ Employee added')
      );
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      load(tok);
    } else {
      const d = await res.json().catch(() => ({}));
      setMsg('❌ ' + (d.message || 'Error'));
    }
  }

  async function remove(id, username) {
    if (!confirm(locale === 'id' ? `Hapus karyawan "${username}"?` : `Delete employee "${username}"?`)) return;
    const tok = localStorage.getItem('token');
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tok}` },
    });
    if (res.ok) {
      setMsg(locale === 'id' ? '✅ Dihapus' : '✅ Deleted');
      load(tok);
    } else {
      const d = await res.json().catch(() => ({}));
      setMsg('❌ ' + (d.message || 'Error'));
    }
  }

  const canManage = myRoles.some(r => ['DIRECTOR', 'HR', 'ADMIN_IT'].includes(r));
  const filtered = users.filter(u => u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout title={t('employees', locale)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0 }}>👥 {t('employees', locale)}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search', locale)} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid var(--bd)', background: 'var(--card)', color: 'inherit', width: 180 }} />
          {canManage && <button onClick={openAdd} style={primaryBtn}>{t('newEmployee', locale)}</button>}
        </div>
      </div>
      {msg && <div style={msgBox}>{msg}</div>}
      {showForm && canManage && (
        <form onSubmit={submit} style={{ ...card, marginBottom: 14 }}>
          <h3 style={{ marginTop: 0 }}>
            {editId
              ? (locale === 'id' ? 'Edit Karyawan' : 'Edit Employee')
              : (locale === 'id' ? 'Tambah Karyawan' : 'Add Employee')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={lbl}>{t('fullName', locale)}</label><input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required style={inp} /></div>
            <div><label style={lbl}>{t('username', locale)}</label><input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required style={inp} disabled={!!editId} /></div>
            <div><label style={lbl}>{t('email', locale)}</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={inp} /></div>
            <div><label style={lbl}>{t('password', locale)} {editId && <span style={{ color: 'var(--sub)', fontWeight: 400 }}>({locale === 'id' ? 'kosongkan jika tidak diubah' : 'leave blank to keep'})</span>}</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editId} minLength={editId ? 0 : 4} style={inp} /></div>
            <div><label style={lbl}>{t('division', locale)}</label>
              <select value={form.divisionId} onChange={e => setForm({ ...form, divisionId: e.target.value })} style={inp}>
                <option value="">— {locale === 'id' ? 'Pilih Divisi' : 'Select Division'} —</option>
                {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div><label style={lbl}>{t('jobTitle', locale)}</label>
              <select value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} style={inp}>
                <option value="">— {locale === 'id' ? 'Pilih Jabatan' : 'Select Job Title'} —</option>
                {JOB_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={primaryBtn}>{t('save', locale)}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); }} style={secBtn}>{t('cancel', locale)}</button>
          </div>
        </form>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {filtered.map(u => (
          <div key={u.id} style={{ ...card, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
              {u.fullName?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{u.fullName}</div>
                {canManage && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => openEdit(u)} title={locale === 'id' ? 'Edit' : 'Edit'} style={iconBtn('#6366f1')}>✏️</button>
                    {u.username !== 'admin' && u.id !== me?.id && (
                      <button onClick={() => remove(u.id, u.username)} title={t('delete', locale)} style={iconBtn('#dc2626')}>🗑</button>
                    )}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--sub)' }}>@{u.username}</div>
              {u.jobTitle && <div style={{ fontSize: 12, color: 'var(--sub)' }}>{u.jobTitle}</div>}
              <div style={{ fontSize: 12, color: 'var(--sub)' }}>{u.division?.name || '—'}</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                {(u.roleCodes || []).filter(r => r !== 'ADMIN_IT' || u.username === 'admin').map(r => (
                  <span key={r} style={{ background: '#6366f122', color: '#6366f1', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{r}</span>
                ))}
                <span style={{ background: u.isActive ? '#16a34a22' : '#dc262622', color: u.isActive ? '#16a34a' : '#dc2626', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                  {u.isActive ? t('active', locale) : t('inactive', locale)}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ color: 'var(--sub)', padding: 32, gridColumn: '1/-1', textAlign: 'center' }}>{t('noData', locale)}</div>}
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
const iconBtn = (color) => ({ padding: '4px 8px', borderRadius: 6, border: 'none', background: color + '22', color, cursor: 'pointer', fontSize: 11, fontWeight: 700 });
