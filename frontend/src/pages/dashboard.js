import { useEffect, useState } from 'react';
import { getPatients } from '../utils/api';
import Link from 'next/link';
import NavBar from '../components/NavBar';

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', dob: '', gender: '' });
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const [showConfirm, setShowConfirm] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not logged in');
      setLoading(false);
      return;
    }
    getPatients(token).then(data => {
      if (Array.isArray(data)) setPatients(data);
      else setError(data.message || 'Failed to fetch patients');
      setLoading(false);
    });
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Not logged in');
      return;
    }
    if (editingId) {
      // Edit mode
      const res = await fetch(`http://localhost:5000/api/patients/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.id) {
        setMessage('Patient updated!');
        setPatients(patients.map(p => (p.id === editingId ? data : p)));
        setForm({ name: '', dob: '', gender: '' });
        setEditingId(null);
      } else {
        setMessage(data.message || 'Failed to update patient');
      }
    } else {
      // Add mode
      const res = await fetch('http://localhost:5000/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, userId: 1 }) // Replace 1 with actual userId if needed
      });
      const data = await res.json();
      if (data.id) {
        setMessage('Patient added!');
        setPatients([...patients, data]);
        setForm({ name: '', dob: '', gender: '' });
      } else {
        setMessage(data.message || 'Failed to add patient');
      }
    }
  };

  const handleEdit = (patient) => {
    setForm({ name: patient.name, dob: patient.dob, gender: patient.gender });
    setEditingId(patient.id);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/patients/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setPatients(patients.filter(p => p.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setForm({ name: '', dob: '', gender: '' });
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', dob: '', gender: '' });
  };

  // Filter and sort patients
  const filteredAndSortedPatients = patients
    .filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGender = genderFilter === 'all' || patient.gender.toLowerCase() === genderFilter.toLowerCase();
      return matchesSearch && matchesGender;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'dob':
          return new Date(a.dob) - new Date(b.dob);
        case 'gender':
          return a.gender.localeCompare(b.gender);
        default:
          return 0;
      }
    });

  if (loading) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.2rem',
      color: '#6b7280'
    }}>
      Loading...
    </div>
  );
  if (error) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.2rem',
      color: '#ef4444'
    }}>
      {error}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f4f6',
      padding: '20px',
      paddingTop: '68px'
    }}>
      <NavBar />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Dashboard Header */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white',
          padding: '40px 30px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            margin: '0 0 10px 0',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            🏥 Patient Dashboard
          </h1>
          <p style={{
            margin: '0',
            opacity: '0.95',
            fontSize: '1.1rem',
            fontWeight: '400'
          }}>
            Manage your patients and their test records
          </p>
          {patients.length === 0 && (
            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '500' }}>
                👋 Welcome! Get started by adding your first patient below.
              </p>
              <p style={{ margin: 0, fontSize: '0.875rem', opacity: '0.9' }}>
                After adding a patient, you can create tests and track their results.
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '30px' }}>
          {/* Search, Filter, and Sort Controls */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'space-between'
          }}>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1.5px solid #e5e7eb',
                fontSize: '1rem',
                minWidth: '180px',
                flex: '1'
              }}
            />
            <select
              value={genderFilter}
              onChange={e => setGenderFilter(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1.5px solid #e5e7eb',
                fontSize: '1rem',
                minWidth: '120px',
                flex: '1'
              }}
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1.5px solid #e5e7eb',
                fontSize: '1rem',
                minWidth: '120px',
                flex: '1'
              }}
            >
              <option value="name">Sort by Name</option>
              <option value="dob">Sort by Date of Birth</option>
              <option value="gender">Sort by Gender</option>
            </select>
          </div>

          {/* Patients List */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '30px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              👥 Patients ({patients.length})
            </h2>
            
            {patients.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280',
                fontSize: '1.1rem'
              }}>
                No patients found. Add your first patient below!
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: '15px'
              }}>
                {filteredAndSortedPatients.map(p => (
                  <div key={p.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }} onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                  }} onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
    <div>
                      <Link href={`/patients/${p.id}`}>
                        <span style={{
                          color: '#3b82f6',
                          cursor: 'pointer',
                          textDecoration: 'none',
                          fontSize: '1.2rem',
                          fontWeight: '600',
                          transition: 'color 0.3s ease'
                        }} onMouseEnter={(e) => e.target.style.color = '#1d4ed8'} onMouseLeave={(e) => e.target.style.color = '#3b82f6'}>
                          {p.name}
                        </span>
                      </Link>
                      <div style={{
                        color: '#6b7280',
                        fontSize: '0.9rem',
                        marginTop: '5px'
                      }}>
                        {p.gender} • {p.dob}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        style={{
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        onClick={() => handleEdit(p)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        style={{
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        onClick={() => {
                          setPatientToDelete(p);
                          setShowConfirm(true);
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add/Edit Form */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {editingId ? '✏️ Edit Patient' : '➕ Add New Patient'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gap: '15px' }}>
                <input
                  name="name"
                  placeholder="Patient Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <input
                  name="dob"
                  type="date"
                  placeholder="Date of Birth"
                  value={form.dob}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <input
                  name="gender"
                  placeholder="Gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '15px 30px',
                    background: editingId ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    flex: '1'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  {editingId ? '🔄 Update Patient' : '➕ Add Patient'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    style={{
                      padding: '15px 30px',
                      background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    onClick={handleCancelEdit}
                  >
                    ❌ Cancel
                  </button>
                )}
              </div>
            </form>
            
            {message && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                borderRadius: '10px',
                textAlign: 'center',
                fontWeight: '500',
                background: message.includes('success') || message.includes('added') || message.includes('updated') 
                  ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' 
                  : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                color: message.includes('success') || message.includes('added') || message.includes('updated') ? '#065f46' : '#991b1b',
                border: '1px solid',
                borderColor: message.includes('success') || message.includes('added') || message.includes('updated') ? '#10b981' : '#ef4444'
              }}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>

      {showConfirm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            textAlign: 'center',
            minWidth: '320px'
          }}>
            <h2 style={{ color: '#ef4444', marginBottom: 16 }}>Confirm Deletion</h2>
            <p style={{ marginBottom: 24 }}>
              Are you sure you want to delete <b>{patientToDelete?.name}</b>?<br />
              <span style={{ color: '#991b1b' }}>This action cannot be undone.</span>
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button
                style={{
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  handleDelete(patientToDelete.id);
                  setShowConfirm(false);
                  setPatientToDelete(null);
                }}
              >
                Yes, Delete
              </button>
              <button
                style={{
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setShowConfirm(false);
                  setPatientToDelete(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}