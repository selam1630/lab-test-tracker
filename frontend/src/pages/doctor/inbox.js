import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';

export default function DoctorInbox() {
  const [email, setEmail] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('doctorEmail');
    if (saved) setEmail(saved);
  }, []);

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

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '20px', paddingTop: '68px' }}>
      <NavBar />
      <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          <input
            type="email"
            placeholder="Doctor Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ flex: 1, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}
          />
          <button onClick={handleSave} style={{ padding: '10px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Load Inbox</button>
        </div>

        {loading ? (
          <div>Loading…</div>
        ) : (
          <div>
            {items.length === 0 ? (
              <div style={{ color: '#6b7280' }}>No assigned results.</div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {items.map(item => (
                  <div key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{item.patient?.name}</div>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>{item.test?.type} • {item.test?.date_taken}</div>
                      </div>
                      <a href={`/tests/${item.test?.id}`} style={{ textDecoration: 'none' }}>
                        <button style={{ padding: '8px 12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Open</button>
                      </a>
                    </div>
                    <div style={{ marginTop: 10, color: '#374151', fontSize: 14 }}>
                      {(item.results || []).slice(0, 3).map(r => (
                        <div key={r.id}>{r.parameter_name}: {r.value} {r.unit} (Normal {r.normal_min}-{r.normal_max})</div>
                      ))}
                      {(item.results || []).length > 3 && (
                        <div style={{ color: '#6b7280' }}>…and more</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

