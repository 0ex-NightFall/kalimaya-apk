import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useLocale, t } from '../lib/i18n';

const STATUS_MAP = {
  ON_TIME: { id: 'Tepat Waktu', en: 'On Time', color: '#16a34a' },
  LATE: { id: 'Terlambat', en: 'Late', color: '#dc2626' },
  EARLY: { id: 'Lebih Awal', en: 'Early', color: '#d97706' },
};

export default function Attendance() {
  const router = useRouter();
  const { locale } = useLocale();
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [exportMonth, setExportMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const tok = localStorage.getItem('token');
    if (!tok) return router.replace('/login');
    load(tok);
  }, []);

  async function load(tok) {
    const t2 = tok || localStorage.getItem('token');
    const [td, hist] = await Promise.all([
      fetch('/api/attendance/today', { headers: { Authorization: `Bearer ${t2}` } }).then(r => r.json()),
      fetch('/api/attendance/me', { headers: { Authorization: `Bearer ${t2}` } }).then(r => r.json()),
    ]);
    setToday(td?.statusCode ? null : td);
    setHistory(Array.isArray(hist) ? hist : []);
    setLoading(false);
  }

  async function action(path) {
    const tok = localStorage.getItem('token');
    const res = await fetch(`/api/attendance/${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` }, body: '{}',
    });
    const d = await res.json();
    if (res.ok) { setMsg(path === 'checkin' ? '✅ ' + (locale === 'id' ? 'Check-in berhasil' : 'Checked in successfully') : '✅ ' + (locale === 'id' ? 'Check-out berhasil' : 'Checked out successfully')); load(tok); }
    else setMsg(d.message || 'Error');
  }

  function exportCsv() {
    const tok = localStorage.getItem('token');
    fetch(`/api/attendance/export?month=${exportMonth}`, { headers: { Authorization: `Bearer ${tok}` } })
      .then(r => r.blob()).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `absensi-${exportMonth}.csv`; a.click();
      });
  }

  function dur(cin, cout) {
    if (!cin || !cout) return '-';
    return ((new Date(cout) - new Date(cin)) / 3600000).toFixed(1) + (locale === 'id' ? ' jam' : ' hrs');
  }

  const lateCount = history.filter(h => h.status === 'LATE').length;
  const onTimeCount = history.filter(h => h.status === 'ON_TIME').length;

  return (
    <Layout title={t('attendance', locale)}>
      <h2 style={{ marginTop: 0 }}>{t('attendance', locale)}</h2>
      {msg && <div style={msgBox}>{msg}</div>}

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>{t('todayAtt', locale)} — {new Date().toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
          {[
            { label: locale === 'id' ? 'Masuk' : 'Check In', value: today?.checkInAt ? new Date(today.checkInAt).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }) : '—', color: '#16a34a' },
            { label: locale === 'id' ? 'Pulang' : 'Check Out', value: today?.checkOutAt ? new Date(today.checkOutAt).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }) : '—', color: '#ea580c' },
            { label: t('status', locale), value: today?.status ? (STATUS_MAP[today.status]?.[locale] || today.status) : '—', color: STATUS_MAP[today?.status]?.color || '#6366f1' },
            { label: t('duration', locale), value: dur(today?.checkInAt, today?.checkOutAt), color: '#6366f1' },
          ].map(s => (
            <div key={s.label} style={{ background: s.color + '15', border: `1px solid ${s.color}33`, borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 11, color: s.color, opacity: .8, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => action('checkin')} disabled={!!today?.checkInAt} style={{ ...actionBtn('#16a34a'), opacity: today?.checkInAt ? .5 : 1 }}>
            {today?.checkInAt ? t('alreadyIn', locale) : t('checkIn', locale)}
          </button>
          <button onClick={() => action('checkout')} disabled={!today?.checkInAt || !!today?.checkOutAt} style={{ ...actionBtn('#ea580c'), opacity: (!today?.checkInAt || today?.checkOutAt) ? .5 : 1 }}>
            {today?.checkOutAt ? t('alreadyOut', locale) : t('checkOut', locale)}
          </button>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--sub)' }}>{t('workHours', locale)}</div>
      </div>

      <div style={{ ...card, marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          <div>
            <h3 style={{ margin: 0 }}>{t('history', locale)}</h3>
            <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 4 }}>
              {t('onTime', locale)}: <strong style={{ color: '#16a34a' }}>{onTimeCount}</strong> · {t('late', locale)}: <strong style={{ color: '#dc2626' }}>{lateCount}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="month" value={exportMonth} onChange={e => setExportMonth(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--bd)', background: 'var(--card)', color: 'inherit' }} />
            <button onClick={exportCsv} style={{ padding: '8px 12px', borderRadius: 8, background: '#16a34a', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>📥 {t('exportCsv', locale)}</button>
          </div>
        </div>
        {loading ? <div>{t('loading', locale)}</div> : (
          <div>
            {history.map(h => {
              const st = STATUS_MAP[h.status];
              return (
                <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--bd)', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{new Date(h.date).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                    <div style={{ fontSize: 13, color: 'var(--sub)' }}>
                      {locale === 'id' ? 'Masuk' : 'In'}: {h.checkInAt ? new Date(h.checkInAt).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }) : '-'} · {locale === 'id' ? 'Pulang' : 'Out'}: {h.checkOutAt ? new Date(h.checkOutAt).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {st && <span style={{ background: st.color + '22', color: st.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{st[locale]}</span>}
                    <span style={{ color: '#6366f1', fontWeight: 700 }}>{dur(h.checkInAt, h.checkOutAt)}</span>
                  </div>
                </div>
              );
            })}
            {history.length === 0 && <div style={{ color: 'var(--sub)', textAlign: 'center', padding: 32 }}>{t('noData', locale)}</div>}
          </div>
        )}
      </div>
    </Layout>
  );
}

const card = { background: 'var(--card)', border: '1px solid var(--bd)', borderRadius: 14, padding: 16 };
const actionBtn = (color) => ({ padding: '12px 20px', background: color, color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 15 });
const msgBox = { padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, marginBottom: 12, color: '#16a34a' };
