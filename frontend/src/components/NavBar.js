"use client";
import Link from "next/link";
import { useState } from "react";

const PRIMARY_COLOR = "#3b82f6";
const PRIMARY_GRADIENT = "linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)";

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <header
      style={{
        width: "100vw",              
        position: "fixed",           
        top: 0,
        left: 0,
        zIndex: 1000,
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 2px 15px rgba(0,0,0,0.05)",
        padding: "0",                
        margin: "0",                 
      }}
    >
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 60px",       
          maxWidth: "100%",            
          margin: "0 auto",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              background: PRIMARY_GRADIENT,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% auto",
              animation: "gradientShift 5s ease infinite",
            }}
          >
            LabTracker
          </span>
        </Link>

        {/* Menu */}
        <div className="desktop-menu" style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <Link
            href="/dashboard"
            style={{
              color: "#1e3a8a",
              fontWeight: 600,
              fontSize: "0.95rem",
              textDecoration: "none",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = PRIMARY_COLOR)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#1e3a8a")}
          >
            Dashboard
          </Link>

          <button
            onClick={handleLogout}
            style={{
              padding: "8px 20px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 10px rgba(239, 68, 68, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 14px rgba(239, 68, 68, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 10px rgba(239, 68, 68, 0.3)";
            }}
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-toggle"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "none",
            fontSize: "1.6rem",
          }}
        >
          ☰
        </button>
      </nav>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div
          style={{
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(10px)",
            borderTop: "1px solid rgba(0,0,0,0.05)",
            padding: "16px 30px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <Link href="/dashboard" style={{ color: "#1e3a8a", fontWeight: 600 }}>
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            style={{
              background: PRIMARY_GRADIENT,
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: `0 4px 12px ${PRIMARY_COLOR}40`,
            }}
          >
            Logout
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @media (max-width: 768px) {
          .desktop-menu {
            display: none;
          }
          .mobile-toggle {
            display: block;
          }
        }
      `}</style>
    </header>
  );
}
