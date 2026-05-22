import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useLocale } from '../lib/i18n';

const API = '/api';

export default function Login() {
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) router.replace('/');
  }, []);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.message || (locale === 'id' ? 'Login gagal' : 'Login failed')); return; }
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.replace('/');
    } catch (e2) { setErr(locale === 'id' ? 'Tidak dapat terhubung ke server' : 'Cannot connect to server'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text)', padding: 20 }}>
      <button onClick={() => setLocale(locale === 'id' ? 'en' : 'id')} style={{ position: 'absolute', top: 20, right: 20, padding: '8px 14px', background: 'var(--card)', border: '1px solid var(--bd)', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
        {locale === 'id' ? '🇮🇩 ID / EN' : '🇬🇧 EN / ID'}
      </button>
      <form onSubmit={submit} style={{ background: 'var(--card)', border: '1px solid var(--bd)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 400, boxShadow: '0 4px 20px rgba(0,0,0,.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="/kalimaya-logo.png" alt="Kalimaya" style={{ height: 60, width: 'auto', objectFit: 'contain', margin: '0 auto 12px', display: 'block' }} />
          <h1 style={{ margin: 0, fontSize: 22 }}>Kalimaya</h1>
          <div style={{ color: 'var(--sub)', fontSize: 13, marginTop: 4 }}>{locale === 'id' ? 'Sistem Internal Kantor' : 'Internal Office System'}</div>
        </div>
        {err && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 12px', borderRadius: 10, marginBottom: 14, fontSize: 13, border: '1px solid #fecaca' }}>{err}</div>}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} required autoFocus style={inp} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inp} />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, background: '#6366f1', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: loading ? 'wait' : 'pointer', opacity: loading ? .7 : 1 }}>
          {loading ? (locale === 'id' ? 'Memproses…' : 'Processing…') : (locale === 'id' ? 'Masuk' : 'Sign In')}
        </button>
      </form>
    </div>
  );
}

const inp = { width: '100%', padding: '11px 13px', borderRadius: 10, border: '1px solid var(--bd)', fontSize: 14, background: 'var(--card)', color: 'inherit', boxSizing: 'border-box', fontFamily: 'inherit' };
