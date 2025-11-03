import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast, { Toaster } from 'react-hot-toast';
import NavBar from '../../components/NavBar';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TestResults() {
  const router = useRouter();
  const { id } = router.query;
  const [test, setTest] = useState(null);
  const [results, setResults] = useState([]);
  const [form, setForm] = useState({ parameter_name: '', value: '', unit: '', normal_min: '', normal_max: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const resultsRef = useRef();
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    // Fetch test info
    fetch(`http://localhost:5000/api/tests/${id}`)
      .then(res => res.json())
      .then(setTest);
    // Fetch test results for this test
    fetch(`http://localhost:5000/api/test-results`)
      .then(res => res.json())
      .then(data => setResults(data.filter(r => r.testId == id)));
  }, [id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (editingId) {
      // Edit result
      const res = await fetch(`http://localhost:5000/api/test-results/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.id) {
        setResults(results.map(r => (r.id === editingId ? data : r)));
        setForm({ parameter_name: '', value: '', unit: '', normal_min: '', normal_max: '' });
        setEditingId(null);
        setMessage('Result updated!');
        toast.success('Result updated!');
      } else {
        setMessage(data.message || 'Failed to update result');
        toast.error(data.message || 'Failed to update result');
      }
    } else {
      // Add result
      const res = await fetch('http://localhost:5000/api/test-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, testId: id })
      });
      const data = await res.json();
      if (data.id) {
        setResults([...results, data]);
        setForm({ parameter_name: '', value: '', unit: '', normal_min: '', normal_max: '' });
        setMessage('Result added!');
        toast.success('Result added!');
      } else {
        setMessage(data.message || 'Failed to add result');
        toast.error(data.message || 'Failed to add result');
      }
    }
  };

  const handleEdit = (result) => {
    setForm({
      parameter_name: result.parameter_name,
      value: result.value,
      unit: result.unit,
      normal_min: result.normal_min,
      normal_max: result.normal_max
    });
    setEditingId(result.id);
  };

  const handleDelete = async (resultId) => {
    const res = await fetch(`http://localhost:5000/api/test-results/${resultId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      setResults(results.filter(r => r.id !== resultId));
      if (editingId === resultId) {
        setEditingId(null);
        setForm({ parameter_name: '', value: '', unit: '', normal_min: '', normal_max: '' });
      }
      toast.success('Result deleted!');
    } else {
      toast.error('Failed to delete result');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ parameter_name: '', value: '', unit: '', normal_min: '', normal_max: '' });
  };

  const handleExportPDF = async () => {
    const element = resultsRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
    pdf.save('test-results.pdf');
    toast.success('PDF exported!');
  };

  const handleSendToDoctor = async () => {
    if (!id) return;
    setSending(true);
    try {
      const res = await fetch(`http://localhost:5000/api/tests/${id}/assign-to-doctor`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      toast.success('Result sent to doctor inbox');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  if (!test) return <div>Loading...</div>;

  // Chart.js data
  const chartData = {
    labels: results.map(r => r.parameter_name),
    datasets: [
      {
        label: 'Value',
        data: results.map(r => r.value),
        backgroundColor: '#3b82f6',
      },
      {
        label: 'Normal Min',
        data: results.map(r => r.normal_min),
        backgroundColor: '#22c55e',
      },
      {
        label: 'Normal Max',
        data: results.map(r => r.normal_max),
        backgroundColor: '#ef4444',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Test Results Visualization' },
    },
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f4f6',
      padding: '20px'
    }}>
      <NavBar />
      <Toaster />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center', color: '#3b82f6' }}>
          {test.type} ({test.date_taken}) Results
        </h1>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginBottom: 16 }}>
          <button onClick={handleExportPDF} style={{ background: '#3b82f6', color: '#fff', padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
            Export as PDF
          </button>
          <button onClick={handleSendToDoctor} disabled={sending} style={{ background: sending ? '#9ca3af' : '#22c55e', color: '#fff', padding: '8px 16px', borderRadius: 6, border: 'none', cursor: sending ? 'not-allowed' : 'pointer' }}>
            {sending ? 'Sending…' : 'Email to Doctor'}
          </button>
        </div>
        <div ref={resultsRef}>
          <Bar data={chartData} options={chartOptions} />
          <ul style={{ marginBottom: '1.5rem', listStyle: 'none', padding: 0 }}>
            {results.map(r => (
              <li key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span>
                  {r.parameter_name}: {r.value} {r.unit} (Normal: {r.normal_min} - {r.normal_max})
                </span>
                <span>
                  <button style={{ padding: '6px 16px', border: 'none', borderRadius: 6, color: '#fff', background: '#fbbf24', marginRight: 6, cursor: 'pointer' }} onClick={() => handleEdit(r)}>Edit</button>
                  <button style={{ padding: '6px 16px', border: 'none', borderRadius: 6, color: '#fff', background: '#ef4444', cursor: 'pointer' }} onClick={() => handleDelete(r.id)}>Delete</button>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 500, marginBottom: '0.5rem', color: '#22c55e' }}>{editingId ? 'Edit Result' : 'Add New Result'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="parameter_name"
            placeholder="Parameter Name"
            value={form.parameter_name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px 10px', marginBottom: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: '1rem' }}
          />
          <input
            name="value"
            type="number"
            step="any"
            placeholder="Value"
            value={form.value}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px 10px', marginBottom: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: '1rem' }}
          />
          <input
            name="unit"
            placeholder="Unit"
            value={form.unit}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px 10px', marginBottom: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: '1rem' }}
          />
          <input
            name="normal_min"
            type="number"
            step="any"
            placeholder="Normal Min"
            value={form.normal_min}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px 10px', marginBottom: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: '1rem' }}
          />
          <input
            name="normal_max"
            type="number"
            step="any"
            placeholder="Normal Max"
            value={form.normal_max}
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
    </div>
  );
} 