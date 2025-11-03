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

// --- 🎨 Consistent Styles and Colors ---
const PRIMARY_COLOR = '#3b82f6'; // Tailwind Blue-500
const SECONDARY_COLOR = '#22c55e'; // Tailwind Green-500
const PAGE_BACKGROUND = '#f8fafc'; // Matches the overall background for Neumorphism
const PRIMARY_GRADIENT = 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)';
const DARK_BG_GRADIENT = 'linear-gradient(135deg, #172554 0%, #1e3a8a 100%)';

// --- ⚙️ Keyframe Style for Gradient Text Animation (CSS-in-JS) ---
const keyframesStyle = `
  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

export default function Home() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Inject keyframes style globally (Note: In a real Next.js app, use a <style jsx> block or CSS file)
    if (typeof window !== 'undefined' && !document.getElementById('gradient-style')) {
        const style = document.createElement('style');
        style.id = 'gradient-style';
        style.innerHTML = keyframesStyle;
        document.head.appendChild(style);
    }

    fetch('http://localhost:5000/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage('Welcome to Lab Test Result Tracker'));
  }, []);

  const features = [
    {
      title: 'Patient Management',
      description: 'Maintain comprehensive patient records with intuitive interfaces designed for healthcare professionals. Access complete medical histories, demographics, and contact information.',
      color: '#3b82f6' // Primary Blue
    },
    {
      title: 'Test Tracking',
      description: 'Record and monitor laboratory tests with precision. Track test schedules, status updates, and maintain detailed logs of all diagnostic procedures performed.',
      color: '#22c55e' // Secondary Green
    },
    {
      title: 'Result Analysis',
      description: 'Transform raw data into actionable insights. Visualize test results through interactive charts and generate comprehensive reports for informed decision-making.',
      color: '#f59e0b' // Amber/Yellow
    },
    {
      title: 'Document Export',
      description: 'Generate professional documentation with a single click. Export detailed test reports as PDFs, maintaining formatting and compliance standards.',
      color: '#6366f1' // Indigo
    },
    {
      title: 'Data Security',
      description: 'Enterprise-grade security measures protect sensitive patient information. Implement role-based access controls and maintain HIPAA compliance standards.',
      color: '#ef4444' // Danger Red
    },
    {
      title: 'Performance Optimized',
      description: 'Built for speed and reliability. Experience seamless performance even with large datasets, ensuring quick access to critical information when you need it most.',
      color: '#14b8a6' // Teal
    }
  ];

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Tests Conducted',
        data: [300, 500, 400, 700, 600, 800],
        backgroundColor: PRIMARY_COLOR, // Using Primary Color for bars now
        hoverBackgroundColor: SECONDARY_COLOR,
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 8,
        barThickness: 25 
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow container to control height
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: DARK_BG_GRADIENT.split(', ')[0], // Dark background for tooltip
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        cornerRadius: 6,
      }
    },
    scales: {
      x: {
        ticks: { color: 'rgba(55, 65, 81, 0.8)', font: { size: 14 } }, // Dark text for light background
        grid: { display: false }
      },
      y: {
        ticks: { color: 'rgba(55, 65, 81, 0.8)', font: { size: 14 } },
        grid: { color: 'rgba(0,0,0,0.1)', borderDash: [5, 5] } // Light grid lines
      }
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PAGE_BACKGROUND, 
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      
      {/* --- Floating Background Accents --- */}
      <div
        style={{
          position: 'absolute', top: '-150px', right: '50px', width: '600px', height: '600px',
          background: PRIMARY_COLOR, opacity: 0.1, borderRadius: '50%', filter: 'blur(100px)', zIndex: 0
        }}
      />
      
      {/* --- Sticky Header (NavBar) --- */}
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)', boxShadow: '0 2px 15px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div
          style={{
            maxWidth: '1200px', margin: '0 auto', padding: '16px 24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}
        >
          {/* Logo/Brand */}
          <Link
            href="/"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <span
              style={{
                fontSize: '1.5rem', fontWeight: '900',
                background: PRIMARY_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
              }}
            >
              🔬 LabTracker
            </span>
          </Link>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/login">
              <button
                style={{
                  padding: '10px 20px', background: 'transparent', color: PRIMARY_COLOR,
                  border: `2px solid ${PRIMARY_COLOR}`, borderRadius: '10px', fontSize: '0.95rem',
                  fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => { e.target.style.background = PRIMARY_COLOR; e.target.style.color = 'white'; }}
                onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = PRIMARY_COLOR; }}
              >
                Sign In
              </button>
            </Link>
            <Link href="/register">
              <button
                style={{
                  padding: '10px 20px', background: PRIMARY_GRADIENT, color: 'white',
                  border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '600',
                  cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: `0 4px 15px ${PRIMARY_COLOR}30`
                }}
                onMouseEnter={(e) => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = `0 6px 20px ${PRIMARY_COLOR}50`; }}
                onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 4px 15px ${PRIMARY_COLOR}30`; }}
              >
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1, paddingBottom: '80px' }}>

        {/* --- Hero Section (Split Layout) --- */}
        <section
          style={{
            maxWidth: '1200px', margin: '0 auto', padding: '80px 24px 40px',
            display: 'flex', gap: '40px', alignItems: 'center',
            flexDirection: 'column', // Stacked by default
            '@media (min-width: 1024px)': { // Side-by-side on large screens
                flexDirection: 'row',
            }
          }}
        >
            {/* Left Column: Text & CTA */}
            <div style={{ flex: 1, textAlign: 'center', '@media (min-width: 1024px)': { textAlign: 'left' } }}>
                <p style={{
                    color: PRIMARY_COLOR, fontWeight: 700, marginBottom: '10px',
                    fontSize: '1rem', letterSpacing: '0.05em'
                }}>
                    {message}
                </p>
                <h1
                    style={{
                        fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: '900', color: '#0f172a',
                        lineHeight: '1.1', marginBottom: '20px'
                    }}
                >
                    Streamline Lab Management with 
                    <span 
                        style={{ 
                            background: PRIMARY_GRADIENT, 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent',
                            // Add Animation
                            backgroundSize: '200% auto',
                            animation: 'gradient-shift 5s ease-in-out infinite'
                        }}
                    > 
                        Real-Time Insights
                    </span>
                </h1>
                <p
                    style={{
                        fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: '#475569',
                        maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6',
                        '@media (min-width: 1024px)': { margin: '0 0 40px 0' }
                    }}
                >
                    The comprehensive system designed for modern laboratories to **track patients, manage diagnostic tests, and generate professional reports** effortlessly and securely.
                </p>
                <div
                    style={{
                        display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap',
                        '@media (min-width: 1024px)': { justifyContent: 'flex-start' }
                    }}
                >
                    <Link href="/register">
                        <button
                            style={{
                                padding: '18px 36px', background: PRIMARY_GRADIENT, color: 'white',
                                border: 'none', borderRadius: '12px', fontSize: '1.15rem', fontWeight: '700',
                                cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: `0 8px 25px ${PRIMARY_COLOR}50`
                            }}
                            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = `0 10px 30px ${PRIMARY_COLOR}70`; }}
                            onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 8px 25px ${PRIMARY_COLOR}50`; }}
                        >
                            Start Free Trial
                        </button>
                    </Link>
                    <Link href="/features">
                        <button
                            style={{
                                padding: '18px 36px', background: 'transparent', color: PRIMARY_COLOR,
                                border: `2px solid ${PRIMARY_COLOR}`, borderRadius: '12px', fontSize: '1.15rem',
                                fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => { e.target.style.background = `${PRIMARY_COLOR}10`; }}
                            onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
                        >
                            View Features
                        </button>
                    </Link>
                </div>
            </div>

            <div
  style={{
    flex: 1,
    width: '100%',
    maxWidth: '500px',
    height: '250px', 
    background: 'white',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  }}
>
  <h3
    style={{
      fontSize: '1.1rem',
      fontWeight: 600,
      color: '#0f172a',
      marginBottom: '10px',
      textAlign: 'center',
    }}
  >
    Tests Conducted (Monthly)
  </h3>

  {/* Chart container with fixed aspect ratio */}
  <div style={{ flexGrow: 1, position: 'relative', height: '100%' }}>
    <Bar
      data={chartData}
      options={{
        ...chartOptions,
        maintainAspectRatio: true,
        aspectRatio: 2, 
      }}
    />
  </div>
</div>


        </section>

        {/* --- Features Grid (Neumorphic Cards) --- */}
        <section style={{ padding: '40px 24px 100px 24px' }}>
            <h2 style={{
                fontSize: '2.5rem', fontWeight: '700', color: '#0f172a',
                textAlign: 'center', marginBottom: '60px'
            }}>
                Core Features Built for Excellence
            </h2>

            <div
                style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '32px', maxWidth: '1200px', margin: '0 auto'
                }}
            >
                {features.map((feature, index) => (
                    <div
                        key={index}
                        // NEUMORPHIC CARD STYLE
                        style={{
                            background: PAGE_BACKGROUND, // Key for Neumorphism is matching background
                            borderRadius: '20px',
                            // The soft, 'pushed-out' shadow
                            boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
                            border: 'none',
                            position: 'relative', overflow: 'hidden',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%',
                            willChange: 'transform, box-shadow' 
                        }}
                        onMouseEnter={(e) => {
                            // Pressed-in effect on hover (inverted shadows)
                            e.currentTarget.style.boxShadow = 'inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff';
                            e.currentTarget.style.transform = 'translateY(0)'; // Remove lift
                        }}
                        onMouseLeave={(e) => {
                            // Return to pushed-out state
                            e.currentTarget.style.boxShadow = '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        {/* Corner Icon/Accent (KEPT FOR COLOR) */}
                        <div 
                            style={{
                                position: 'absolute', top: 0, right: 0, 
                                width: '60px', height: '60px', 
                                background: feature.color, 
                                opacity: 0.05, // Reduced opacity to keep it subtle
                                borderBottomLeftRadius: '100%'
                            }}
                        />
                        
                        {/* Card Content */}
                        <div style={{ 
                            padding: '40px 36px 36px 36px', flex: '1', display: 'flex', flexDirection: 'column'
                        }}>
                            {/* Icon/Number Badge */}
                            <div style={{
                                width: '50px', height: '50px', marginBottom: '20px', borderRadius: '12px',
                                background: PAGE_BACKGROUND, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: '1.2rem', color: feature.color,
                                border: 'none', fontWeight: '900',
                                // Neumorphic style for badge/icon
                                boxShadow: '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff',
                            }}>
                                {String(index + 1)}
                            </div>

                            {/* Title */}
                            <h3 style={{
                                fontSize: '1.6rem', fontWeight: '700', color: '#0f172a',
                                margin: '0 0 16px 0', lineHeight: '1.3'
                            }}>
                                {feature.title}
                            </h3>
                            
                            {/* Description */}
                            <p style={{
                                fontSize: '1rem', color: '#475569', margin: 0, lineHeight: '1.7', flex: '1'
                            }}>
                                {feature.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          background: 'white', borderTop: '1px solid #e5e7eb',
          padding: '40px 24px', textAlign: 'center'
        }}
      >
        <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
          © {new Date().getFullYear()} LabTracker. All rights reserved.
        </p>
      </footer>
    </div>
  );
}