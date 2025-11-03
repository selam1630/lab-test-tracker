import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../../components/NavBar';

export default function DoctorInbox() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const savedEmail = localStorage.getItem('doctorEmail');
    if (savedEmail) setEmail(savedEmail);
    // Simple role gate: redirect lab users to dashboard
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (user && user.role && user.role !== 'doctor') {
        router.replace('/dashboard');
      }
    } catch {}
  }, [router]);

  const fetchInbox = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/doctor/inbox?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem('doctorEmail', email);
    fetchInbox();
  };

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = !q
      ? items
      : items.filter(i =>
          (i.patient?.name || '').toLowerCase().includes(q) ||
          (i.test?.type || '').toLowerCase().includes(q)
        );
    const sorted = [...base].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.patient?.name || '').localeCompare(b.patient?.name || '');
        case 'type':
          return (a.test?.type || '').localeCompare(b.test?.type || '');
        case 'date':
        default:
          return new Date(b.test?.date_taken || 0) - new Date(a.test?.date_taken || 0);
      }
    });
    return sorted;
  }, [items, search, sortBy]);

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '20px', paddingTop: '68px' }}>
      <NavBar />
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 16 }}>
        {/* Top Header Bar (match dashboard) */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px 25px',
          background: 'white',
          borderRadius: '15px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>Doctor Inbox</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={fetchInbox} style={{ padding: '10px 16px', background: 'white', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer' }}>↻ Refresh</button>
            <button onClick={handleSave} style={{ padding: '10px 16px', background: 'linear-gradient(90deg,#3b82f6 0%,#1d4ed8 100%)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', boxShadow: '0 4px 10px rgba(59,130,246,0.3)' }}>Load Inbox</button>
          </div>
        </div>

        {/* Filter and Sort Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 16,
          alignItems: 'center',
          padding: '15px 25px',
          background: 'white',
          borderRadius: '15px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
        }}>
          <input type="email" placeholder="Doctor Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '10px 16px', borderRadius: 8, border: '1.5px solid #e5e7eb' }} />
          <input type="text" placeholder="Search by patient or test" value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '10px 16px', borderRadius: 8, border: '1.5px solid #e5e7eb' }} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '10px 16px', borderRadius: 8, border: '1.5px solid #e5e7eb' }}>
            <option value="date">Sort: Date</option>
            <option value="name">Sort: Patient</option>
            <option value="type">Sort: Test</option>
          </select>
          <div style={{ color: '#6b7280' }}>Filter: Ready</div>
        </div>

        {/* Table-like list */}
        <div style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 0.5fr', padding: '15px 25px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#6b7280', fontSize: '0.9rem', background: '#f8fafc' }}>
            <div>Patient / Test</div>
            <div>Highlights</div>
            <div>Status</div>
            <div>Action</div>
          </div>

          {/* Rows */}
          {loading ? (
            <div style={{ padding: 16, display: 'grid', gap: 12 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: 64, border: '1px solid #eef2f7', borderRadius: 10, background: '#f9fafb' }} />
              ))}
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div style={{ color: '#6b7280', textAlign: 'center', padding: 24 }}>No assigned results.</div>
          ) : (
            filteredAndSorted.map(item => (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 0.5fr', alignItems: 'center', padding: '15px 25px', borderBottom: '1px solid #e5e7eb', color: '#4b5563', fontSize: '0.9rem', transition: 'background-color 0.2s ease', cursor: 'pointer' }}
                   onClick={() => { if (item.test?.id) window.location.href = `/tests/${item.test.id}`; }}
                   onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                   onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                <div>
                  <div style={{ fontWeight: 600, color: '#1f2937' }}>{item.patient?.name || 'Unknown Patient'}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{item.test?.type || 'Test'} • {item.test?.date_taken || ''}</div>
                </div>
                <div style={{ color: '#374151' }}>
                  {(item.results || []).slice(0, 2).map(r => (
                    <div key={r.id} style={{ fontSize: 13 }}>{r.parameter_name}: {r.value} {r.unit}</div>
                  ))}
                  {(item.results || []).length > 2 && (
                    <div style={{ color: '#6b7280', fontSize: 12 }}>…and more</div>
                  )}
                </div>
                <div>
                  <span style={{ padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 700, background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc' }}>Ready</span>
                </div>
                <div onClick={(e) => e.stopPropagation()} style={{ justifySelf: 'end' }}>
                  <a href={`/tests/${item.test?.id}`} style={{ textDecoration: 'none' }}>
                    <button style={{ padding: '8px 12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Open</button>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

