import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useLocale, t } from '../lib/i18n';

export default function FilesPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const tok = localStorage.getItem('token');
    if (!tok) return router.replace('/login');
    load(tok);
  }, []);

  async function load(tok) {
    const res = await fetch('/api/files', { headers: { Authorization: `Bearer ${tok || localStorage.getItem('token')}` } });
    if (res.ok) setFiles(await res.json());
  }

  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setMsg('');
    const tok = localStorage.getItem('token');
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/files/upload', { method: 'POST', headers: { Authorization: `Bearer ${tok}` }, body: fd });
    if (res.ok) { setMsg(t('uploadSuccess', locale)); load(tok); }
    else { const d = await res.json().catch(() => ({})); setMsg(d.message || t('uploadFail', locale)); }
    setUploading(false);
    e.target.value = '';
  }

  async function remove(id) {
    const tok = localStorage.getItem('token');
    const res = await fetch(`/api/files/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tok}` } });
    if (res.ok) { setMsg(locale === 'id' ? 'File dihapus' : 'File deleted'); load(tok); }
  }

  return (
    <Layout title={t('files', locale)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ margin: 0 }}>📄 {locale === 'id' ? 'Dokumen / File' : 'Documents / Files'}</h2>
        <label style={{ padding: '10px 14px', background: '#6366f1', color: 'white', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>
          {uploading ? t('uploading', locale) : t('uploadFile', locale)}
          <input type="file" onChange={upload} style={{ display: 'none' }} disabled={uploading} />
        </label>
      </div>
      {msg && <div style={msgBox}>{msg}</div>}
      <div style={{ display: 'grid', gap: 10 }}>
        {files.map(f => (
          <div key={f.id} style={{ background: 'var(--card)', border: '1px solid var(--bd)', borderRadius: 12, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{f.name}</div>
              <div style={{ fontSize: 12, color: 'var(--sub)' }}>{(Number(f.sizeBytes || 0) / 1024).toFixed(1)} KB · {f.mimeType} · {new Date(f.createdAt).toLocaleString(locale === 'id' ? 'id-ID' : 'en-GB')}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href={`/api/files/${f.id}/download`} style={{ padding: '8px 12px', borderRadius: 8, textDecoration: 'none', background: '#16a34a', color: 'white', fontWeight: 700 }}>{t('download', locale)}</a>
              <button onClick={() => remove(f.id)} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#dc2626', color: 'white', fontWeight: 700, cursor: 'pointer' }}>{t('delete', locale)}</button>
            </div>
          </div>
        ))}
        {files.length === 0 && <div style={{ textAlign: 'center', color: 'var(--sub)', padding: 48 }}>{t('noData', locale)}</div>}
      </div>
    </Layout>
  );
}

const msgBox = { padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, marginBottom: 12, color: '#16a34a' };
