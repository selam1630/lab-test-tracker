import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Home() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage('Welcome to Lab Test Result Tracker'));
  }, []);

  const features = [
    {
      title: 'Patient Management',
      description:
        'Maintain comprehensive patient records with intuitive interfaces designed for healthcare professionals. Access complete medical histories, demographics, and contact information in one centralized system.',
      color: '#667eea'
    },
    {
      title: 'Test Tracking',
      description:
        'Record and monitor laboratory tests with precision. Track test schedules, status updates, and maintain detailed logs of all diagnostic procedures performed.',
      color: '#764ba2'
    },
    {
      title: 'Result Analysis',
      description:
        'Transform raw data into actionable insights. Visualize test results through interactive charts and generate comprehensive reports for informed decision-making.',
      color: '#f093fb'
    },
    {
      title: 'Document Export',
      description:
        'Generate professional documentation with a single click. Export detailed test reports as PDFs, maintaining formatting and compliance standards.',
      color: '#4facfe'
    },
    {
      title: 'Data Security',
      description:
        'Enterprise-grade security measures protect sensitive patient information. Implement role-based access controls and maintain HIPAA compliance standards.',
      color: '#43e97b'
    },
    {
      title: 'Performance Optimized',
      description:
        'Built for speed and reliability. Experience seamless performance even with large datasets, ensuring quick access to critical information when you need it most.',
      color: '#fa709a'
    }
  ];

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Tests Conducted',
        data: [300, 500, 400, 700, 600, 800],
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#fff' } }
    },
    scales: {
      x: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      y: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f3f4f6',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background accents */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '500px',
          height: '500px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '400px',
          height: '400px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }}
      />

      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <span
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#3b82f6'
              }}
            >
              LabTracker
            </span>
          </Link>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/login">
              <button
                style={{
                  padding: '10px 24px',
                  background: 'transparent',
                  color: '#3b82f6',
                  border: '2px solid #3b82f6',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#3b82f6';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#3b82f6';
                }}
              >
                Sign In
              </button>
            </Link>
            <Link href="/register">
              <button
                style={{
                  padding: '10px 24px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                }}
              >
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 24px',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 'bold',
              color: '#1f2937'
            }}
          >
            Lab Test Result Tracker
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
              color: '#4b5563',
              maxWidth: '700px',
              margin: '0 auto 40px',
              lineHeight: '1.6'
            }}
          >
            Streamline your laboratory workflow with our comprehensive test
            result management system. Track patients, manage tests, and generate
            professional reports effortlessly.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            <Link href="/register">
              <button
                style={{
                  padding: '16px 32px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                }}
              >
                Get Started Free
              </button>
            </Link>
            <Link href="/login">
              <button
                style={{
                  padding: '16px 32px',
                  background: 'transparent',
                  color: '#3b82f6',
                  border: '2px solid #3b82f6',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
            </Link>
          </div>
        </div>

        {/* ✅ New Real-Time Insights Section */}
        <section
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '60px 24px',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: '40px',
              textShadow: '0 3px 10px rgba(0,0,0,0.3)'
            }}
          >
            Real-Time Lab Insights
          </h2>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '30px',
              marginBottom: '60px'
            }}
          >
            {[
              { label: 'Active Patients', value: 1240 },
              { label: 'Pending Tests', value: 320 },
              { label: 'Completed Reports', value: 980 }
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '30px 40px',
                  minWidth: '240px',
                  boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease'
                }}
              >
                <h3
                  style={{
                    fontSize: '2.5rem',
                    margin: 0,
                    color: '#fff'
                  }}
                >
                  {stat.value.toLocaleString()}
                </h3>
                <p
                  style={{
                    marginTop: '8px',
                    color: 'rgba(255,255,255,0.85)'
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div
            style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '20px',
              maxWidth: '700px',
              margin: '0 auto',
              boxShadow: '0 6px 30px rgba(0,0,0,0.3)'
            }}
          >
            <Bar data={chartData} options={chartOptions} />
          </div>
        </section>

        {/* Features Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '32px',
            marginTop: '100px',
            marginBottom: '40px',
            maxWidth: '1200px',
            marginLeft: 'auto',
            marginRight: 'auto',
            padding: '0 24px'
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '0',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.12)';
                const accentBar = e.currentTarget.querySelector('.accent-bar');
                const bottomAccent = e.currentTarget.querySelector('.bottom-accent');
                if (accentBar) {
                  accentBar.style.width = '100%';
                  accentBar.style.opacity = '0.9';
                }
                if (bottomAccent) {
                  bottomAccent.style.width = '120px';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.08)';
                const accentBar = e.currentTarget.querySelector('.accent-bar');
                const bottomAccent = e.currentTarget.querySelector('.bottom-accent');
                if (accentBar) {
                  accentBar.style.width = '5px';
                  accentBar.style.opacity = '1';
                }
                if (bottomAccent) {
                  bottomAccent.style.width = '70px';
                }
              }}
            >
              {/* Left Accent Bar */}
              <div 
                className="accent-bar"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '5px',
                  background: `linear-gradient(180deg, ${feature.color} 0%, ${feature.color}cc 100%)`,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: '20px 0 0 20px',
                  opacity: '1'
                }}
              />
              
              {/* Card Content */}
              <div style={{ 
                padding: '40px 36px 36px 36px', 
                position: 'relative',
                flex: '1',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Number Badge */}
                <div style={{
                  position: 'absolute',
                  top: '28px',
                  right: '28px',
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${feature.color}12 0%, ${feature.color}20 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8125rem',
                  fontWeight: '700',
                  color: feature.color,
                  border: `1.5px solid ${feature.color}25`,
                  letterSpacing: '0.05em'
                }}>
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: '0 0 16px 0',
                  lineHeight: '1.3',
                  letterSpacing: '-0.02em',
                  paddingRight: '60px'
                }}>
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p style={{
                  fontSize: '0.9375rem',
                  color: '#475569',
                  margin: 0,
                  lineHeight: '1.75',
                  fontWeight: '400',
                  letterSpacing: '0.01em',
                  flex: '1'
                }}>
                  {feature.description}
                </p>

                {/* Bottom Accent Line */}
                <div 
                  className="bottom-accent"
                  style={{
                    marginTop: '28px',
                    height: '3px',
                    width: '70px',
                    background: `linear-gradient(90deg, ${feature.color} 0%, ${feature.color}88 50%, transparent 100%)`,
                    borderRadius: '2px',
                    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              </div>
            </div>
          ))}
      </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: 'white',
          borderTop: '1px solid #e5e7eb',
          padding: '40px 24px',
          marginTop: '80px',
          textAlign: 'center'
        }}
      >
        <p
          style={{
            color: '#6b7280',
            fontSize: '0.95rem'
          }}
        >
          © {new Date().getFullYear()} Lab Test Result Tracker. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
