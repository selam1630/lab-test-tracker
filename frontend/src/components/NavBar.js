import Link from 'next/link';

export default function NavBar() {
  return (
    <nav style={{
      background: '#f3f4f6',
      padding: '12px 24px',
      marginBottom: 24,
      borderRadius: 8,
      display: 'flex',
      gap: 16,
      alignItems: 'center'
    }}>
      <Link href="/"><span style={{ cursor: 'pointer', color: '#3b82f6', fontWeight: 500 }}>Home</span></Link>
      <Link href="/dashboard"><span style={{ cursor: 'pointer', color: '#3b82f6', fontWeight: 500 }}>Dashboard</span></Link>
      <button
        onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
        style={{
          marginLeft: 'auto',
          background: '#ef4444',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '6px 16px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </nav>
  );
}