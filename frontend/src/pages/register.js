import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { register } from '../utils/api';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const res = await register(form);
    if (res.id) {
      setMessage('✅ Registration successful! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } else {
      setMessage(res.message || '❌ Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f4f6',
      padding: '20px'
    }}>
      {/* Navigation Header */}
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
        <Link href="/login">
          <button style={{
            padding: '8px 20px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
          }}
          >
            Sign In
          </button>
        </Link>
      </header>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '450px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          padding: '40px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
         
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            Create Account
          </h1>
          <p style={{
            color: '#6b7280',
            margin: 0,
            fontSize: '0.95rem'
          }}>
            Join us to manage lab test results
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#374151',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>
              Full Name
            </label>
            <input
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                background: '#f9fafb'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.background = '#fff';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = '#f9fafb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#374151',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                background: '#f9fafb'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.background = '#fff';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = '#f9fafb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#374151',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                background: '#f9fafb'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.background = '#fff';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = '#f9fafb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading 
                ? '#9ca3af' 
                : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading 
                ? 'none' 
                : '0 4px 15px rgba(59, 130, 246, 0.3)',
              marginBottom: '20px'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
              }
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div style={{
            padding: '12px',
            borderRadius: '10px',
            textAlign: 'center',
            marginBottom: '20px',
            fontSize: '0.9rem',
            background: message.includes('✅') || message.includes('successful')
              ? '#d1fae5'
              : '#fee2e2',
            color: message.includes('✅') || message.includes('successful')
              ? '#065f46'
              : '#991b1b',
            border: `1px solid ${message.includes('✅') || message.includes('successful') ? '#10b981' : '#ef4444'}`
          }}>
            {message}
          </div>
        )}

        {/* Login Link */}
        <div style={{
          textAlign: 'center',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{
            color: '#6b7280',
            margin: 0,
            fontSize: '0.9rem'
          }}>
            Already have an account?{' '}
            <Link href="/login" style={{
              color: '#3b82f6',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#2563eb'}
            onMouseLeave={(e) => e.target.style.color = '#3b82f6'}
            >
              Sign In
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}