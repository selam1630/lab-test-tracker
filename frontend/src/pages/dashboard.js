import { useEffect, useState } from 'react';
import { getPatients } from '../utils/api';
import { useRouter } from 'next/router';
import NavBar from '../components/NavBar';
const PRIMARY_BLUE = '#3b82f6'; 
const SECONDARY_BLUE = '#1d4ed8'; 
const BACKGROUND_GRAY = '#f4f7f9';
// Removed unused SIDEBAR_BLUE to satisfy linter
const TEXT_GRAY = '#6b7280';
const BORDER_GRAY = '#e5e7eb';

const STATUS_SAVED = '#9ca3af'; 
const STATUS_APPROVED = '#10b981';
const STATUS_REJECTED = '#ef4444'; 
const getStatusStyle = (status) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return { background: '#d1fae5', color: STATUS_APPROVED, border: `1px solid ${STATUS_APPROVED}` };
    case 'rejected':
      return { background: '#fee2e2', color: STATUS_REJECTED, border: `1px solid ${STATUS_REJECTED}` };
    default:
      return { background: '#e5e7eb', color: STATUS_SAVED, border: `1px solid ${STATUS_SAVED}` };
  }
};

export default function Dashboard() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', dob: '', gender: '', doctorEmail: '' });
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [sortBy, setSortBy] = useState('name');
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 25;
  const mockPatientData = (p) => ({
    ...p,
    activityId: `PC-0023-${String(p.id).padStart(2, '0')}`,
    counselledOn: p.gender === 'Male' ? 'Diseases, Medication' : 'Medication, Diet',
    status: p.id % 5 === 0 ? 'Rejected' : p.id % 3 === 0 ? 'Approved' : 'Saved',
    relatedProfileForm: `IP12${String(p.id).padStart(1, '1')}`,
    submittedTo: 'Admin Staff',
    submittedDate: '07/08/25'
  });

  const handleOpenPatientOrLatestTest = async (patientId) => {
    try {
      const res = await fetch('https://lab-test-tracker-3.onrender.com/api/tests');
      const data = await res.json();
      const testsForPatient = (data || []).filter(t => String(t.patientId) === String(patientId));
      if (testsForPatient.length > 0) {
        const latest = [...testsForPatient].sort((a, b) => new Date(b.date_taken) - new Date(a.date_taken))[0];
        if (latest?.id) {
          router.push(`/tests/${latest.id}`);
          return;
        }
      }
      router.push(`/patients/${patientId}`);
    } catch {
      router.push(`/patients/${patientId}`);
    }
  };


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not logged in');
      setLoading(false);
      return;
    }
    getPatients(token).then(data => {
      if (Array.isArray(data)) {
        const mockedData = data.map((p, index) => ({
          ...p,
          id: p.id || index + 1, 
          activityId: `PC-0023-${String(p.id || index + 1).padStart(2, '0')}`,
          counselledOn: index % 2 === 0 ? 'Diseases, Medication' : 'Medication, Diet',
          status: p.id % 5 === 0 ? 'Rejected' : p.id % 3 === 0 ? 'Approved' : 'Saved',
          relatedProfileForm: `IP12${String(p.id || index + 1).padStart(1, '1')}`,
          submittedTo: 'Demo Staff',
          submittedDate: '07/08/25'
        }));
        setPatients(mockedData);
      }
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
      const res = await fetch(`https://lab-test-tracker-3.onrender.com/api/patients/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.id) {
        setMessage('Patient updated!');
        setPatients(patients.map(p => (p.id === editingId ? mockPatientData(data) : p)));
        setForm({ name: '', dob: '', gender: '', doctorEmail: '' });
        setEditingId(null);
      } else {
        setMessage(data.message || 'Failed to update patient');
      }
    } else {
      const res = await fetch('https://lab-test-tracker-3.onrender.com/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...form, userId: 1 })
      });
      const data = await res.json();
      if (data.id) {
        setMessage('Patient added!');
        setPatients([...patients, mockPatientData(data)]);
        setForm({ name: '', dob: '', gender: '', doctorEmail: '' });
      } else {
        setMessage(data.message || 'Failed to add patient');
      }
    }
  };

  const handleEdit = (patient) => {
    setForm({ name: patient.name, dob: patient.dob, gender: patient.gender, doctorEmail: patient.doctorEmail || '' });
    setEditingId(patient.id);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`https://lab-test-tracker-3.onrender.com/api/patients/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      setMessage('Patient deleted successfully!');
      setPatients(patients.filter(p => p.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setForm({ name: '', dob: '', gender: '' });
      }
    } else {
      setMessage('Failed to delete patient.');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', dob: '', gender: '', doctorEmail: '' });
  };
  const filteredAndSortedPatients = patients
    .filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            patient.activityId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || patient.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'activityId':
          return a.activityId.localeCompare(b.activityId);
        case 'submittedDate':
          return new Date(a.submittedDate) - new Date(b.submittedDate);
        default:
          return 0;
      }
    });
    
  const totalPages = Math.ceil(filteredAndSortedPatients.length / patientsPerPage);
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredAndSortedPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
    }
  };
  const handleExportCsv = () => {
    const rows = [
      ['ID', 'Name', 'Date of Birth', 'Gender']
    ];
    filteredAndSortedPatients.forEach(p => {
      rows.push([
        String(p.id ?? ''),
        (p.name ?? '').replace(/\"/g, '"'),
        String(p.dob ?? ''),
        String(p.gender ?? '')
      ]);
    });
    const csv = rows
      .map(r => r
        .map(field => {
          const needsQuotes = /[",\n]/.test(field);
          const escaped = String(field).replace(/"/g, '""');
          return needsQuotes ? `"${escaped}"` : escaped;
        })
        .join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'patients_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#6b7280' }}>
      Loading...
    </div>
  );
  if (error) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#ef4444' }}>
      {error}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: BACKGROUND_GRAY, paddingTop: '68px' }}>
      <NavBar />
      {/* Main Content Area */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Header Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '15px 25px', 
          background: 'white', 
          borderRadius: '15px', 
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>
            In Patient Counselling
          </h2>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button style={{ 
              padding: '10px 20px', 
              background: 'white', 
              color: TEXT_GRAY, 
              border: `1px solid ${BORDER_GRAY}`, 
              borderRadius: '8px', 
              cursor: 'pointer' 
            }} onClick={handleExportCsv}>
              🖨️ Print All
            </button>
            <button 
              onClick={() => { setEditingId(null); setForm({ name: '', dob: '', gender: '', doctorEmail: '' }); }}
              style={{ 
                padding: '10px 20px', 
                background: `linear-gradient(90deg, ${PRIMARY_BLUE} 0%, ${SECONDARY_BLUE} 100%)`, 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontWeight: '600', 
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
              }}>
              ➕ Add New
            </button>
          </div>
        </div>

        {/* Filter and Sort Bar (Replaces the original search/filter bar) */}
        <div style={{
          display: 'flex',
          gap: '20px',
          padding: '15px 25px',
          background: 'white',
          borderRadius: '15px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
          marginBottom: '20px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            placeholder="Search by ID or Name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: `1.5px solid ${BORDER_GRAY}`,
              fontSize: '1rem',
              flex: 3,
              minWidth: '200px'
            }}
          />
          <div style={{ color: TEXT_GRAY, flex: 1, minWidth: '100px' }}>FILTER:</div>
          
          <input 
            type="date" 
            placeholder="Select Date"
            style={{ 
              padding: '10px 16px', 
              borderRadius: '8px', 
              border: `1.5px solid ${BORDER_GRAY}`, 
              fontSize: '1rem',
              flex: 2,
              minWidth: '120px'
            }}
          />
          
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: `1.5px solid ${BORDER_GRAY}`,
              fontSize: '1rem',
              flex: 2,
              minWidth: '120px'
            }}
          >
            <option value="all">Status: All</option>
            <option value="approved">Status: Approved</option>
            <option value="saved">Status: Saved</option>
            <option value="rejected">Status: Rejected</option>
          </select>
          
          <div style={{ color: TEXT_GRAY, flex: 1, minWidth: '50px' }}>Sort By:</div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: `1.5px solid ${BORDER_GRAY}`,
              fontSize: '1rem',
              flex: 2,
              minWidth: '120px'
            }}
          >
            <option value="name">Name</option>
            <option value="activityId">Activity ID</option>
            <option value="submittedDate">Submitted Date</option>
          </select>
        </div>


        {/* 3. Patients List/Table */}
        <div style={{ 
          flex: 1, 
          background: 'white', 
          borderRadius: '15px', 
          overflow: 'hidden', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          marginBottom: '20px'
        }}>
          {/* Table Header (Mimicking the column names in the image) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr 0.5fr 1fr',
            padding: '15px 25px',
            borderBottom: `1px solid ${BORDER_GRAY}`,
            fontWeight: '600',
            color: TEXT_GRAY,
            fontSize: '0.9rem',
            background: '#f8fafc'
          }}>
            <div>ACTIVITY ID</div>
            <div>COUNSELLED ON</div>
            <div>POINTS</div>
            <div>SUBMITTED ON</div>
            <div>SUBMITTED TO</div>
            <div>STATUS</div>
            <div>RELATED PROFILE FORM</div>
            <div>ACTIONS</div>
          </div>
          
          {/* Table Rows */}
          {currentPatients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: TEXT_GRAY, fontSize: '1.1rem' }}>
              No matching records found.
            </div>
          ) : (
            currentPatients.map(p => (
              <div key={p.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr 0.5fr 1fr',
                alignItems: 'center',
                padding: '15px 25px',
                borderBottom: `1px solid ${BORDER_GRAY}`,
                color: '#4b5563',
                fontSize: '0.9rem',
                transition: 'background-color 0.2s ease',
                cursor: 'pointer'
              }} onClick={() => handleOpenPatientOrLatestTest(p.id)} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                
                {/* ACTIVITY ID */}
                <div style={{ fontWeight: '500', color: SECONDARY_BLUE }}>{p.activityId}</div>
                
                {/* COUNSELLED ON (Name, DOB, Gender from your original data for context) */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>{p.name}</span>
                    <span style={{ fontSize: '0.8rem', color: TEXT_GRAY }}>{p.dob} - {p.gender}</span>
                </div>
                
                {/* POINTS (Using a View button placeholder) */}
                <div onClick={(e) => e.stopPropagation()}>
                  <button style={{ 
                    padding: '5px 10px', 
                    background: BORDER_GRAY, 
                    color: TEXT_GRAY, 
                    border: 'none', 
                    borderRadius: '5px', 
                    cursor: 'pointer' 
                  }}>
                    View
                  </button>
                </div>
                
                {/* SUBMITTED ON */}
                <div>{p.submittedDate}</div>
                
                {/* SUBMITTED TO */}
                <div>{p.submittedTo}</div>
                
                {/* STATUS */}
                <div>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '12px', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold',
                    ...getStatusStyle(p.status) 
                  }}>
                    {p.status}
                  </span>
                </div>
                
                {/* RELATED PROFILE FORM */}
                <div style={{ color: PRIMARY_BLUE, fontWeight: '500' }}>{p.relatedProfileForm}</div>

                {/* ACTIONS (Edit/Delete - The three dots in the image) */}
                <div style={{ display: 'flex', gap: '5px' }} onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => handleEdit(p)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: SECONDARY_BLUE }}
                    >
                        <span role="img" aria-label="edit">✏️</span>
                    </button>
                    <button
                        onClick={() => { setPatientToDelete(p); setShowConfirm(true); }}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: STATUS_REJECTED }}
                    >
                        <span role="img" aria-label="delete">🗑️</span>
                    </button>
                </div>

              </div>
            ))
          )}
          
          {/* Pagination Footer */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '10px 25px', 
            borderTop: `1px solid ${BORDER_GRAY}`
          }}>
            <div style={{ color: TEXT_GRAY, fontSize: '0.9rem' }}>
              Displaying {indexOfFirstPatient + 1} - {Math.min(indexOfLastPatient, filteredAndSortedPatients.length)} Out of {filteredAndSortedPatients.length}
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} style={{ padding: '5px 10px', border: `1px solid ${BORDER_GRAY}`, borderRadius: '5px', background: 'white', cursor: 'pointer' }}>&lt;</button>
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i + 1} 
                  onClick={() => paginate(i + 1)} 
                  style={{ 
                    padding: '5px 10px', 
                    border: 'none', 
                    borderRadius: '5px', 
                    background: currentPage === i + 1 ? PRIMARY_BLUE : 'white', 
                    color: currentPage === i + 1 ? 'white' : TEXT_GRAY,
                    fontWeight: currentPage === i + 1 ? 'bold' : 'normal',
                    cursor: 'pointer' 
                  }}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} style={{ padding: '5px 10px', border: `1px solid ${BORDER_GRAY}`, borderRadius: '5px', background: 'white', cursor: 'pointer' }}>&gt;</button>
            </div>
          </div>

        </div>

        {/* 4. Add/Edit Form (Relocated to the bottom, kept similar styling to original for quick identification) */}
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

        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {editingId ? '✏️ Edit Patient Record' : '➕ Add New Patient Record'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <input name="name" placeholder="Patient Name" value={form.name} onChange={handleChange} required style={{ padding: '15px', border: `1px solid ${BORDER_GRAY}`, borderRadius: '10px', fontSize: '1rem', boxSizing: 'border-box' }} />
            <input name="dob" type="date" placeholder="Date of Birth" value={form.dob} onChange={handleChange} required style={{ padding: '15px', border: `1px solid ${BORDER_GRAY}`, borderRadius: '10px', fontSize: '1rem', boxSizing: 'border-box' }} />
            <input name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} required style={{ padding: '15px', border: `1px solid ${BORDER_GRAY}`, borderRadius: '10px', fontSize: '1rem', boxSizing: 'border-box' }} />
            <input name="doctorEmail" type="email" placeholder="Doctor Email (optional)" value={form.doctorEmail} onChange={handleChange} style={{ padding: '15px', border: `1px solid ${BORDER_GRAY}`, borderRadius: '10px', fontSize: '1rem', boxSizing: 'border-box' }} />

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '15px' }}>
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
              >
                {editingId ? '🔄 Update Patient' : '➕ Add Patient'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
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
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    flex: '1'
                  }}
                >
                  ❌ Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal (kept as is for functionality) */}
      {showConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', textAlign: 'center', minWidth: '320px' }}>
            <h2 style={{ color: '#ef4444', marginBottom: 16 }}>Confirm Deletion</h2>
            <p style={{ marginBottom: 24 }}>
              Are you sure you want to delete <b>{patientToDelete?.name}</b>?<br />
              <span style={{ color: '#991b1b' }}>This action cannot be undone.</span>
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button
                style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => { handleDelete(patientToDelete.id); setShowConfirm(false); setPatientToDelete(null); }}
              >
                Yes, Delete
              </button>
              <button
                style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => { setShowConfirm(false); setPatientToDelete(null); }}
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