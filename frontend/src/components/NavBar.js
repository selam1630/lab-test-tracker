import Link from 'next/link';

export default function NavBar() {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      maxWidth: '1200px',
      margin: '0 auto 20px auto',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '12px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: '#3b82f6'
        }}>
          LabTracker
        </span>
      </Link>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <span style={{ 
            cursor: 'pointer', 
            color: '#3b82f6', 
            fontWeight: 500,
            fontSize: '0.9rem',
            padding: '6px 12px',
            borderRadius: '6px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#eff6ff';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
          }}
          >
            Dashboard
          </span>
        </Link>
        <button
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
          style={{
            padding: '8px 20px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}