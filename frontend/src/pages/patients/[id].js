import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PatientTests() {
  const router = useRouter();
  const { id } = router.query;
  const [patient, setPatient] = useState(null);
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState({ type: '', date_taken: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    // Fetch patient info
    fetch(`http://localhost:5000/api/patients/${id}`)
      .then(res => res.json())
      .then(setPatient);
    // Fetch tests for this patient
    fetch(`http://localhost:5000/api/tests`)
      .then(res => res.json())
      .then(data => setTests(data.filter(t => t.patientId == id)));
  }, [id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (editingId) {
      // Edit test
      const res = await fetch(`http://localhost:5000/api/tests/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.id) {
        setTests(tests.map(t => (t.id === editingId ? data : t)));
        setForm({ type: '', date_taken: '' });
        setEditingId(null);
        setMessage('Test updated!');
      } else {
        setMessage(data.message || 'Failed to update test');
      }
    } else {
      // Add test
      const res = await fetch('http://localhost:5000/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, patientId: id })
      });
      const data = await res.json();
      if (data.id) {
        setTests([...tests, data]);
        setForm({ type: '', date_taken: '' });
        setMessage('Test added!');
      } else {
        setMessage(data.message || 'Failed to add test');
      }
    }
  };

  const handleEdit = (test) => {
    setForm({ type: test.type, date_taken: test.date_taken });
    setEditingId(test.id);
  };

  const handleDelete = async (testId) => {
    const res = await fetch(`http://localhost:5000/api/tests/${testId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      setTests(tests.filter(t => t.id !== testId));
      if (editingId === testId) {
        setEditingId(null);
        setForm({ type: '', date_taken: '' });
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ type: '', date_taken: '' });
  };

  if (!patient) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
        {patient.name}'s Tests
      </h1>
      <ul style={{ marginBottom: '1.5rem', listStyle: 'none', padding: 0 }}>
        {tests.map(t => (
          <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <span>{t.type} ({t.date_taken})</span>
            <span>
              <button style={{ padding: '6px 16px', border: 'none', borderRadius: 6, color: '#fff', background: '#fbbf24', marginRight: 6, cursor: 'pointer' }} onClick={() => handleEdit(t)}>Edit</button>
              <button style={{ padding: '6px 16px', border: 'none', borderRadius: 6, color: '#fff', background: '#ef4444', cursor: 'pointer' }} onClick={() => handleDelete(t.id)}>Delete</button>
              <button style={{ padding: '6px 16px', border: 'none', borderRadius: 6, color: '#fff', background: '#3b82f6', marginLeft: 6, cursor: 'pointer' }} onClick={() => router.push(`/tests/${t.id}`)}>Results</button>
            </span>
          </li>
        ))}
      </ul>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 500, marginBottom: '0.5rem' }}>{editingId ? 'Edit Test' : 'Add New Test'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="type"
          placeholder="Test Type"
          value={form.type}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px 10px', marginBottom: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: '1rem' }}
        />
        <input
          name="date_taken"
          type="date"
          placeholder="Date Taken"
          value={form.date_taken}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px 10px', marginBottom: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: '1rem' }}
        />
        <div>
          <button
            type="submit"
            style={{
              padding: '6px 16px',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              background: editingId ? '#fbbf24' : '#22c55e',
              marginRight: 8,
              cursor: 'pointer'
            }}
          >
            {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button
              type="button"
              style={{
                padding: '6px 16px',
                border: 'none',
                borderRadius: 6,
                color: '#fff',
                background: '#6b7280',
                cursor: 'pointer'
              }}
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      <div style={{ marginTop: 10, color: '#16a34a', textAlign: 'center' }}>{message}</div>
    </div>
  );
}