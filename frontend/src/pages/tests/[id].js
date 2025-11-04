import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast, { Toaster } from 'react-hot-toast';
import NavBar from '../../components/NavBar';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Default parameter templates for common lab tests
const TEST_TEMPLATES = {
  'Complete Blood Count (CBC)': [
    { parameter_name: 'WBC', unit: '10^3/µL', normal_min: 4.0, normal_max: 11.0 },
    { parameter_name: 'RBC', unit: '10^6/µL', normal_min: 4.20, normal_max: 5.90 },
    { parameter_name: 'Hemoglobin', unit: 'g/dL', normal_min: 13.5, normal_max: 17.5 },
    { parameter_name: 'Hematocrit', unit: '%', normal_min: 38.8, normal_max: 50.0 },
    { parameter_name: 'Platelets', unit: '10^3/µL', normal_min: 150, normal_max: 450 },
  ],
  'Basic Metabolic Panel (BMP)': [
    { parameter_name: 'Glucose', unit: 'mg/dL', normal_min: 65, normal_max: 99 },
    { parameter_name: 'Urea Nitrogen (BUN)', unit: 'mg/dL', normal_min: 7, normal_max: 25 },
    { parameter_name: 'Creatinine', unit: 'mg/dL', normal_min: 0.60, normal_max: 1.26 },
    { parameter_name: 'Sodium', unit: 'mmol/L', normal_min: 135, normal_max: 146 },
    { parameter_name: 'Potassium', unit: 'mmol/L', normal_min: 3.5, normal_max: 5.3 },
    { parameter_name: 'eGFR', unit: 'mL/min/1.73m2', normal_min: 60, normal_max: 9999 },
  ],
  'Lipid Panel': [
    { parameter_name: 'Total Cholesterol', unit: 'mg/dL', normal_min: 0, normal_max: 199 },
    { parameter_name: 'HDL', unit: 'mg/dL', normal_min: 40, normal_max: 100 },
    { parameter_name: 'LDL', unit: 'mg/dL', normal_min: 0, normal_max: 129 },
    { parameter_name: 'Triglycerides', unit: 'mg/dL', normal_min: 0, normal_max: 149 },
  ],
};

export default function TestResults() {
  const router = useRouter();
  const { id } = router.query;
  const [test, setTest] = useState(null);
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [bulkRows, setBulkRows] = useState([]);
  const [bulkSaving, setBulkSaving] = useState(false);
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

  const isWithinRange = (value, min, max) => {
    const numeric = parseFloat(value);
    return !Number.isNaN(numeric) && numeric >= parseFloat(min) && numeric <= parseFloat(max);
  };

  const getFlag = (value, min, max) => {
    const v = parseFloat(value);
    const minN = parseFloat(min);
    const maxN = parseFloat(max);
    if (Number.isNaN(v) || Number.isNaN(minN) || Number.isNaN(maxN)) return { label: '—', color: '#6b7280' };
    if (v < minN) return { label: 'Low', color: '#ef4444' };
    if (v > maxN) return { label: 'High', color: '#ef4444' };
    return { label: 'Normal', color: '#22c55e' };
  };

  const getPositionPercent = (value, min, max) => {
    const v = parseFloat(value);
    const minN = parseFloat(min);
    const maxN = parseFloat(max);
    if (Number.isNaN(v) || Number.isNaN(minN) || Number.isNaN(maxN) || maxN === minN) return 0.5;
    const pct = (v - minN) / (maxN - minN);
    if (pct < 0) return 0;
    if (pct > 1) return 1;
    return pct;
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

  const loadTemplate = (templateKey) => {
    setSelectedTemplate(templateKey);
    const tpl = TEST_TEMPLATES[templateKey] || [];
    // Prepare editable rows with empty value fields
    setBulkRows(tpl.map(p => ({ ...p, value: '' })));
  };

  const updateBulkRow = (index, field, value) => {
    setBulkRows(rows => rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const saveBulkRows = async () => {
    if (!id || bulkRows.length === 0) return;
    const payloads = bulkRows
      .filter(r => r.value !== '')
      .map(r => ({
        parameter_name: r.parameter_name,
        value: parseFloat(r.value),
        unit: r.unit,
        normal_min: parseFloat(r.normal_min),
        normal_max: parseFloat(r.normal_max),
        testId: id
      }));
    if (payloads.length === 0) return;
    setBulkSaving(true);
    try {
      const created = [];
      for (const body of payloads) {
        const res = await fetch('http://localhost:5000/api/test-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.id) created.push(data);
      }
      if (created.length > 0) {
        setResults(prev => [...prev, ...created]);
        toast.success(`Saved ${created.length} parameters`);
      } else {
        toast.error('No rows saved');
      }
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f4f6',
      padding: '20px'
    }}>
      <NavBar />
      <Toaster />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>Result Overview</h2>
            <input
              placeholder="Filter by parameter…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, width: 260 }}
            />
          </div>
          {/* Template selector for bulk entry */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <select value={selectedTemplate} onChange={(e) => loadTemplate(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}>
              <option value="">Load template…</option>
              {Object.keys(TEST_TEMPLATES).map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
            {bulkRows.length > 0 && (
              <button onClick={saveBulkRows} disabled={bulkSaving} style={{ background: bulkSaving ? '#9ca3af' : '#16a34a', color: '#fff', padding: '8px 12px', borderRadius: 8, border: 'none', cursor: bulkSaving ? 'not-allowed' : 'pointer' }}>
                {bulkSaving ? 'Saving…' : 'Save All Entered'}
              </button>
            )}
          </div>
          <Bar data={chartData} options={chartOptions} />
          <div style={{ overflowX: 'auto', marginTop: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: '#f9fafb', color: '#374151' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>Parameter</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>Target Range</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>Latest Result</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>vs Ref</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>Trend</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results
                  .filter(r => r.parameter_name.toLowerCase().includes(filter.toLowerCase()))
                  .map(r => {
                    const within = isWithinRange(r.value, r.normal_min, r.normal_max);
                    const flag = getFlag(r.value, r.normal_min, r.normal_max);
                    const pos = getPositionPercent(r.value, r.normal_min, r.normal_max);
                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', color: '#111827', fontWeight: 600 }}>{r.parameter_name}</td>
                        <td style={{ padding: '12px 16px', color: '#6b7280' }}>{r.normal_min} - {r.normal_max} {r.unit}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: 8, border: `1px solid ${within ? '#86efac' : '#fecaca'}`, background: within ? '#ecfdf5' : '#fef2f2', color: within ? '#16a34a' : '#b91c1c', fontWeight: 700 }}>
                            {r.value} {r.unit}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: 999, background: '#eef2ff', color: flag.color, border: `1px solid #c7d2fe`, fontWeight: 700 }}>{flag.label}</span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#6b7280' }}>{test.date_taken}</td>
                        <td style={{ padding: '12px 16px', width: 220 }}>
                          <div style={{ position: 'relative', height: 16, borderRadius: 8, background: '#e8f5e9', border: '1px solid #d1fae5' }}>
                            {/* range background */}
                            <div style={{ position: 'absolute', left: 8, right: 8, top: '50%', height: 2, background: '#a7f3d0', transform: 'translateY(-50%)' }} />
                            {/* marker */}
                            <div style={{ position: 'absolute', top: 2, left: `calc(${(pos * 100).toFixed(1)}% - 6px)`, width: 12, height: 12, borderRadius: 9999, background: within ? '#22c55e' : '#ef4444', boxShadow: '0 0 0 2px #fff' }} />
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button style={{ padding: '6px 12px', border: 'none', borderRadius: 6, color: '#fff', background: '#fbbf24', marginRight: 6, cursor: 'pointer' }} onClick={() => handleEdit(r)}>Edit</button>
                          <button style={{ padding: '6px 12px', border: 'none', borderRadius: 6, color: '#fff', background: '#ef4444', cursor: 'pointer' }} onClick={() => handleDelete(r.id)}>Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                {results.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>No results yet. Add the first one below.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Bulk entry grid rendered when a template is selected */}
          {bulkRows.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ margin: 0, marginBottom: 8, fontSize: '1rem', fontWeight: 600, color: '#111827' }}>Enter values for {selectedTemplate}</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', color: '#374151' }}>
                      <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e5e7eb' }}>Parameter</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e5e7eb' }}>Value</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e5e7eb' }}>Unit</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e5e7eb' }}>Normal Min</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e5e7eb' }}>Normal Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkRows.map((row, idx) => (
                      <tr key={row.parameter_name}>
                        <td style={{ padding: '10px 12px' }}>{row.parameter_name}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <input type="number" step="any" value={row.value} onChange={(e) => updateBulkRow(idx, 'value', e.target.value)} style={{ width: 140, padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6 }} />
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <input value={row.unit} onChange={(e) => updateBulkRow(idx, 'unit', e.target.value)} style={{ width: 160, padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6 }} />
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <input type="number" step="any" value={row.normal_min} onChange={(e) => updateBulkRow(idx, 'normal_min', e.target.value)} style={{ width: 120, padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6 }} />
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <input type="number" step="any" value={row.normal_max} onChange={(e) => updateBulkRow(idx, 'normal_max', e.target.value)} style={{ width: 120, padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6 }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 500, marginBottom: '0.25rem', color: '#22c55e' }}>{editingId ? 'Edit Result' : 'Quick Add Result'}</h2>
        {!editingId && (
          <div style={{ marginBottom: '0.5rem', color: '#6b7280', fontSize: 14 }}>
            Use this to add a single parameter that isn’t in a template.
          </div>
        )}
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