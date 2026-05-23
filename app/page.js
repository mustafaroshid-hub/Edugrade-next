"use client";
import { useEffect, useState, useCallback, useRef } from "react";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAO8YIGatrM_OsiDYKOpObnCDyz5cbssm4",
  authDomain: "edugrade-42851.firebaseapp.com",
  projectId: "edugrade-42851",
  storageBucket: "edugrade-42851.firebasestorage.app",
  messagingSenderId: "966927749579",
  appId: "1:966927749579:web:1b3aa2aa1746d3b2548057",
  measurementId: "G-SBFNGBGCD6"
};

const ADMIN_EMAIL = "mustafaroshid@gmail.com";

const DEFAULT_GRADING = [
  { min:80, gp:5, grade:"A+" }, { min:70, gp:4, grade:"A" },
  { min:60, gp:3.5, grade:"A-" }, { min:50, gp:3, grade:"B" },
  { min:40, gp:2, grade:"C" }, { min:33, gp:1, grade:"D" }, { min:0, gp:0, grade:"F" },
];
const makeGetGP = (scale) => (m) => {
  for (const r of [...(scale||DEFAULT_GRADING)].sort((a,b)=>b.min-a.min)) if (m>=r.min) return r.gp;
  return 0;
};
const makeGetGrade = (scale) => (g) => {
  for (const r of [...(scale||DEFAULT_GRADING)].sort((a,b)=>b.gp-a.gp)) if (g>=r.gp) return r.grade;
  return "F";
};
const getGP    = makeGetGP(null);
const getGrade = makeGetGrade(null);
const gradeColor = (g) =>
  g === "A+" ? "#0ea5e9" : g === "A" ? "#0284c7" : g === "A-" ? "#0369a1"
  : g === "B" ? "#6366f1" : g === "C" ? "#f59e0b" : g === "D" ? "#fb923c" : "#ef4444";

const getMeritRank = (students) =>
  [...students]
    .sort((a, b) => b.gpa - a.gpa || b.total - a.total)
    .reduce((acc, s, i) => { acc[s.roll] = i + 1; return acc; }, {});

// ─── CSS ─────────────────────────────────────────────────────────────────────
const GlobalStyle = ({ dark }) => {
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:       ${dark ? "#060d19" : "#f0f4f9"};
      --surface:  ${dark ? "#0d1626" : "#ffffff"};
      --surface2: ${dark ? "#111e30" : "#f5f8fc"};
      --surface3: ${dark ? "#172338" : "#eaeff6"};
      --border:   ${dark ? "#1e2f47" : "#dde4ef"};
      --text:     ${dark ? "#e2e8f5" : "#0b1729"};
      --text2:    ${dark ? "#5b7299" : "#7a8ea8"};
      --text3:    ${dark ? "#354d6e" : "#a8b8cc"};
      --sky:      #0ea5e9;
      --sky2:     #38bdf8;
      --sky3:     #0284c7;
      --sky4:     #075985;
      --indigo:   #6366f1;
      --green:    #10b981;
      --red:      #ef4444;
      --yellow:   #f59e0b;
      --amber:    #f97316;
      --glow:     ${dark ? "rgba(14,165,233,0.15)" : "rgba(14,165,233,0.1)"};
      --font-sans: 'Sora', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    body {
      background: var(--bg); color: var(--text);
      font-family: var(--font-sans); min-height: 100vh;
      transition: background 0.4s, color 0.4s;
      -webkit-font-smoothing: antialiased;
    }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

    input[type="text"], input[type="number"], input[type="email"], input[type="password"], input:not([type]) {
      width: 100%; padding: 11px 14px; border-radius: 10px;
      border: 1.5px solid var(--border); background: var(--surface2);
      color: var(--text); font-family: var(--font-sans); font-size: 13.5px;
      font-weight: 400; outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    }
    input:focus {
      border-color: var(--sky);
      background: var(--surface);
      box-shadow: 0 0 0 3px var(--glow);
    }
    input::placeholder { color: var(--text3); }
    button { cursor: pointer; font-family: var(--font-sans); }
    table { width: 100%; border-collapse: collapse; }
    th {
      background: var(--surface2); color: var(--text2);
      font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase; padding: 10px 14px; text-align: left;
      white-space: nowrap; border-bottom: 1.5px solid var(--border);
    }
    td { padding: 11px 14px; border-bottom: 1px solid var(--border); font-size: 13px; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: color-mix(in srgb, var(--sky) 4%, transparent); }

    @keyframes up { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
    @keyframes splashIn { 0%{opacity:0;transform:scale(0.6);}60%{transform:scale(1.06);}100%{opacity:1;transform:scale(1);} }
    @keyframes splashOut { 0%{opacity:1;transform:scale(1);}100%{opacity:0;transform:scale(1.3);} }
    @keyframes toastPop { 0%{opacity:0;transform:translateX(-50%) translateY(-10px) scale(0.92);}100%{opacity:1;transform:translateX(-50%) translateY(0) scale(1);} }
    @keyframes spin { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
    @keyframes badgePop { 0%{transform:scale(0);}70%{transform:scale(1.2);}100%{transform:scale(1);} }
    @keyframes fadeIn { from{opacity:0;}to{opacity:1;} }
    @keyframes pulseGlow {
      0%,100% { box-shadow: 0 0 0 0 rgba(14,165,233,0); }
      50% { box-shadow: 0 0 20px 6px rgba(14,165,233,0.18); }
    }
    @keyframes shimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    @keyframes orbit {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes counterOrbit {
      from { transform: rotate(0deg); }
      to { transform: rotate(-360deg); }
    }
    @keyframes floatUp {
      0%,100% { transform: translateY(0px); }
      50% { transform: translateY(-6px); }
    }
    @keyframes gradientShift {
      0%,100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    .hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
    .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }

    .project-card { transition: all 0.2s; }
    .project-card:hover { border-color: color-mix(in srgb, var(--sky) 40%, var(--border)) !important; }

    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  `;
  return <style>{css}</style>;
};

// ─── EduGrade Logo SVG Component ─────────────────────────────────────────────
const EduGradeLogo = ({ size = 44, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    {/* Graduation cap shape */}
    <rect width="44" height="44" rx="12" fill="url(#logoGrad)" />
    {/* Book pages */}
    <rect x="9" y="14" width="11" height="16" rx="2" fill="rgba(255,255,255,0.25)" />
    <rect x="11" y="14" width="11" height="16" rx="2" fill="rgba(255,255,255,0.35)" />
    {/* Star/sparkle top right */}
    <circle cx="33" cy="12" r="3" fill="rgba(255,255,255,0.9)" />
    <path d="M33 9v6M30 12h6" stroke="rgba(14,165,233,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Check mark */}
    <path d="M19 22.5l2.5 2.5 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Bottom bar */}
    <rect x="9" y="33" width="26" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
    <rect x="9" y="33" width="18" height="3" rx="1.5" fill="rgba(255,255,255,0.6)" />
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38bdf8"/>
        <stop offset="100%" stopColor="#0369a1"/>
      </linearGradient>
    </defs>
  </svg>
);

// ─── Primitives ───────────────────────────────────────────────────────────────
const Card = ({ children, style = {}, animate, glass }) => (
  <div style={{
    background: glass ? "color-mix(in srgb, var(--surface) 88%, transparent)" : "var(--surface)",
    border: "1.5px solid var(--border)",
    borderRadius: 18,
    padding: 20,
    animation: animate ? "up 0.3s ease" : "none",
    backdropFilter: glass ? "blur(16px)" : "none",
    ...style,
  }}>{children}</div>
);

const Label = ({ children }) => (
  <div style={{
    fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
    color: "var(--text2)", marginBottom: 8
  }}>{children}</div>
);

const Btn = ({ children, onClick, variant = "primary", style = {}, disabled, loading, size = "md" }) => {
  const sizes = {
    sm: { padding: "6px 13px", fontSize: 11.5, borderRadius: 9 },
    md: { padding: "11px 20px", fontSize: 13.5, borderRadius: 11 },
    lg: { padding: "14px 24px", fontSize: 14.5, borderRadius: 13 },
  };
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    border: "none", fontWeight: 700,
    transition: "all 0.18s", cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.5 : 1, letterSpacing: "0.01em",
    ...sizes[size],
  };
  const v = {
    primary: {
      background: "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)",
      color: "#fff",
      boxShadow: "0 4px 16px rgba(14,165,233,0.35)",
    },
    secondary: {
      background: "var(--surface2)", color: "var(--text)",
      border: "1.5px solid var(--border)"
    },
    danger: {
      background: "color-mix(in srgb,var(--red) 10%,transparent)", color: "var(--red)",
      border: "1.5px solid color-mix(in srgb,var(--red) 22%,transparent)"
    },
    ghost: {
      background: "transparent", color: "var(--text2)",
      border: "1.5px solid var(--border)"
    },
    sky: {
      background: "color-mix(in srgb,var(--sky) 12%,transparent)",
      color: "var(--sky)", border: "1.5px solid color-mix(in srgb,var(--sky) 28%,transparent)"
    },
    green: {
      background: "color-mix(in srgb,var(--green) 12%,transparent)",
      color: "var(--green)", border: "1.5px solid color-mix(in srgb,var(--green) 28%,transparent)"
    },
  };
  return (
    <button style={{ ...base, ...v[variant], ...style }} onClick={onClick} disabled={disabled || loading}>
      {loading
        ? <span style={{ animation: "spin 0.7s linear infinite", display: "inline-block", fontSize: 16 }}>⟳</span>
        : children}
    </button>
  );
};

const Pill = ({ children, color }) => (
  <span style={{
    display: "inline-block", padding: "2px 9px", borderRadius: 20,
    fontSize: 10.5, fontWeight: 700,
    background: `color-mix(in srgb,${color} 13%,transparent)`, color,
  }}>{children}</span>
);

const Toast = ({ msg }) => (
  <div style={{
    position: "fixed", top: 22, left: "50%", transform: "translateX(-50%)",
    background: "var(--surface)", border: "1.5px solid var(--border)",
    color: "var(--text)", padding: "10px 22px", borderRadius: 40, fontSize: 13,
    fontWeight: 600, zIndex: 9999, boxShadow: "0 12px 40px rgba(0,0,0,0.28)",
    animation: "toastPop 0.24s cubic-bezier(0.34,1.56,0.64,1)", whiteSpace: "nowrap",
    display: "flex", alignItems: "center", gap: 8,
  }}>{msg}</div>
);

const StatTile = ({ label, value, color, style = {}, onClick, actionLabel }) => (
  <div style={{
    background: "var(--surface2)", border: "1.5px solid var(--border)",
    borderRadius: 14, padding: "14px 16px", flex: 1, ...style
  }}>
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase",
      color: "var(--text2)", marginBottom: 7
    }}>{label}</div>
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
      <div style={{
        fontSize: 26, fontWeight: 800, color: color || "var(--sky)",
        fontFamily: "var(--font-mono)",
        lineHeight: 1,
      }}>{value}</div>
      {onClick && (
        <button onClick={onClick} style={{
          padding: "5px 11px", borderRadius: 8,
          border: "1.5px solid var(--border)",
          background: "var(--surface)", color: "var(--sky)",
          fontSize: 10.5, fontWeight: 700,
          cursor: "pointer", transition: "all 0.15s",
          flexShrink: 0, whiteSpace: "nowrap",
        }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "color-mix(in srgb,var(--sky) 10%,var(--surface))";
            e.currentTarget.style.borderColor = "var(--sky)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "var(--surface)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          {actionLabel || "View →"}
        </button>
      )}
    </div>
  </div>
);

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{
      width: 36, height: 36,
      border: "3px solid var(--border)", borderTop: "3px solid var(--sky)",
      borderRadius: "50%", animation: "spin 0.8s linear infinite"
    }} />
  </div>
);

const SectionHeader = ({ label, title, subtitle }) => (
  <div style={{ marginBottom: 24 }}>
    {label && (
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
        color: "var(--sky)", marginBottom: 7,
        display: "flex", alignItems: "center", gap: 7,
      }}>
        <span style={{
          display: "inline-block", width: 20, height: 2,
          background: "linear-gradient(90deg, var(--sky), transparent)", borderRadius: 2
        }} />
        {label}
      </div>
    )}
    {title && <h2 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.15, marginBottom: 4, letterSpacing: "-0.02em" }}>{title}</h2>}
    {subtitle && <p style={{ color: "var(--text2)", fontSize: 13 }}>{subtitle}</p>}
  </div>
);

// ─── Student List Modal ───────────────────────────────────────────────────────
const StudentListModal = ({ title, students, color, onClose }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 6000,
    background: "rgba(0,0,0,0.6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(8px)", padding: "20px 16px",
  }} onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{
      background: "var(--surface)", border: "1.5px solid var(--border)",
      borderRadius: 22, width: "100%", maxWidth: 400,
      maxHeight: "72vh", display: "flex", flexDirection: "column",
      animation: "up 0.26s cubic-bezier(0.34,1.56,0.64,1)",
      boxShadow: "0 28px 80px rgba(0,0,0,0.4)",
    }}>
      <div style={{
        padding: "18px 20px",
        borderBottom: "1.5px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <div style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color, marginBottom: 4
          }}>{title}</div>
          <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>
            {students.length} Student{students.length !== 1 ? "s" : ""}
          </div>
        </div>
        <button onClick={onClose} style={{
          width: 32, height: 32, borderRadius: "50%",
          border: "1.5px solid var(--border)",
          background: "var(--surface2)", color: "var(--text2)",
          fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center",
        }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
        {students.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text2)", padding: "30px 0", fontSize: 13 }}>
            No students in this category
          </div>
        ) : students.map((s, i) => (
          <div key={s.roll} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 14px", borderRadius: 12, marginBottom: 7,
            background: "var(--surface2)", border: "1.5px solid var(--border)",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
              background: `color-mix(in srgb,${color} 18%,transparent)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, color,
            }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
              <div style={{ color: "var(--text2)", fontSize: 11 }}>Roll: {s.roll}</div>
            </div>
            <Pill color={color}>{s.grade}</Pill>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Blocked Modal ────────────────────────────────────────────────────────────
const BlockedModal = ({ onSignOut }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 99999,
    background: "rgba(0,0,0,0.8)",
    display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(8px)",
  }}>
    <Card style={{ maxWidth: 340, textAlign: "center", animation: "splashIn 0.4s ease", padding: 32 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
      <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 10, letterSpacing: "-0.02em" }}>Account Blocked</h2>
      <p style={{ color: "var(--text2)", fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
        Your account has been blocked by the administrator. Contact your admin for assistance.
      </p>
      <Btn onClick={onSignOut} style={{ width: "100%" }}>Sign Out</Btn>
    </Card>
  </div>
);

// ─── Logo Splash ──────────────────────────────────────────────────────────────
const LogoSplash = ({ onDone }) => {
  const [phase, setPhase] = useState("in");
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("out"), 1900);
    const t2 = setTimeout(() => onDone(), 2350);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "linear-gradient(145deg,#040b16 0%,#081628 60%,#040b16 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      animation: phase === "out" ? "splashOut 0.45s ease forwards" : "none",
    }}>
      {/* Ambient rings */}
      <div style={{
        position: "absolute", width: 320, height: 320, borderRadius: "50%",
        border: "1px solid rgba(14,165,233,0.1)",
        animation: "orbit 8s linear infinite",
      }} />
      <div style={{
        position: "absolute", width: 220, height: 220, borderRadius: "50%",
        border: "1px solid rgba(14,165,233,0.15)",
        animation: "counterOrbit 6s linear infinite",
      }} />
      <div style={{
        position: "absolute", width: 380, height: 380, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(14,165,233,0.08) 0%,transparent 70%)",
        animation: "fadeIn 1s ease",
      }} />

      <div style={{
        position: "relative",
        animation: "splashIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards, floatUp 3s ease-in-out 0.7s infinite",
        marginBottom: 28,
      }}>
        {/* Glow ring */}
        <div style={{
          position: "absolute", inset: -12, borderRadius: "24px",
          background: "conic-gradient(from 0deg, rgba(56,189,248,0.4), rgba(14,165,233,0.1), rgba(56,189,248,0.4))",
          animation: "spin 4s linear infinite", filter: "blur(8px)",
        }} />
        <div style={{
          position: "relative", width: 96, height: 96, borderRadius: 22,
          background: "linear-gradient(145deg, #38bdf8, #0284c7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 40px rgba(14,165,233,0.4), 0 20px 60px rgba(0,0,0,0.5)",
        }}>
          {/* Book icon */}
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <rect x="8" y="10" width="14" height="32" rx="3" fill="rgba(255,255,255,0.3)" />
            <rect x="10" y="10" width="14" height="32" rx="3" fill="rgba(255,255,255,0.45)" />
            <path d="M24 12h14a3 3 0 013 3v26a3 3 0 01-3 3H24V12z" fill="rgba(255,255,255,0.6)" />
            <path d="M30 20l3 3 6-6" stroke="rgba(3,105,161,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M28 30h10M28 35h7" stroke="rgba(3,105,161,0.5)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div style={{
        fontFamily: "'Sora', sans-serif", fontSize: 36, fontWeight: 800,
        background: "linear-gradient(135deg, #7dd3fc, #38bdf8, #0ea5e9)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        letterSpacing: "-0.04em", marginBottom: 8,
        animation: "splashIn 0.6s 0.18s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>EduGrade</div>

      <div style={{
        color: "#2e4a6e", fontSize: 10.5, fontWeight: 600,
        letterSpacing: "0.22em", textTransform: "uppercase",
        animation: "splashIn 0.55s 0.32s ease both",
      }}>Academic Excellence</div>
    </div>
  );
};

// ─── Auth Page ────────────────────────────────────────────────────────────────
const AuthPage = ({ firebase, onAuth, showToast }) => {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || (!password && mode !== "reset")) return showToast("⚠ Fill all fields");
    if (mode === "signup" && !name.trim()) return showToast("⚠ Enter your name");
    if (password.length < 6 && mode !== "reset") return showToast("⚠ Password min 6 chars");
    setLoading(true);
    try {
      if (mode === "login") {
        const cred = await firebase.auth.signInWithEmailAndPassword(email, password);
        const snap = await firebase.db.collection("users").doc(cred.user.uid).get();
        if (snap.exists && snap.data().blocked) {
          await firebase.auth.signOut();
          showToast("🚫 Your account has been blocked");
          setLoading(false); return;
        }
        showToast("✓ Welcome back!");
      } else if (mode === "signup") {
        const cred = await firebase.auth.createUserWithEmailAndPassword(email, password);
        await cred.user.updateProfile({ displayName: name.trim() });
        await firebase.db.collection("users").doc(cred.user.uid).set({
          name: name.trim(), email, createdAt: new Date().toISOString(), blocked: false, uid: cred.user.uid,
        });
        await firebase.db.collection("adminNotifications").add({
          type: "newUser", name: name.trim(), email,
          uid: cred.user.uid, createdAt: new Date().toISOString(), read: false,
        });
        showToast("✓ Account created!");
      } else {
        await firebase.auth.sendPasswordResetEmail(email);
        showToast("✓ Reset email sent"); setMode("login");
      }
    } catch (e) { showToast("✗ " + (e.message?.replace("Firebase: ", "") || "Error")); }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "20px 16px",
      background: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--sky) 8%, transparent) 0%, transparent 60%)",
    }}>
      <div style={{ width: "100%", maxWidth: 380, animation: "up 0.35s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <div style={{
              width: 68, height: 68, borderRadius: 18,
              background: "linear-gradient(135deg, #38bdf8, #0284c7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 28px rgba(14,165,233,0.4)",
              animation: "pulseGlow 3s ease-in-out infinite",
            }}>
              <svg width="42" height="42" viewBox="0 0 52 52" fill="none">
                <rect x="8" y="10" width="14" height="32" rx="3" fill="rgba(255,255,255,0.3)" />
                <rect x="10" y="10" width="14" height="32" rx="3" fill="rgba(255,255,255,0.45)" />
                <path d="M24 12h14a3 3 0 013 3v26a3 3 0 01-3 3H24V12z" fill="rgba(255,255,255,0.6)" />
                <path d="M30 20l3 3 6-6" stroke="rgba(3,105,161,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M28 30h10M28 35h7" stroke="rgba(3,105,161,0.5)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 5, letterSpacing: "-0.03em" }}>EduGrade</h1>
          <p style={{ color: "var(--text2)", fontSize: 13 }}>
            {mode === "login" ? "Sign in to your workspace" : mode === "signup" ? "Create your account" : "Reset your password"}
          </p>
        </div>

        <Card style={{ padding: 26 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "signup" && (
              <div><Label>Full Name</Label>
                <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            <div><Label>Email Address</Label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>
            {mode !== "reset" && (
              <div><Label>Password</Label>
                <input type="password" placeholder="••••••••" value={password}
                  onChange={e => setPass(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              </div>
            )}
            <Btn onClick={handleSubmit} loading={loading} style={{ width: "100%", marginTop: 4 }}>
              {mode === "login" ? "Sign In →" : mode === "signup" ? "Create Account →" : "Send Reset Email →"}
            </Btn>
          </div>

          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
            {mode === "login" && (
              <>
                <button onClick={() => setMode("reset")} style={{
                  background: "none", border: "none", color: "var(--sky)",
                  fontSize: 12, cursor: "pointer", fontWeight: 600
                }}>Forgot password?</button>
                <div style={{ color: "var(--text2)", fontSize: 12.5 }}>
                  No account?{" "}
                  <span style={{ color: "var(--sky)", cursor: "pointer", fontWeight: 700 }}
                    onClick={() => setMode("signup")}>Sign up</span>
                </div>
              </>
            )}
            {mode !== "login" && (
              <div style={{ color: "var(--text2)", fontSize: 12.5 }}>
                <span style={{ color: "var(--sky)", cursor: "pointer", fontWeight: 700 }}
                  onClick={() => setMode("login")}>← Back to Sign In</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── Admin Panel ──────────────────────────────────────────────────────────────
const AdminPanel = ({ firebase, showToast, onClose }) => {
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tab, setTab] = useState("notifs");
  const [loading, setLoading] = useState(true);
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [viewingUser, setViewingUser] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const usersSnap = await firebase.db.collection("users").get();
        setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        const notifsSnap = await firebase.db.collection("adminNotifications")
          .orderBy("createdAt", "desc").limit(50).get();
        setNotifications(notifsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { showToast("✗ " + e.message); }
      setLoading(false);
    };
    loadData();
  }, []);

  const toggleBlock = async (user) => {
    const newBlocked = !user.blocked;
    await firebase.db.collection("users").doc(user.id).update({ blocked: newBlocked });
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, blocked: newBlocked } : u));
    showToast(newBlocked ? "🚫 User blocked" : "✓ User unblocked");
  };

  const markAllRead = async () => {
    const batch = firebase.db.batch();
    notifications.forEach(n => {
      if (!n.read) batch.update(firebase.db.collection("adminNotifications").doc(n.id), { read: true });
    });
    await batch.commit();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast("✓ All marked as read");
  };

  const loadUserFullData = async (user) => {
    try {
      const snap = await firebase.db.collection("users").doc(user.id)
        .collection("projects").orderBy("createdAt", "asc").get();
      const projects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSelectedUserData({ user, projects });
      setSelectedProject(projects.length > 0 ? projects[0] : null);
      setViewingUser(true);
    } catch (e) { showToast("✗ " + e.message); }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (viewingUser && selectedUserData) {
    const u = selectedUserData.user;
    const projects = selectedUserData.projects;
    const meritRanks = selectedProject ? getMeritRank(selectedProject.students) : {};
    const sortedStudents = selectedProject
      ? [...selectedProject.students].sort((a, b) =>
          String(a.roll).localeCompare(String(b.roll), undefined, { numeric: true }))
      : [];

    const stats = (() => {
      if (!selectedProject?.students.length) return { pass: 0, fail: 0, rate: "0.0", avg: "0.00", total: 0 };
      const pass = selectedProject.students.filter(s => s.status === "PASS").length;
      const fail = selectedProject.students.length - pass;
      const avg = (selectedProject.students.reduce((a, s) => a + s.gpa, 0) / selectedProject.students.length).toFixed(2);
      return { pass, fail, rate: ((pass / selectedProject.students.length) * 100).toFixed(1), avg, total: selectedProject.students.length };
    })();

    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 5000, background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        backdropFilter: "blur(8px)",
      }} onClick={e => e.target === e.currentTarget && setViewingUser(false)}>
        <div style={{
          background: "var(--surface)", border: "1.5px solid var(--border)",
          borderRadius: "22px 22px 0 0", width: "100%", maxWidth: 560,
          maxHeight: "92vh", display: "flex", flexDirection: "column",
          animation: "up 0.3s ease", boxShadow: "0 -16px 60px rgba(0,0,0,0.3)",
        }}>
          <div style={{ padding: "18px 20px 0", borderBottom: "1.5px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sky)", marginBottom: 3 }}>
                  👤 Viewing As
                </div>
                <h2 style={{ fontWeight: 800, fontSize: 19, letterSpacing: "-0.02em" }}>{u.name}</h2>
                <div style={{ color: "var(--text2)", fontSize: 12 }}>{u.email}</div>
              </div>
              <button onClick={() => setViewingUser(false)} style={{
                width: 34, height: 34, borderRadius: "50%", border: "1.5px solid var(--border)",
                background: "var(--surface2)", color: "var(--text2)", fontSize: 17,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>×</button>
            </div>
            {projects.length > 0 && (
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
                {projects.map(p => (
                  <button key={p.id} onClick={() => setSelectedProject(p)} style={{
                    padding: "6px 14px", borderRadius: 9, border: "1.5px solid var(--border)",
                    background: selectedProject?.id === p.id ? "linear-gradient(135deg,#38bdf8,#0284c7)" : "var(--surface2)",
                    color: selectedProject?.id === p.id ? "#fff" : "var(--text2)",
                    fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
                  }}>{p.examName}</button>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
            {projects.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text2)", padding: "40px 0", fontSize: 13 }}>No projects yet</div>
            ) : !selectedProject ? null : (
              <>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  {[
                    { label: "Students", value: selectedProject.students.length, color: "var(--sky)" },
                    { label: "Pass Rate", value: `${stats.rate}%`, color: "var(--green)" },
                    { label: "Avg GPA", value: stats.avg, color: "var(--indigo)" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{
                      background: "var(--surface2)", border: "1.5px solid var(--border)",
                      borderRadius: 12, padding: "11px 14px", flex: 1, textAlign: "center"
                    }}>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text2)", marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color, fontFamily: "var(--font-mono)" }}>{value}</div>
                    </div>
                  ))}
                </div>
                {sortedStudents.length === 0 ? (
                  <div style={{ textAlign: "center", color: "var(--text2)", padding: "30px 0", fontSize: 13 }}>No students</div>
                ) : (
                  <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                      <table>
                        <thead><tr>
                          <th style={{ paddingLeft: 14 }}>Name</th>
                          <th>Roll</th><th>Merit</th><th>GPA</th><th>Grade</th><th>Total</th><th>Status</th>
                        </tr></thead>
                        <tbody>
                          {sortedStudents.map(s => {
                            const rank = meritRanks[s.roll];
                            const rankColor = rank === 1 ? "#f59e0b" : rank === 2 ? "#94a3b8" : rank === 3 ? "#cd7c2f" : null;
                            return (
                              <tr key={s.roll}>
                                <td style={{ fontWeight: 600, paddingLeft: 14 }}>{s.name}</td>
                                <td style={{ fontFamily: "var(--font-mono)", color: "var(--text2)", fontSize: 12 }}>{s.roll}</td>
                                <td>
                                  {rankColor ? (
                                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", fontSize: 11, fontWeight: 800, background: rankColor, color: "#fff" }}>{rank}</span>
                                  ) : (
                                    <span style={{ color: "var(--text2)", fontSize: 12, fontFamily: "var(--font-mono)" }}>#{rank}</span>
                                  )}
                                </td>
                                <td style={{ fontWeight: 700, color: gradeColor(s.grade), fontFamily: "var(--font-mono)" }}>{s.gpa}</td>
                                <td><Pill color={gradeColor(s.grade)}>{s.grade}</Pill></td>
                                <td style={{ fontFamily: "var(--font-mono)" }}>{s.total}</td>
                                <td><Pill color={s.status === "PASS" ? "var(--green)" : "var(--red)"}>{s.status}</Pill></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 5000, background: "rgba(0,0,0,0.65)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      backdropFilter: "blur(8px)",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "var(--surface)", border: "1.5px solid var(--border)",
        borderRadius: "22px 22px 0 0", width: "100%", maxWidth: 560,
        maxHeight: "85vh", display: "flex", flexDirection: "column",
        animation: "up 0.3s ease", boxShadow: "0 -16px 60px rgba(0,0,0,0.28)",
      }}>
        <div style={{ padding: "20px 22px 0", borderBottom: "1.5px solid var(--border)", paddingBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--yellow)", marginBottom: 4 }}>
                ⚡ Admin Control
              </div>
              <h2 style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em" }}>Dashboard</h2>
            </div>
            <button onClick={onClose} style={{
              width: 34, height: 34, borderRadius: "50%", border: "1.5px solid var(--border)",
              background: "var(--surface2)", color: "var(--text2)", fontSize: 17,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>×</button>
          </div>
          <div style={{ display: "flex", gap: 4, marginBottom: -1 }}>
            {[["notifs", `Notifications${unreadCount ? ` (${unreadCount})` : ""}`, unreadCount],
              ["users", `Users (${users.length})`, 0]].map(([id, label, badge]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                padding: "9px 16px", borderRadius: "10px 10px 0 0",
                border: "1.5px solid var(--border)",
                borderBottom: tab === id ? "1.5px solid var(--surface)" : "1.5px solid var(--border)",
                background: tab === id ? "var(--surface)" : "var(--surface2)",
                color: tab === id ? "var(--text)" : "var(--text2)",
                fontSize: 12, fontWeight: tab === id ? 700 : 500,
                position: "relative", marginBottom: tab === id ? -1 : 0,
              }}>
                {label}
                {badge > 0 && (
                  <span style={{
                    position: "absolute", top: -6, right: -6,
                    width: 17, height: 17, borderRadius: "50%",
                    background: "var(--red)", color: "#fff", fontSize: 9.5, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "badgePop 0.3s ease",
                  }}>{badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
          {loading ? <Spinner /> : (
            <>
              {tab === "notifs" && (
                <>
                  {unreadCount > 0 && (
                    <div style={{ marginBottom: 12, display: "flex", justifyContent: "flex-end" }}>
                      <Btn variant="secondary" onClick={markAllRead} size="sm">✓ Mark all read</Btn>
                    </div>
                  )}
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: "center", color: "var(--text2)", padding: "40px 0", fontSize: 13 }}>
                      No notifications yet
                    </div>
                  ) : notifications.map(n => (
                    <div key={n.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "11px 14px", borderRadius: 12, marginBottom: 8,
                      background: n.read ? "var(--surface2)" : "color-mix(in srgb,var(--sky) 7%,var(--surface2))",
                      border: `1.5px solid ${n.read ? "var(--border)" : "color-mix(in srgb,var(--sky) 22%,var(--border))"}`,
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                        background: "linear-gradient(135deg,#38bdf8,#0284c7)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, color: "#fff",
                      }}>👤</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{n.name} joined</div>
                        <div style={{ color: "var(--text2)", fontSize: 11.5 }}>{n.email}</div>
                        <div style={{ color: "var(--text3)", fontSize: 10.5, marginTop: 2 }}>
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {!n.read && (
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--sky)", flexShrink: 0 }} />
                      )}
                    </div>
                  ))}
                </>
              )}
              {tab === "users" && users.map(u => (
                <div key={u.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 14px", borderRadius: 12, marginBottom: 8,
                  background: u.blocked ? "color-mix(in srgb,var(--red) 5%,var(--surface2))" : "var(--surface2)",
                  border: `1.5px solid ${u.blocked ? "color-mix(in srgb,var(--red) 20%,var(--border))" : "var(--border)"}`,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: u.blocked ? "color-mix(in srgb,var(--red) 18%,var(--surface))" : "linear-gradient(135deg,#38bdf8,#0284c7)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                  }}>{u.blocked ? "🚫" : "👤"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                      {u.name}
                      {u.email === ADMIN_EMAIL && <Pill color="var(--yellow)">Admin</Pill>}
                      {u.blocked && <Pill color="var(--red)">Blocked</Pill>}
                    </div>
                    <div style={{ color: "var(--text2)", fontSize: 11.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.email}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {u.email !== ADMIN_EMAIL && (
                      <Btn variant={u.blocked ? "secondary" : "danger"} onClick={() => toggleBlock(u)} size="sm" style={{ whiteSpace: "nowrap" }}>
                        {u.blocked ? "Unblock" : "Block"}
                      </Btn>
                    )}
                    <Btn variant="sky" onClick={() => loadUserFullData(u)} size="sm" style={{ whiteSpace: "nowrap" }}>
                      📊 View
                    </Btn>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Dock ─────────────────────────────────────────────────────────────────────
const Dock = ({ page, go, isAdmin, onAdminOpen }) => {
  const tabs = [
    { id: "home", icon: "⌂", label: "Home" },
    { id: "setup", icon: "＋", label: "New" },
    { id: "app", icon: "✎", label: "Entry" },
    { id: "summary", icon: "◈", label: "Stats" },
    { id: "merit", icon: "☰", label: "Merit" },
  ];
  return (
    <nav style={{
      position: "fixed", bottom: 18, left: "50%", transform: "translateX(-50%)",
      display: "flex", gap: 3, padding: "6px 7px", borderRadius: 22,
      background: "var(--surface)",
      border: "1.5px solid var(--border)",
      boxShadow: "0 12px 40px rgba(0,0,0,0.25), 0 2px 0 rgba(255,255,255,0.04) inset",
      zIndex: 1000,
    }}>
      {tabs.map(t => {
        const active = page === t.id;
        return (
          <button key={t.id} onClick={() => go(t.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            padding: "8px 13px", borderRadius: 16, border: "none", minWidth: 50,
            background: active ? "linear-gradient(135deg,#38bdf8,#0284c7)" : "transparent",
            color: active ? "#fff" : "var(--text2)",
            fontSize: 16, transition: "all 0.18s",
            boxShadow: active ? "0 4px 12px rgba(14,165,233,0.4)" : "none",
          }}>
            <span style={{ fontSize: active ? 17 : 16, transition: "all 0.18s" }}>{t.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.05em" }}>{t.label}</span>
          </button>
        );
      })}
      {isAdmin && (
        <button onClick={onAdminOpen} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          padding: "8px 13px", borderRadius: 16, border: "none", minWidth: 50,
          background: "color-mix(in srgb,var(--yellow) 14%,transparent)",
          color: "var(--yellow)", fontSize: 16, transition: "all 0.18s",
        }}>
          <span>⚡</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.05em" }}>Admin</span>
        </button>
      )}
    </nav>
  );
};

// ─── PDF: Marksheet — FIXED & Improved ───────────────────────────────────────
// FIX 1: Removed GPA/Grade from student info section
// FIX 2: Reduced header row height to fit text properly
// FIX 3: Better logo rendering
const downloadMarksheet = async (student, project, showToast) => {
  if (!student) return showToast("⚠ No student selected");
  showToast("⏳ Generating marksheet…");

  const loadScript = (src) => new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement("script");
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });

  try {
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");
  } catch { return showToast("✗ Could not load PDF library"); }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // ── Color Palette ──────────────────────────────────────────────────────────
  const SKY     = [14, 165, 233];
  const SKY_LT  = [224, 242, 254];
  const SKY_MID = [186, 230, 253];
  const SKY_DK  = [3, 105, 161];
  const DARK    = [15, 28, 46];
  const GREY    = [100, 116, 132];
  const LGREY   = [241, 245, 249];
  const WHITE   = [255, 255, 255];
  const GREEN   = [16, 185, 129];
  const RED     = [239, 68, 68];
  const INDIGO  = [99, 102, 241];

  // ── Top accent bar (gradient-like with two rects) ──────────────────────────
  doc.setFillColor(...SKY_DK);
  doc.rect(0, 0, W / 2, 5, "F");
  doc.setFillColor(...SKY);
  doc.rect(W / 2, 0, W / 2, 5, "F");

  // ── Logo — Book icon drawn with jsPDF primitives ───────────────────────────
  const logoX = 14, logoY = 10, logoSize = 16;
  // Outer rounded square
  doc.setFillColor(...SKY);
  doc.roundedRect(logoX, logoY, logoSize, logoSize, 3, 3, "F");
  // Left page of book
  doc.setFillColor(...WHITE);
  doc.setFillColor(255, 255, 255);
  doc.rect(logoX + 2, logoY + 2.5, 5, 10.5, "F");
  // Right page of book
  doc.setFillColor(224, 242, 254);
  doc.rect(logoX + 7.5, logoY + 2.5, 5.5, 10.5, "F");
  // Spine line
  doc.setDrawColor(...SKY_DK);
  doc.setLineWidth(0.6);
  doc.line(logoX + 7.2, logoY + 2.5, logoX + 7.2, logoY + 13);
  // Check mark on right page
  doc.setDrawColor(...SKY_DK);
  doc.setLineWidth(1);
  doc.line(logoX + 8.8, logoY + 8.2, logoX + 10, logoY + 9.5);
  doc.line(logoX + 10, logoY + 9.5, logoX + 12.2, logoY + 6.5);
  // Small star top-right corner of logo square
  doc.setFillColor(255, 255, 255);
  doc.circle(logoX + 13.5, logoY + 2.5, 1.2, "F");

  // ── App Name & Subtitle ────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...DARK);
  doc.text("EduGrade", logoX + logoSize + 4, logoY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GREY);
  doc.text("Student Marksheet", logoX + logoSize + 4, logoY + 12.5);

  // ── Exam badge (top right) ─────────────────────────────────────────────────
  const examLabel = project.examName.length > 24 ? project.examName.slice(0, 24) + "…" : project.examName;
  doc.setFillColor(...SKY_LT);
  doc.roundedRect(W - 62, logoY - 1, 48, 18, 3, 3, "F");
  doc.setDrawColor(...SKY_MID);
  doc.setLineWidth(0.5);
  doc.roundedRect(W - 62, logoY - 1, 48, 18, 3, 3, "S");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GREY);
  doc.text("EXAM", W - 58, logoY + 4.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(examLabel, W - 58, logoY + 11.5);

  // ── Divider ────────────────────────────────────────────────────────────────
  doc.setDrawColor(...SKY_MID);
  doc.setLineWidth(0.5);
  doc.line(14, 31, W - 14, 31);

  // ── STUDENT INFORMATION section header ────────────────────────────────────
  // FIX: Only show Name and Roll No — NOT GPA or Grade
  const siY = 35;
  doc.setFillColor(...LGREY);
  doc.roundedRect(14, siY, W - 28, 7, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...GREY);
  doc.text("STUDENT INFORMATION", 18, siY + 4.8);

  // Two-column layout: Name on left, Roll on right
  const r1 = siY + 14;
  const r2 = siY + 22;
  const col2 = W / 2 + 5;

  // Labels
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GREY);
  doc.text("Name", 18, r1 - 0.5);
  doc.text("Roll No.", 18, r2 - 0.5);

  // Values
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...DARK);
  const studentName = student.name.length > 28 ? student.name.slice(0, 28) + "…" : student.name;
  doc.text(studentName, 37, r1 + 0.5);
  doc.text(String(student.roll), 37, r2 + 0.5);

  // Separator
  doc.setDrawColor(...SKY_MID);
  doc.setLineWidth(0.3);
  doc.line(14, r2 + 6, W - 14, r2 + 6);

  // ── Subject Marks Table ────────────────────────────────────────────────────
  const subjectNames = project.subjectNames||Array.from({length:project.subjectCount},(_,i)=>`Subject ${i+1}`);
  const examOutOfs   = project.examOutOfs||Array(project.subjectCount).fill(100);
  const hasAssign    = !!student.assignFlat;
  const ac           = student.assignCount||1;
  const aoof         = student.assignOutOf||20;
  const ep           = project.examPct??100;
  const xp           = project.extraPct??0;
  const gpFn         = makeGetGP(project.gradingScale||null);
  const gradeFn      = makeGetGrade(project.gradingScale||null);

  // Columns: # | Subject | Exam | E×% | Assign(/total) | A×% | Final | Grade
  const assignHeaders = hasAssign?[`Assignment (/${ac*aoof})`,`Assign×${xp}%`]:[];
  const tableHead = [["#","Subject",`Exam Mark`,`Exam×${ep}%`,...assignHeaders,"Final Mark","Grade"]];
  const finalColIdx = tableHead[0].length-2;
  const gradeColIdx = tableHead[0].length-1;

  const tableBody = subjectNames.map((subName,i)=>{
    const rawMark  = Number((student.subjectMarks||[])[i])||0;
    const outOf    = Number(examOutOfs[i])||100;
    const examWt   = ((rawMark/outOf)*ep).toFixed(1);
    const finalMark= Number((student.finalMarks||[])[i])||0;
    const grade    = gradeFn(gpFn(finalMark));
    let assignCells=[];
    if(hasAssign){
      let tot=0;
      for(let ai=0;ai<ac;ai++) tot+=Number((student.assignFlat||{})[`s${i}a${ai}`]||0);
      assignCells=[`${tot}/${ac*aoof}`,((tot/(ac*aoof))*xp).toFixed(1)];
    }
    return [i+1,subName||`Subject ${i+1}`,`${rawMark}/${outOf}`,examWt,...assignCells,finalMark,grade];
  });

  doc.autoTable({
    head:tableHead, body:tableBody,
    startY:r2+10,
    styles:{font:"helvetica",fontSize:7.5,cellPadding:{top:3,bottom:3,left:3,right:3}},
    headStyles:{fillColor:SKY,textColor:WHITE,fontStyle:"bold",fontSize:7,cellPadding:{top:3,bottom:3,left:3,right:3},minCellHeight:9},
    alternateRowStyles:{fillColor:[240,249,255]},
    columnStyles:{0:{halign:"center",cellWidth:8},[finalColIdx]:{halign:"center",fontStyle:"bold"},[gradeColIdx]:{halign:"center",fontStyle:"bold"}},
    didParseCell:(data)=>{
      if(data.section==="body"){
        if(data.column.index===finalColIdx){const v=parseInt(data.cell.raw);data.cell.styles.textColor=v>=80?GREEN:v<33?RED:[15,28,46];}
        if(data.column.index===gradeColIdx){const g=data.cell.raw;data.cell.styles.textColor=g==="A+"||g==="A"||g==="A-"?GREEN:g==="F"?RED:[15,28,46];}
        if(hasAssign&&data.column.index>=4&&data.column.index<finalColIdx) data.cell.styles.textColor=INDIGO;
      }
    },
    margin:{left:14,right:14},
  });

  // ── Result Summary ───────────────────────────────────────────────────────
  const rsY = doc.lastAutoTable.finalY+9;
  doc.setFillColor(...LGREY); doc.roundedRect(14,rsY,W-28,7,2,2,"F");
  doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...GREY);
  doc.text("RESULT SUMMARY",18,rsY+4.8);

  const meritRanks = getMeritRank(project.students);
  const myRank = meritRanks[student.roll]||"—";
  const maxTotal = project.subjectCount*100;
  const pct = ((student.total/maxTotal)*100).toFixed(1);

  const tileW = (W-28-12)/4;
  const summaryTiles = [
    {label:"GRADE",       value:student.grade,       color:INDIGO},
    {label:"GPA",         value:String(student.gpa), color:INDIGO},
    {label:"TOTAL MARKS", value:String(student.total),color:SKY},
    {label:"MERIT RANK",  value:`#${myRank}`,        color:[180,130,0]},
  ];
  const tileRowY = rsY+11;
  const tileH    = 22;
  summaryTiles.forEach((tile,i)=>{
    const tx=14+i*(tileW+4), ty=tileRowY;
    doc.setFillColor(...SKY_LT); doc.roundedRect(tx,ty,tileW,tileH,2,2,"F");
    doc.setFont("helvetica","normal"); doc.setFontSize(6.5); doc.setTextColor(...GREY);
    doc.text(tile.label,tx+tileW/2,ty+6,{align:"center"});
    doc.setFont("helvetica","bold"); doc.setFontSize(12); doc.setTextColor(...tile.color);
    doc.text(tile.value,tx+tileW/2,ty+16,{align:"center"});
  });

  // Status bar
  const statusY=tileRowY+tileH+6;
  doc.setFillColor(...(student.status==="PASS"?GREEN:RED));
  doc.roundedRect(14,statusY,W-28,10,3,3,"F");
  doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(...WHITE);
  doc.text(student.status==="PASS"?"✓  PASS — Congratulations!":"✗  FAIL",W/2,statusY+6.5,{align:"center"});

  const sigY = statusY+18;
  doc.setDrawColor(...SKY_MID);
  doc.setLineWidth(0.4);
  doc.line(14, sigY, 65, sigY);
  doc.line(W - 65, sigY, W - 14, sigY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GREY);
  doc.text("Student Signature", 39.5, sigY + 5, { align: "center" });
  doc.text("Authorized Signature", W - 39.5, sigY + 5, { align: "center" });

  // ── Footer ─────────────────────────────────────────────────────────────────
  doc.setFillColor(...SKY_DK);
  doc.rect(0, H - 10, W / 2, 10, "F");
  doc.setFillColor(...SKY);
  doc.rect(W / 2, H - 10, W / 2, 10, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...WHITE);
  doc.text("EduGrade — Academic Excellence Platform", 14, H - 3.5);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, W - 14, H - 3.5, { align: "right" });

  doc.save(`${student.name.replace(/\s+/g, "_")}_Marksheet_${project.examName.replace(/\s+/g, "_")}.pdf`);
  showToast("✓ Marksheet downloaded!");
};

// ─── PDF: Merit List — FIXED & Improved ──────────────────────────────────────
// FIX 1: Table column widths tuned so GPA, Grade, Status headers don't wrap
// FIX 2: Better logo
// NEW: Pass/fail bar chart added
const downloadMeritListPDF = async (project, showToast) => {
  if (!project?.students.length) return showToast("⚠ No students to export");
  showToast("⏳ Generating Merit List PDF…");

  const loadScript = (src) => new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement("script");
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });

  try {
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");
  } catch { return showToast("✗ Could not load PDF library"); }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  const SKY     = [14, 165, 233];
  const SKY_LT  = [240, 249, 255];
  const SKY_MID = [186, 230, 253];
  const SKY_DK  = [3, 105, 161];
  const DARK    = [15, 28, 46];
  const GREY    = [100, 116, 132];
  const LGREY   = [241, 245, 249];
  const WHITE   = [255, 255, 255];
  const GREEN   = [16, 185, 129];
  const RED     = [239, 68, 68];
  const GOLD    = [180, 130, 0];
  const SILVER  = [100, 116, 139];
  const BRONZE  = [160, 80, 30];
  const INDIGO  = [99, 102, 241];

  // ── Top accent ────────────────────────────────────────────────────────────
  doc.setFillColor(...SKY_DK);
  doc.rect(0, 0, W / 2, 5, "F");
  doc.setFillColor(...SKY);
  doc.rect(W / 2, 0, W / 2, 5, "F");

  // ── Logo ──────────────────────────────────────────────────────────────────
  const logoX = 14, logoY = 10, logoSize = 16;
  doc.setFillColor(...SKY);
  doc.roundedRect(logoX, logoY, logoSize, logoSize, 3, 3, "F");
  doc.setFillColor(255, 255, 255);
  doc.rect(logoX + 2, logoY + 2.5, 5, 10.5, "F");
  doc.setFillColor(224, 242, 254);
  doc.rect(logoX + 7.5, logoY + 2.5, 5.5, 10.5, "F");
  doc.setDrawColor(...SKY_DK);
  doc.setLineWidth(0.6);
  doc.line(logoX + 7.2, logoY + 2.5, logoX + 7.2, logoY + 13);
  doc.setDrawColor(...SKY_DK);
  doc.setLineWidth(1);
  doc.line(logoX + 8.8, logoY + 8.2, logoX + 10, logoY + 9.5);
  doc.line(logoX + 10, logoY + 9.5, logoX + 12.2, logoY + 6.5);
  doc.setFillColor(255, 255, 255);
  doc.circle(logoX + 13.5, logoY + 2.5, 1.2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...DARK);
  doc.text("EduGrade", logoX + logoSize + 4, logoY + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GREY);
  doc.text("Merit List", logoX + logoSize + 4, logoY + 12.5);

  // ── Info badge (top right) ─────────────────────────────────────────────────
  const passCount = project.students.filter(s => s.status === "PASS").length;
  const failCount = project.students.length - passCount;
  const avgGPA = (project.students.reduce((a, s) => a + s.gpa, 0) / project.students.length).toFixed(2);
  const examBadgeLabel = project.examName.length > 22 ? project.examName.slice(0, 22) + "…" : project.examName;

  doc.setFillColor(...SKY_LT);
  doc.roundedRect(W - 72, logoY - 1, 58, 20, 3, 3, "F");
  doc.setDrawColor(...SKY_MID);
  doc.setLineWidth(0.5);
  doc.roundedRect(W - 72, logoY - 1, 58, 20, 3, 3, "S");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GREY);
  doc.text("EXAM", W - 68, logoY + 4);
  doc.text("STUDENTS", W - 68, logoY + 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  doc.text(examBadgeLabel, W - 47, logoY + 4);
  doc.text(String(project.students.length), W - 47, logoY + 12);

  // ── Divider ───────────────────────────────────────────────────────────────
  doc.setDrawColor(...SKY_MID);
  doc.setLineWidth(0.5);
  doc.line(14, 31, W - 14, 31);

  // ── Stats tiles ───────────────────────────────────────────────────────────
  const tileW = (W - 28 - 12) / 4;
  [
    { label: "TOTAL", value: project.students.length, color: SKY },
    { label: "PASSED", value: passCount, color: GREEN },
    { label: "FAILED", value: failCount, color: RED },
    { label: "AVG GPA", value: avgGPA, color: INDIGO },
  ].forEach(({ label, value, color }, i) => {
    const tx = 14 + i * (tileW + 4);
    doc.setFillColor(...SKY_LT);
    doc.roundedRect(tx, 35, tileW, 15, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...GREY);
    doc.text(label, tx + tileW / 2, 40.5, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...color);
    doc.text(String(value), tx + tileW / 2, 47, { align: "center" });
  });

  // ── Pass rate bar ─────────────────────────────────────────────────────────
  const barY = 55;
  const passRate = (passCount / project.students.length);
  doc.setFillColor(...LGREY);
  doc.roundedRect(14, barY, W - 28, 5, 2, 2, "F");
  if (passRate > 0) {
    doc.setFillColor(...GREEN);
    doc.roundedRect(14, barY, (W - 28) * passRate, 5, 2, 2, "F");
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...GREY);
  doc.text(`Pass rate: ${(passRate * 100).toFixed(1)}%`, 16, barY + 3.5);

  // ── Table — FIX: explicit column widths prevent header text wrapping ───────
  const sortedByRoll = [...project.students].sort((a, b) =>
    String(a.roll).localeCompare(String(b.roll), undefined, { numeric: true })
  );
  const meritRanks = getMeritRank(project.students);

  // Total printable width = 210 - 2*12 = 186mm
  // Col widths sum should equal 186
  const colWidths = {
    0: 16,  // Rank
    1: 52,  // Name
    2: 18,  // Roll No.
    3: 18,  // Total
    4: 16,  // GPA
    5: 16,  // Grade
    6: 22,  // Percent
    7: 28,  // Status
  };

  const head = [["Rank", "Name", "Roll", "Total", "GPA", "Grade", "Percent", "Status"]];
  const body = sortedByRoll.map(s => [
    `#${meritRanks[s.roll]}`,
    s.name,
    s.roll,
    s.total,
    s.gpa,
    s.grade,
    `${((s.total / (project.subjectCount * 100)) * 100).toFixed(1)}%`,
    s.status,
  ]);

  doc.autoTable({
    head,
    body,
    startY: 64,
    // FIX: Use smaller font and tight padding in header so text never wraps
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: { top: 3.5, bottom: 3.5, left: 3.5, right: 3.5 },
      overflow: "hidden",
    },
    headStyles: {
      fillColor: SKY,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 7.5,           // ← Smaller so single-word headers fit
      cellPadding: { top: 3, bottom: 3, left: 3.5, right: 3.5 },
      minCellHeight: 8,        // ← Controlled height prevents over-expansion
      valign: "middle",
      halign: "center",
    },
    alternateRowStyles: { fillColor: SKY_LT },
    columnStyles: {
      0: { halign: "center", cellWidth: colWidths[0] },
      1: { cellWidth: colWidths[1] },
      2: { halign: "center", cellWidth: colWidths[2] },
      3: { halign: "center", cellWidth: colWidths[3] },
      4: { halign: "center", cellWidth: colWidths[4] },
      5: { halign: "center", cellWidth: colWidths[5] },
      6: { halign: "center", cellWidth: colWidths[6] },
      7: { halign: "center", cellWidth: colWidths[7] },
    },
    didParseCell: (data) => {
      if (data.section === "body") {
        if (data.column.index === 0) {
          const raw = data.cell.raw;
          if (raw === "#1") { data.cell.styles.textColor = GOLD; data.cell.styles.fontStyle = "bold"; }
          else if (raw === "#2") { data.cell.styles.textColor = SILVER; data.cell.styles.fontStyle = "bold"; }
          else if (raw === "#3") { data.cell.styles.textColor = BRONZE; data.cell.styles.fontStyle = "bold"; }
          else { data.cell.styles.textColor = GREY; }
        }
        if (data.column.index === 7) {
          data.cell.styles.textColor = data.cell.raw === "PASS" ? GREEN : RED;
          data.cell.styles.fontStyle = "bold";
        }
        if (data.column.index === 5) {
          const gradeColors = {
            "A+": SKY, "A": SKY, "A-": [2, 132, 199], "B": INDIGO,
            "C": [245, 158, 11], "D": [251, 146, 60], "F": RED,
          };
          data.cell.styles.textColor = gradeColors[data.cell.raw] || DARK;
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    margin: { left: 12, right: 12 },
    didDrawPage: (data) => {
      // Repeat logo on each page
      if (data.pageNumber > 1) {
        doc.setFillColor(...SKY_DK);
        doc.rect(0, 0, W / 2, 3, "F");
        doc.setFillColor(...SKY);
        doc.rect(W / 2, 0, W / 2, 3, "F");
      }
    },
  });

  // ── Footer on all pages ────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...SKY_DK);
    doc.rect(0, H - 10, W / 2, 10, "F");
    doc.setFillColor(...SKY);
    doc.rect(W / 2, H - 10, W / 2, 10, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...WHITE);
    doc.text("EduGrade — Academic Excellence Platform", 14, H - 3.5);
    doc.text(`Page ${i} of ${pageCount}`, W - 14, H - 3.5, { align: "right" });
  }

  doc.save(`${project.examName.replace(/\s+/g, "_")}_Merit_List.pdf`);
  showToast("✓ Merit List PDF downloaded!");
};

// ─── Firebase Loader ──────────────────────────────────────────────────────────
const useFirebase = () => {
  const [firebase, setFirebase] = useState(null);
  const [fbReady, setFbReady] = useState(false);
  const [fbError, setFbError] = useState(false);

  useEffect(() => {
    const load = async () => {
      // Load a script tag with a 10-second timeout; skip if already present
      const loadScript = (src) => new Promise((res, rej) => {
        if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
        const s = document.createElement("script");
        s.src = src;
        s.onerror = rej;
        const timer = setTimeout(() => rej(new Error(`Script load timeout: ${src}`)), 10000);
        s.onload = () => { clearTimeout(timer); res(); };
        document.head.appendChild(s);
      });
      try {
        await loadScript("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
        await loadScript("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js");
        await loadScript("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js");
        // Guard against "app already exists" error on hot-reload / StrictMode double-mount
        const app = window.firebase.apps.length
          ? window.firebase.apps[0]
          : window.firebase.initializeApp(FIREBASE_CONFIG);
        const auth = window.firebase.auth();
        const db = window.firebase.firestore();
        setFirebase({ app, auth, db });
        setFbReady(true);
      } catch (e) { console.error("Firebase load error:", e); setFbError(true); }
    };
    load();
  }, []);

  return { firebase, fbReady, fbError };
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { firebase, fbReady, fbError } = useFirebase();

  const [splash, setSplash] = useState(true);
  const [page, setPage] = useState("home");
  const [anim, setAnim] = useState(false);
  const [dark, setDark] = useState(true);
  const [toast, setToast] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAccountBlocked, setIsAccountBlocked] = useState(false);

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [projects, setProjects] = useState([]);
  const [activeProjectIndex, setActiveProjectIndex] = useState(null);

  const [examName, setExamName] = useState("");
  const [subjectCount, setSubjectCount] = useState("");
  const [subjectNames, setSubjectNames] = useState([]);
  const [showSubjectInput, setShowSubjectInput] = useState(false);
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [marks, setMarks] = useState([]);
  const [viewStudent, setViewStudent] = useState(null);
  const [searchRoll, setSearchRoll] = useState("");
  const [saving, setSaving] = useState(false);
  const [studentModal, setStudentModal] = useState(null);

  // New feature: edit student modal
  const [editingStudent, setEditingStudent] = useState(null);
  const [editMarks, setEditMarks] = useState([]);

  // ── Feature state ─────────────────────────────────────────────
  const [examPct,      setExamPct]      = useState(100);
  const [extraPct,     setExtraPct]     = useState(0);
  const [useExtra,     setUseExtra]     = useState(false);
  const [assignCount,  setAssignCount]  = useState(1);
  const [assignOutOf,  setAssignOutOf]  = useState(20);
  const [examOutOfs,   setExamOutOfs]   = useState([]);
  const [passThreshold,setPassThreshold]= useState(33);
  const [assignScores, setAssignScores] = useState([]);
  const [showGradingEditor,setShowGradingEditor] = useState(false);
  const [customGrading,    setCustomGrading]     = useState(null);
  const [fourthSubEnabled,     setFourthSubEnabled]     = useState(false);
  const [fourthSubIndex,       setFourthSubIndex]       = useState(null);
  const [fourthSubExtraPoints, setFourthSubExtraPoints] = useState({ 5:3, 4:2, 3.5:1 });
  const [renamingProject, setRenamingProject] = useState(null);
  const [renameValue,     setRenameValue]     = useState("");

  const showToast = useCallback((msg) => {
    setToast(msg); setTimeout(() => setToast(""), 2500);
  }, []);

  useEffect(() => {
    if (!firebase) return;
    const unsub = firebase.auth.onAuthStateChanged(async (u) => {
      setUser(u); setAuthReady(true);
      if (u) {
        const snap = await firebase.db.collection("users").doc(u.uid).get();
        if (snap.exists && snap.data().blocked) { setIsAccountBlocked(true); return; }
        try {
          const projSnap = await firebase.db.collection("users").doc(u.uid)
            .collection("projects").orderBy("createdAt", "asc").get();
          setProjects(projSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) { console.error(e); }
      } else { setProjects([]); setActiveProjectIndex(null); }
    });
    return () => unsub();
  }, [firebase]);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const d = localStorage.getItem("edu_dark");
    if (d !== null) setDark(JSON.parse(d));
  }, []);
  useEffect(() => { localStorage.setItem("edu_dark", JSON.stringify(dark)); }, [dark]);

  const go = useCallback((p) => {
    setAnim(true);
    setTimeout(() => { setPage(p); setAnim(false); }, 180);
  }, []);

  const activeProject = projects[activeProjectIndex] ?? null;

  const createProject = async () => {
    if (!examName.trim() || !subjectCount) return showToast("⚠ Fill all fields");
    const n = Number(subjectCount);
    if (n < 1 || n > 20) return showToast("⚠ Subjects: 1–20");
    setSaving(true);
    try {
      const names = showSubjectInput ? subjectNames.filter(s => s.trim()) : [];
      const np = {
        examName: examName.trim(), subjectCount: n, students: [],
        subjectNames: names.length > 0 ? names : [],
        createdAt: new Date().toISOString(),
        examPct, extraPct: useExtra?extraPct:0,
        useExtra, assignCount: useExtra?assignCount:0,
        assignOutOf: useExtra?assignOutOf:0,
        passThreshold,
        examOutOfs: Array(n).fill(null).map((_,i)=>Number(examOutOfs[i])||100),
        gradingScale: showGradingEditor&&customGrading?customGrading:null,
        fourthSub: fourthSubEnabled&&fourthSubIndex!==null
          ?{index:fourthSubIndex,extraPoints:{...fourthSubExtraPoints}}:null,
      };
      const docRef = await firebase.db.collection("users").doc(user.uid).collection("projects").add(np);
      const newP = { ...np, id: docRef.id };
      const updated = [...projects, newP];
      setProjects(updated);
      setActiveProjectIndex(updated.length - 1);
      setMarks(Array(n).fill(""));
      setAssignScores(Array(n).fill(null).map(()=>Array(useExtra?assignCount:1).fill("")));
      setExamOutOfs([]);
      setExamName(""); setSubjectCount(""); setSubjectNames([]); setShowSubjectInput(false);
      go("app"); showToast("✓ Project created");
    } catch (e) { showToast("✗ " + e.message); }
    setSaving(false);
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project and all its data?")) return;
    try {
      await firebase.db.collection("users").doc(user.uid).collection("projects").doc(id).delete();
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      if (activeProject?.id === id) setActiveProjectIndex(null);
      showToast("✓ Deleted");
    } catch (e) { showToast("✗ " + e.message); }
  };

  const renameProject = async (id, newName) => {
    if (!newName.trim()) return showToast("⚠ Name required");
    try {
      await firebase.db.collection("users").doc(user.uid).collection("projects").doc(id).update({ examName: newName.trim() });
      setProjects(prev => prev.map(q => q.id===id?{...q,examName:newName.trim()}:q));
      setRenamingProject(null); setRenameValue("");
      showToast("✓ Renamed");
    } catch(e) { showToast("✗ "+e.message); }
  };

  const exportCSV = (project) => {
    if (!project?.students?.length) return showToast("⚠ No students to export");
    const subs = project.subjectNames||Array(project.subjectCount).fill(null).map((_,i)=>`Sub${i+1}`);
    const headers = ["Name","Roll","GPA","Grade","Total","Status",...subs.map(s=>`Exam_${s}`)];
    const rows = project.students.map(s=>[s.name,s.roll,s.gpa,s.grade,s.total,s.status,...(s.subjectMarks||[])]);
    const csv = [headers,...rows].map(r=>r.map(v=>`"${v}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
    a.download = `${project.examName.replace(/\s+/g,"_")}.csv`;
    a.click(); showToast("✓ CSV exported");
  };

  // Final mark = round((exam/outOf)*examPct + (Σassign/(count*outOf))*extraPct)
  const calcStudent = (numsRaw, eOutOfs, aScores) => {
    const scale  = activeProject?.gradingScale||null;
    const gpFn   = makeGetGP(scale);
    const gradeFn= makeGetGrade(scale);
    const ep_    = activeProject?.examPct    ?? examPct;
    const xp_    = activeProject?.extraPct   ?? extraPct;
    const hasX   = activeProject?.useExtra   ?? useExtra;
    const ac_    = activeProject?.assignCount ?? assignCount;
    const aoof   = Number(activeProject?.assignOutOf||assignOutOf||20);
    const thresh = activeProject?.passThreshold ?? passThreshold ?? 33;
    const fs     = activeProject?.fourthSub||null;
    const fse    = fs||fourthSubEnabled;
    const fsi    = fs?fs.index:fourthSubIndex;
    const fsep   = fs?fs.extraPoints:fourthSubExtraPoints;

    const finalMarks = numsRaw.map((raw,i)=>{
      const outOf  = Number((eOutOfs||[])[i])||100;
      const examC  = (Number(raw)/outOf)*ep_;
      let extraC   = 0;
      if (hasX&&xp_>0&&ac_>0) {
        const subS   = (aScores||[])[i]||[];
        const scored = subS.reduce((s,v)=>s+Number(v||0),0);
        extraC = (ac_*aoof)>0?(scored/(ac_*aoof))*xp_:0;
      }
      return Math.round(examC+extraC);
    });

    const total = finalMarks.reduce((a,b)=>a+b,0);
    const fail  = finalMarks.some(m=>m<thresh);
    let avgGP;
    if (fail) { avgGP=0; }
    else if (fse&&fsi!==null) {
      const mainIdxs = finalMarks.map((_,i)=>i).filter(i=>i!==fsi);
      const mainGPs  = mainIdxs.map(i=>gpFn(finalMarks[i]));
      const fgp      = gpFn(finalMarks[fsi]);
      const extra    = fgp>=5?(fsep[5]??3):fgp>=4?(fsep[4]??2):fgp>=3.5?(fsep[3.5]??1):0;
      avgGP = (mainGPs.reduce((a,b)=>a+b,0)+extra)/mainIdxs.length;
    } else {
      avgGP = finalMarks.reduce((a,m)=>a+gpFn(m),0)/finalMarks.length;
    }
    const cappedGP = Math.min(avgGP, 5); // GPA can never exceed 5.00
    return { gpa:Number(cappedGP.toFixed(2)), grade:gradeFn(cappedGP), total, finalMarks, status:fail?"FAIL":"PASS" };
  };

  const addStudent = async () => {
    if (!activeProject) return;
    if (!name.trim()||!roll.trim()) return showToast("⚠ Name & Roll required");
    if (marks.some(m=>m==="")) return showToast("⚠ Fill all subject marks");
    const numsRaw = marks.map(Number);
    if (numsRaw.some(isNaN)) return showToast("⚠ Invalid marks");
    if (numsRaw.some(m=>m<0)) return showToast("⚠ Marks cannot be negative");
    const eOutOfs = activeProject.examOutOfs||Array(activeProject.subjectCount).fill(100);
    for (let i=0;i<numsRaw.length;i++)
      if (numsRaw[i]>Number(eOutOfs[i])) return showToast(`⚠ Subject ${i+1} exceeds full marks (${eOutOfs[i]})`);
    const flatAssign={};
    if (activeProject.useExtra)
      (assignScores||[]).forEach((sub,si)=>(sub||[]).forEach((v,ai)=>{flatAssign[`s${si}a${ai}`]=Number(v||0);}));
    const {gpa,grade,total,finalMarks,status} = calcStudent(numsRaw,eOutOfs,assignScores);
    const obj = {
      name:name.trim(), roll:roll.trim(), total, gpa, grade, status, finalMarks,
      subjectMarks:[...numsRaw],
      assignFlat:  activeProject.useExtra?flatAssign:null,
      assignCount: activeProject.useExtra?(activeProject.assignCount||1):null,
      assignOutOf: activeProject.useExtra?Number(activeProject.assignOutOf||assignOutOf):null,
    };
    setSaving(true);
    try {
      const pr = {...activeProject, students:[...activeProject.students]};
      const idx = pr.students.findIndex(s=>s.roll===obj.roll);
      if (idx!==-1) {
        if (!window.confirm("Student exists. Update?")) { setSaving(false); return; }
        pr.students[idx]=obj;
      } else { pr.students.push(obj); }
      await firebase.db.collection("users").doc(user.uid)
        .collection("projects").doc(pr.id).update({students:pr.students});
      const updated=[...projects]; updated[activeProjectIndex]=pr;
      setProjects(updated); setViewStudent(obj);
      setName(""); setRoll(""); setMarks(Array(activeProject.subjectCount).fill(""));
      const ac=activeProject.assignCount||1;
      setAssignScores(Array(activeProject.subjectCount).fill(null).map(()=>Array(ac).fill("")));
      showToast("✓ Saved");
    } catch(e) { showToast("✗ "+e.message); }
    setSaving(false);
  };

  // New: delete a student
  const deleteStudent = async (rollNo) => {
    if (!activeProject) return;
    if (!window.confirm("Remove this student?")) return;
    try {
      const pr = { ...activeProject, students: activeProject.students.filter(s => s.roll !== rollNo) };
      await firebase.db.collection("users").doc(user.uid)
        .collection("projects").doc(pr.id).update({ students: pr.students });
      const updated = [...projects];
      updated[activeProjectIndex] = pr;
      setProjects(updated);
      if (viewStudent?.roll === rollNo) setViewStudent(null);
      showToast("✓ Student removed");
    } catch (e) { showToast("✗ " + e.message); }
  };

  const updateMark = (i, v) => {
    if (v === "") { const c = [...marks]; c[i] = ""; setMarks(c); return; }
    if (Number(v) < 0) return showToast("⚠ Marks cannot be negative");
    const c = [...marks]; c[i] = v; setMarks(c);
  };

  const search = () => {
    const s = activeProject?.students.find(x => x.roll.toLowerCase() === searchRoll.trim().toLowerCase());
    if (!s) return showToast("✗ Not found");
    setViewStudent(s);
  };

  const signOut = async () => {
    await firebase.auth.signOut();
    setProjects([]); setActiveProjectIndex(null); setIsAccountBlocked(false);
    go("home"); showToast("✓ Signed out");
  };

  const meritRanks = activeProject ? getMeritRank(activeProject.students) : {};
  const sortedByRoll = activeProject
    ? [...activeProject.students].sort((a, b) =>
        String(a.roll).localeCompare(String(b.roll), undefined, { numeric: true }))
    : [];
  const top3 = activeProject
    ? [...activeProject.students].sort((a, b) => b.gpa - a.gpa || b.total - a.total).slice(0, 3)
    : [];

  const summaryStats = () => {
    if (!activeProject?.students.length) return { pass: 0, fail: 0, rate: "0.0", avg: "0.00", total: 0 };
    const pass = activeProject.students.filter(s => s.status === "PASS").length;
    const fail = activeProject.students.length - pass;
    const avg = (activeProject.students.reduce((a, s) => a + s.gpa, 0) / activeProject.students.length).toFixed(2);
    return { pass, fail, rate: ((pass / activeProject.students.length) * 100).toFixed(1), avg, total: activeProject.students.length };
  };

  const medalColors = ["#f59e0b", "#94a3b8", "#cd7c2f"];
  const medals = ["🥇", "🥈", "🥉"];

  // New feature: subject performance breakdown
  const getSubjectStats = () => {
    if (!activeProject?.students.length) return [];
    const names = activeProject.subjectNames || Array.from({ length: activeProject.subjectCount }, (_, i) => `Subject ${i + 1}`);
    return names.map((name, i) => {
      const marks = activeProject.students.map(s => (s.subjectMarks || [])[i] || 0);
      const avg = marks.reduce((a, b) => a + b, 0) / marks.length;
      const pass = marks.filter(m => m >= 33).length;
      return {
        name,
        avg: avg.toFixed(1),
        passRate: ((pass / marks.length) * 100).toFixed(0),
        highest: Math.max(...marks),
        lowest: Math.min(...marks),
      };
    });
  };

  return (
    <>
      <GlobalStyle dark={dark} />
      {toast && <Toast msg={toast} />}
      {splash && <LogoSplash onDone={() => setSplash(false)} />}
      {isAccountBlocked && <BlockedModal onSignOut={signOut} />}
      {showAdmin && firebase && <AdminPanel firebase={firebase} showToast={showToast} onClose={() => setShowAdmin(false)} />}
      {studentModal && (
        <StudentListModal
          title={studentModal.title}
          students={studentModal.students}
          color={studentModal.color}
          onClose={() => setStudentModal(null)}
        />
      )}

      <div style={{
        maxWidth: 520, margin: "0 auto",
        paddingTop: 16, paddingLeft: 14, paddingRight: 14, paddingBottom: 110,
        opacity: anim ? 0 : 1,
        transform: anim ? "translateY(8px)" : "translateY(0)",
        transition: "opacity 0.18s, transform 0.18s",
      }}>
        {(!fbReady || !authReady) && !splash && <Spinner />}

        {fbError && (
          <Card style={{ marginTop: 40, textAlign: "center", padding: 32 }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>❌</div>
            <p style={{ fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>Firebase failed to load</p>
            <p style={{ color: "var(--text2)", fontSize: 13 }}>Check your connection and Firebase config.</p>
          </Card>
        )}

        {fbReady && authReady && !user && !fbError && (
          <AuthPage firebase={firebase} onAuth={setUser} showToast={showToast} />
        )}

        {fbReady && authReady && user && !fbError && !isAccountBlocked && (
          <>
            {/* ── HOME ─────────────────────────────────────────────────── */}
            {page === "home" && (
              <div style={{ animation: "up 0.28s ease" }}>
                {/* Header */}
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", paddingTop: 8, marginBottom: 24,
                }}>
                  <div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8, marginBottom: 10
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 9,
                        background: "linear-gradient(135deg, #38bdf8, #0284c7)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(14,165,233,0.35)",
                      }}>
                        <svg width="20" height="20" viewBox="0 0 52 52" fill="none">
                          <rect x="8" y="10" width="14" height="32" rx="3" fill="rgba(255,255,255,0.4)" />
                          <rect x="10" y="10" width="14" height="32" rx="3" fill="rgba(255,255,255,0.55)" />
                          <path d="M24 12h14a3 3 0 013 3v26a3 3 0 01-3 3H24V12z" fill="rgba(255,255,255,0.7)" />
                          <path d="M30 20l3 3 6-6" stroke="rgba(3,105,161,1)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>EduGrade</div>
                        <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 500, letterSpacing: "0.04em" }}>Academic Excellence</div>
                      </div>
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em" }}>
                      Hi, {user.displayName || user.email?.split("@")[0]} 👋
                    </h1>
                    <p style={{ color: "var(--text2)", fontSize: 13, marginTop: 3 }}>Your grading workspace</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", marginTop: 4 }}>
                    <button onClick={() => setDark(!dark)} style={{
                      width: 38, height: 38, borderRadius: "50%",
                      border: "1.5px solid var(--border)",
                      background: "var(--surface2)", color: "var(--text)",
                      fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s",
                    }}>{dark ? "☀" : "☾"}</button>
                    <button onClick={signOut} style={{
                      padding: "5px 12px", borderRadius: 9,
                      border: "1.5px solid var(--border)",
                      background: "var(--surface2)", color: "var(--text2)",
                      fontSize: 11, fontWeight: 600,
                    }}>Sign Out</button>
                  </div>
                </div>

                {/* Quick stats strip */}
                {projects.length > 0 && (() => {
                  const totalStudents = projects.reduce((a, p) => a + p.students.length, 0);
                  const totalPassed = projects.reduce((a, p) => a + p.students.filter(s => s.status === "PASS").length, 0);
                  return (
                    <div style={{
                      display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18,
                    }}>
                      {[
                        { label: "Projects", value: projects.length, color: "var(--sky)" },
                        { label: "Students", value: totalStudents, color: "var(--indigo)" },
                        { label: "Passed", value: totalPassed, color: "var(--green)" },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{
                          background: "var(--surface)", border: "1.5px solid var(--border)",
                          borderRadius: 14, padding: "12px 14px", textAlign: "center",
                        }}>
                          <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "var(--font-mono)", lineHeight: 1 }}>{value}</div>
                          <div style={{ fontSize: 9.5, fontWeight: 600, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <button onClick={() => go("setup")} style={{
                  width: "100%", padding: "15px 22px", borderRadius: 16, border: "none",
                  background: "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)",
                  color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 16,
                  boxShadow: "0 6px 22px rgba(14,165,233,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  letterSpacing: "0.01em", transition: "all 0.2s",
                }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: 8, background: "rgba(255,255,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                  }}>+</span>
                  Create New Project
                </button>

                {projects.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "54px 0 0", color: "var(--text2)" }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px",
                      background: "var(--surface2)", border: "1.5px solid var(--border)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                    }}>📚</div>
                    <div style={{ fontWeight: 700, marginBottom: 6, color: "var(--text)", fontSize: 15 }}>No projects yet</div>
                    <div style={{ fontSize: 13 }}>Create your first grading project above</div>
                  </div>
                ) : projects.map((p, i) => {
                  const pass = p.students.filter(s => s.status === "PASS").length;
                  const passRate = p.students.length ? ((pass / p.students.length) * 100).toFixed(0) : 0;
                  return (
                    <div key={p.id} className="project-card" style={{
                      background: "var(--surface)", border: "1.5px solid var(--border)",
                      borderRadius: 16, marginBottom: 9, overflow: "hidden",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
                        <div style={{
                          width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                          background: "color-mix(in srgb,var(--sky) 10%,var(--surface2))",
                          border: "1.5px solid color-mix(in srgb,var(--sky) 18%,var(--border))",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                        }}>📋</div>
                        <div onClick={() => {
                          setActiveProjectIndex(i);
                          setMarks(Array(p.subjectCount).fill(""));
                          setExamPct(p.examPct??100); setExtraPct(p.extraPct??0);
                          setUseExtra(p.useExtra??false); setAssignCount(p.assignCount??1);
                          setAssignOutOf(p.assignOutOf??20); setPassThreshold(p.passThreshold??33);
                          setExamOutOfs(p.examOutOfs||Array(p.subjectCount).fill(100));
                          const ac=p.assignCount||1;
                          setAssignScores(Array(p.subjectCount).fill(null).map(()=>Array(ac).fill("")));
                          if(p.fourthSub){setFourthSubEnabled(true);setFourthSubIndex(p.fourthSub.index);setFourthSubExtraPoints(p.fourthSub.extraPoints||{5:3,4:2,3.5:1});}
                          else{setFourthSubEnabled(false);setFourthSubIndex(null);}
                          go("app");
                        }}
                          style={{ flex: 1, cursor: "pointer" }}>
                          <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 3, letterSpacing: "-0.01em" }}>{p.examName}</div>
                          <div style={{ color: "var(--text2)", fontSize: 12 }}>
                            {p.students.length} students · {p.subjectCount} subjects
                            {p.students.length > 0 && (
                              <span style={{
                                marginLeft: 8, color: "var(--green)", fontWeight: 600
                              }}>{passRate}% pass</span>
                            )}
                          </div>
                          {/* Mini pass bar */}
                          {p.students.length > 0 && (
                            <div style={{ height: 3, borderRadius: 2, background: "var(--border)", marginTop: 7, overflow: "hidden" }}>
                              <div style={{
                                height: 3, borderRadius: 2, background: "var(--green)",
                                width: `${passRate}%`, transition: "width 0.8s ease",
                              }} />
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Action bar — inside the same root div */}
                      <div style={{ display:"flex", borderTop:"1px solid var(--border)" }}>
                        {[
                          {icon:"✏️",label:"Rename",  action:()=>{setRenamingProject(p.id);setRenameValue(p.examName);}},
                          {icon:"📤",label:"Export CSV",action:()=>exportCSV(p)},
                          {icon:"🗑", label:"Delete",  action:()=>deleteProject(p.id),danger:true},
                        ].map(({icon,label,action,danger})=>(
                          <button key={label} onClick={e=>{e.stopPropagation();action();}} style={{
                            flex:1,padding:"8px 2px",border:"none",background:"transparent",
                            color:danger?"var(--red)":"var(--text2)",fontSize:10.5,fontWeight:600,
                            cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,
                            borderRight:label!=="Delete"?"1px solid var(--border)":undefined,
                          }}>
                            <span style={{fontSize:14}}>{icon}</span><span>{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Rename Modal ── */}
            {renamingProject && (
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 20px"}}>
                <div style={{background:"var(--surface)",border:"1.5px solid var(--border)",borderRadius:20,padding:24,width:"100%",maxWidth:380}}>
                  <div style={{fontWeight:700,fontSize:16,marginBottom:16}}>Rename Project</div>
                  <input autoFocus value={renameValue} onChange={e=>setRenameValue(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&renameProject(renamingProject,renameValue)}
                    placeholder="Project name" style={{marginBottom:14}} />
                  <div style={{display:"flex",gap:10}}>
                    <Btn variant="secondary" onClick={()=>setRenamingProject(null)} style={{flex:1}}>Cancel</Btn>
                    <Btn onClick={()=>renameProject(renamingProject,renameValue)} style={{flex:1}}>Save</Btn>
                  </div>
                </div>
              </div>
            )}

            {/* ── SETUP ────────────────────────────────────────────────── */}
            {page === "setup" && (
              <Card animate style={{ borderRadius: 20 }}>
                <SectionHeader label="New Project" title="Configure Exam" subtitle="Set up your grading project" />
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <Label>Exam / Project Name</Label>
                    <input placeholder="e.g. Semester 1 Final" value={examName}
                      onChange={e => setExamName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Number of Subjects</Label>
                    <input type="number" placeholder="e.g. 6" value={subjectCount}
                      onChange={e=>{setSubjectCount(e.target.value);const n=Number(e.target.value);setSubjectNames(Array(n).fill(""));setExamOutOfs(Array(n).fill(100));}}
                      min={1} max={20} />
                  </div>
                  <div>
                    <label style={{
                      display: "flex", alignItems: "center", gap: 9,
                      fontSize: 12, fontWeight: 600, color: "var(--text2)",
                      cursor: "pointer", marginBottom: 10, userSelect: "none",
                    }}>
                      <input type="checkbox" checked={showSubjectInput}
                        onChange={e => setShowSubjectInput(e.target.checked)}
                        style={{ width: "auto", cursor: "pointer", accentColor: "var(--sky)" }} />
                      Add Subject Names (Optional)
                    </label>
                    {showSubjectInput && subjectCount && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {Array(Number(subjectCount)).fill(null).map((_, i) => (
                          <input key={i} type="text"
                            placeholder={`Subject ${i + 1}`}
                            value={subjectNames[i] || ""}
                            onChange={e => { const u = [...subjectNames]; u[i] = e.target.value; setSubjectNames(u); }} />
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Full Marks per Subject */}
                  {subjectCount&&Number(subjectCount)>=1&&(
                    <div>
                      <Label>Full Marks Per Subject</Label>
                      <div style={{display:"flex",flexDirection:"column",gap:7}}>
                        {Array(Number(subjectCount)).fill(null).map((_,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                            <div style={{fontSize:12,color:"var(--text2)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                              {subjectNames[i]?.trim()||`Subject ${i+1}`}
                            </div>
                            <input type="number" value={examOutOfs[i]??100}
                              onChange={e=>{const u=[...examOutOfs];u[i]=Number(e.target.value);setExamOutOfs(u);}}
                              min={1} style={{width:90,textAlign:"center"}} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mark Weightage */}
                  <div style={{padding:"14px",borderRadius:12,background:"var(--surface2)",border:"1.5px solid var(--border)"}}>
                    <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>Mark Weightage</div>
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{flex:1,fontSize:12.5,fontWeight:600}}>📝 Exam</div>
                        <input type="number" value={examPct} onChange={e=>setExamPct(Number(e.target.value))} min={0} max={100} style={{width:75,textAlign:"center"}} />
                        <span style={{fontSize:12,color:"var(--text3)",width:16}}>%</span>
                      </div>
                      <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                        <input type="checkbox" checked={useExtra}
                          onChange={e=>{setUseExtra(e.target.checked);if(!e.target.checked)setExtraPct(0);}}
                          style={{width:"auto",accentColor:"var(--sky)",cursor:"pointer"}} />
                        <span style={{fontSize:12.5,fontWeight:600,flex:1}}>📋 Assignment</span>
                        {useExtra&&<><input type="number" value={extraPct} onChange={e=>setExtraPct(Number(e.target.value))} min={0} max={100} style={{width:75,textAlign:"center"}} /><span style={{fontSize:12,color:"var(--text3)",width:16}}>%</span></>}
                      </label>
                      {useExtra&&(
                        <div style={{paddingLeft:26,display:"flex",flexDirection:"column",gap:8,borderLeft:"2px solid var(--border)"}}>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <span style={{fontSize:12,color:"var(--text2)",flex:1}}>Number of Assignments</span>
                            <input type="number" value={assignCount} onChange={e=>setAssignCount(Math.max(1,Number(e.target.value)))} min={1} max={10} style={{width:70,textAlign:"center"}} />
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <span style={{fontSize:12,color:"var(--text2)",flex:1}}>Full Marks per Assignment</span>
                            <input type="number" value={assignOutOf} onChange={e=>setAssignOutOf(Number(e.target.value))} min={1} style={{width:70,textAlign:"center"}} />
                          </div>
                        </div>
                      )}
                    </div>
                    {(examPct+(useExtra?extraPct:0))!==100&&(
                      <div style={{marginTop:10,fontSize:11.5,color:"var(--yellow)",fontWeight:600}}>
                        ⚠ Total weightage is {examPct+(useExtra?extraPct:0)}% — must equal 100%
                      </div>
                    )}
                  </div>

                  {/* Pass Threshold */}
                  <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,background:"var(--surface2)",border:"1.5px solid var(--border)"}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:12.5,marginBottom:2}}>Pass Threshold</div>
                      <div style={{fontSize:11,color:"var(--text2)"}}>Minimum final mark to pass each subject</div>
                    </div>
                    <input type="number" value={passThreshold} onChange={e=>setPassThreshold(Number(e.target.value))} min={0} max={100} style={{width:70,textAlign:"center",fontWeight:700}} />
                    <span style={{fontSize:12,color:"var(--text3)"}}>/100</span>
                  </div>

                  {/* 4th Optional Subject */}
                  <div style={{padding:"12px 14px",borderRadius:12,background:"var(--surface2)",border:"1.5px solid var(--border)"}}>
                    <label style={{display:"flex",alignItems:"center",gap:9,fontSize:12.5,fontWeight:600,cursor:"pointer",marginBottom:8}}>
                      <input type="checkbox" checked={fourthSubEnabled}
                        onChange={e=>{setFourthSubEnabled(e.target.checked);setFourthSubIndex(null);}}
                        style={{width:"auto",accentColor:"var(--sky)",cursor:"pointer"}} />
                      Enable Optional (4th) Subject
                    </label>
                    {fourthSubEnabled&&subjectCount&&Number(subjectCount)>=2&&(
                      <>
                        <Label>Which subject is optional?</Label>
                        <select value={fourthSubIndex??""} onChange={e=>setFourthSubIndex(Number(e.target.value))}
                          style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1.5px solid var(--border)",background:"var(--surface)",color:"var(--text)",fontSize:13,outline:"none"}}>
                          <option value="">-- Select --</option>
                          {Array(Number(subjectCount)).fill(null).map((_,i)=>(
                            <option key={i} value={i}>{subjectNames[i]?.trim()||`Subject ${i+1}`}</option>
                          ))}
                        </select>
                        <div style={{marginTop:10}}>
                          <Label>Grade Point Bonus</Label>
                          {[{label:"A+ (GP 5)",key:5},{label:"A (GP 4)",key:4},{label:"A- (GP 3.5)",key:3.5}].map(({label,key})=>(
                            <div key={key} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
                              <div style={{flex:1,fontSize:12,color:"var(--text2)"}}>{label}</div>
                              <input type="number" value={fourthSubExtraPoints[key]??""} min={0} max={10}
                                onChange={e=>setFourthSubExtraPoints(prev=>({...prev,[key]:Number(e.target.value)}))}
                                style={{width:65,textAlign:"center"}} />
                              <span style={{fontSize:11,color:"var(--text3)"}}>pts</span>
                            </div>
                          ))}
                          <div style={{fontSize:11,color:"var(--text2)"}}>GP below 3.5 → 0 bonus · GPA capped at 5.00</div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Custom Grading Scale */}
                  <div>
                    <label style={{display:"flex",alignItems:"center",gap:9,fontSize:12.5,fontWeight:600,cursor:"pointer",marginBottom:8}}>
                      <input type="checkbox" checked={showGradingEditor}
                        onChange={e=>{setShowGradingEditor(e.target.checked);if(!e.target.checked)setCustomGrading(null);}}
                        style={{width:"auto",accentColor:"var(--sky)",cursor:"pointer"}} />
                      Custom Grading Scale
                    </label>
                    {showGradingEditor&&(
                      <div style={{display:"flex",flexDirection:"column",gap:7}}>
                        <div style={{fontSize:11,color:"var(--text2)",marginBottom:2}}>Minimum mark to achieve each grade:</div>
                        {(customGrading||DEFAULT_GRADING).map((row,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:36,fontWeight:700,fontSize:12,color:gradeColor(row.grade),fontFamily:"var(--font-mono)"}}>{row.grade}</div>
                            <div style={{fontSize:11,color:"var(--text2)",width:50}}>GP {row.gp}</div>
                            <div style={{flex:1,fontSize:11,color:"var(--text2)"}}>Min mark</div>
                            <input type="number" value={row.min} min={0} max={100}
                              onChange={e=>{const u=(customGrading||DEFAULT_GRADING).map((r,j)=>j===i?{...r,min:Number(e.target.value)}:r);setCustomGrading(u);}}
                              style={{width:70,textAlign:"center"}} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Btn onClick={createProject} loading={saving} style={{width:"100%",marginTop:4}}>
                    Create Project →
                  </Btn>
                </div>
              </Card>
            )}

            {/* ── ENTRY ────────────────────────────────────────────────── */}
            {page === "app" && (
              <div style={{ animation: "up 0.28s ease" }}>
                {!activeProject ? (
                  <Card>
                    <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text2)", fontSize: 13 }}>
                      No project selected.{" "}
                      <span style={{ color: "var(--sky)", cursor: "pointer", fontWeight: 700 }} onClick={() => go("home")}>
                        Go home →
                      </span>
                    </div>
                  </Card>
                ) : (
                  <>
                    {/* Project header */}
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      marginBottom: 18, paddingTop: 6,
                    }}>
                      <div>
                        <div style={{ fontSize: 9.5, color: "var(--sky)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
                          Active Project
                        </div>
                        <h2 style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em" }}>{activeProject.examName}</h2>
                      </div>
                      <div style={{
                        background: "color-mix(in srgb,var(--sky) 10%,var(--surface2))",
                        border: "1.5px solid color-mix(in srgb,var(--sky) 22%,var(--border))",
                        borderRadius: 10, padding: "5px 13px", fontSize: 13,
                        color: "var(--sky)", fontWeight: 700, fontFamily: "var(--font-mono)",
                      }}>
                        {activeProject.students.length} students
                      </div>
                    </div>

                    {/* Add Student */}
                    <Card style={{ marginBottom: 12, borderRadius: 18 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 13, letterSpacing: "-0.01em" }}>
                        Add / Update Student
                      </div>
                      <div style={{ display: "flex", gap: 9, marginBottom: 11 }}>
                        <input placeholder="Student Name" value={name} onChange={e => setName(e.target.value)} />
                        <input placeholder="Roll No." value={roll} onChange={e => setRoll(e.target.value)} style={{ maxWidth: 105 }} />
                      </div>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${Math.min(activeProject.subjectCount, 3)}, 1fr)`,
                        gap: 7, marginBottom: 13,
                      }}>
                        {marks.map((m,i)=>{
                          const subName = activeProject.subjectNames?.[i];
                          const outOf   = (activeProject.examOutOfs||[])[i]||100;
                          const pct     = outOf>0?(Number(m)/outOf)*100:0;
                          const mc = m===""?"var(--border)":pct>=80?"var(--green)":pct<(activeProject.passThreshold??33)?"var(--red)":"var(--sky)";
                          return (
                            <div key={i} style={{position:"relative"}}>
                              <input type="number" value={m}
                                placeholder={subName?subName.slice(0,8):`Sub ${i+1}`}
                                onChange={e=>updateMark(i,e.target.value)} min={0} max={outOf}
                                style={{borderColor:m!==""?mc:undefined,textAlign:"center"}} />
                              <div style={{fontSize:9,color:"var(--text3)",textAlign:"center",marginTop:2}}>/{outOf}</div>
                            </div>
                          );
                        })}
                      </div>
                      {/* Assignment marks entry */}
                      {activeProject.useExtra&&(
                        <div style={{marginBottom:11,padding:"14px",borderRadius:12,background:"var(--surface2)",border:"1.5px solid var(--border)"}}>
                          <div style={{fontWeight:700,fontSize:12.5,marginBottom:12}}>
                            📋 Assignments <span style={{color:"var(--sky)",fontWeight:500,fontSize:11}}>({activeProject.extraPct}% of final)</span>
                          </div>
                          {Array(activeProject.subjectCount).fill(null).map((_,si)=>{
                            const subName=activeProject.subjectNames?.[si]||`Subject ${si+1}`;
                            const ac=activeProject.assignCount||1;
                            const aoof=activeProject.assignOutOf||20;
                            return(
                              <div key={si} style={{marginBottom:12}}>
                                <div style={{fontSize:11.5,fontWeight:700,marginBottom:6,paddingBottom:4,borderBottom:"1px solid var(--border)"}}>{subName}</div>
                                {Array(ac).fill(null).map((_,ai)=>{
                                  const score=((assignScores||[])[si]||[])[ai]||"";
                                  return(
                                    <div key={ai} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                                      <div style={{fontSize:11,color:"var(--text2)",minWidth:82}}>Assignment {ai+1}</div>
                                      <input type="number" placeholder="0" value={score}
                                        onChange={e=>{const u=(assignScores||[]).map((sub,s)=>s===si?[...(sub||[])].map((v,j)=>j===ai?e.target.value:v):sub);setAssignScores(u);}}
                                        min={0} max={aoof} style={{flex:1,textAlign:"center"}} />
                                      <span style={{fontSize:11,color:"var(--text3)",minWidth:32}}>/{aoof}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {/* Live preview */}
                      {marks.every(m=>m!=="")&&(()=>{
                        const numsRaw=marks.map(Number);
                        if(numsRaw.some(isNaN)||numsRaw.some(m=>m<0)) return null;
                        const eOutOfs=activeProject.examOutOfs||Array(activeProject.subjectCount).fill(100);
                        const {gpa:avgGP,grade,total,status}=calcStudent(numsRaw,eOutOfs,assignScores);
                        const fail=status==="FAIL";
                        return(
                          <div style={{padding:"10px 14px",borderRadius:10,marginBottom:11,background:"var(--surface2)",border:"1.5px solid var(--border)",display:"flex",alignItems:"center",gap:14,fontSize:12.5,flexWrap:"wrap"}}>
                            <span style={{color:"var(--text2)"}}>Preview →</span>
                            <span style={{fontWeight:700}}>Total: <span style={{color:"var(--sky)",fontFamily:"var(--font-mono)"}}>{total}</span></span>
                            <span style={{fontWeight:700}}>GPA: <span style={{color:gradeColor(grade),fontFamily:"var(--font-mono)"}}>{avgGP}</span></span>
                            <span style={{fontWeight:700}}>Grade: <span style={{color:gradeColor(grade)}}>{grade}</span></span>
                            <Pill color={fail?"var(--red)":"var(--green)"}>{fail?"FAIL":"PASS"}</Pill>
                          </div>
                        );
                      })()}
                      <Btn onClick={addStudent} loading={saving} style={{width:"100%"}}>+ Add Student</Btn>
                    </Card>

                    {/* Search */}
                    <Card style={{ marginBottom: 12, borderRadius: 18 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 11, letterSpacing: "-0.01em" }}>Search Student</div>
                      <div style={{ display: "flex", gap: 9 }}>
                        <input placeholder="Enter Roll No." value={searchRoll}
                          onChange={e => setSearchRoll(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && search()} />
                        <Btn variant="secondary" onClick={search} style={{ whiteSpace: "nowrap" }}>Search</Btn>
                      </div>
                    </Card>

                    {/* View Student */}
                    {viewStudent && (
                      <Card style={{
                        border: `1.5px solid color-mix(in srgb,${gradeColor(viewStudent.grade)} 28%,var(--border))`,
                        background: `color-mix(in srgb,${gradeColor(viewStudent.grade)} 4%,var(--surface))`,
                        animation: "up 0.25s ease", borderRadius: 18, marginBottom: 12,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>{viewStudent.name}</div>
                            <div style={{ color: "var(--text2)", fontSize: 12, marginTop: 2 }}>Roll: {viewStudent.roll}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 30, fontWeight: 800, color: gradeColor(viewStudent.grade), fontFamily: "var(--font-mono)", lineHeight: 1 }}>
                              {viewStudent.grade}
                            </div>
                            <div style={{ marginTop: 4 }}>
                              <Pill color={viewStudent.status === "PASS" ? "var(--green)" : "var(--red)"}>
                                {viewStudent.status}
                              </Pill>
                            </div>
                          </div>
                        </div>

                        {/* ── Summary card ── */}
                        {(()=>{
                          const proj   = activeProject||{};
                          const thresh = proj.passThreshold??33;
                          const avg    = viewStudent.total!=null&&proj.subjectCount
                            ?(viewStudent.total/proj.subjectCount).toFixed(1):"—";
                          const rank   = meritRanks[viewStudent.roll]||"—";
                          const gc     = gradeColor(viewStudent.grade);
                          return(
                            <div style={{marginBottom:14}}>
                              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:10}}>
                                {[
                                  {label:"GPA",        value:viewStudent.gpa,  color:gc,              big:true},
                                  {label:"Merit Rank", value:`#${rank}`,       color:"var(--yellow)", big:true},
                                  {label:"Total Marks",value:viewStudent.total, color:"var(--sky)",   big:false},
                                  {label:"Avg Mark",   value:avg,              color:"var(--sky)",    big:false},
                                ].map(({label,value,color,big})=>(
                                  <div key={label} style={{background:"var(--surface2)",border:"1.5px solid var(--border)",borderRadius:14,padding:"13px 10px",textAlign:"center"}}>
                                    <div style={{fontSize:10,color:"var(--text2)",fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:5}}>{label}</div>
                                    <div style={{fontSize:big?26:18,fontWeight:800,color,fontFamily:"var(--font-mono)",lineHeight:1}}>{value}</div>
                                  </div>
                                ))}
                              </div>
                              {viewStudent.finalMarks&&(
                                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                                  {viewStudent.finalMarks.map((fm,i)=>{
                                    const subName=(proj.subjectNames?.[i]||`S${i+1}`).slice(0,6);
                                    const fc=fm>=80?"var(--green)":fm<thresh?"var(--red)":"var(--sky)";
                                    return(
                                      <div key={i} style={{flex:"1 1 55px",background:"var(--surface2)",border:`1.5px solid ${fc}33`,borderRadius:10,padding:"7px 4px",textAlign:"center"}}>
                                        <div style={{fontSize:9,color:"var(--text2)",marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{subName}</div>
                                        <div style={{fontSize:15,fontWeight:800,color:fc,fontFamily:"var(--font-mono)"}}>{fm}</div>
                                        <div style={{fontSize:9,color:"var(--text3)",marginTop:1}}>{getGrade(getGP(fm))}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                        <div style={{display:"flex",gap:9}}>
                          <Btn onClick={()=>downloadMarksheet(viewStudent,activeProject,showToast)} style={{flex:1}}>
                            📋 Download Marksheet
                          </Btn>
                          <Btn variant="danger" onClick={()=>deleteStudent(viewStudent.roll)} style={{padding:"11px 14px"}}>
                            🗑
                          </Btn>
                        </div>
                      </Card>
                    )}

                    {/* Student list in entry page */}
                    {activeProject.students.length > 0 && (
                      <Card style={{ borderRadius: 18, padding: 0, overflow: "hidden" }}>
                        <div style={{ padding: "14px 16px 10px", borderBottom: "1.5px solid var(--border)" }}>
                          <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}>
                            All Students ({activeProject.students.length})
                          </div>
                        </div>
                        <div style={{ overflowX: "auto" }}>
                          <table>
                            <thead>
                              <tr>
                                <th style={{ paddingLeft: 16 }}>Name</th>
                                <th>Roll</th>
                                <th>GPA</th>
                                <th>Status</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {sortedByRoll.map(s => (
                                <tr key={s.roll} style={{ cursor: "pointer" }}
                                  onClick={() => setViewStudent(s)}>
                                  <td style={{ fontWeight: 600, paddingLeft: 16 }}>{s.name}</td>
                                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--text2)", fontSize: 12 }}>{s.roll}</td>
                                  <td style={{ fontWeight: 700, color: gradeColor(s.grade), fontFamily: "var(--font-mono)" }}>{s.gpa}</td>
                                  <td><Pill color={s.status === "PASS" ? "var(--green)" : "var(--red)"}>{s.status}</Pill></td>
                                  <td style={{ width: 36 }}>
                                    <button onClick={e => { e.stopPropagation(); deleteStudent(s.roll); }} style={{
                                      background: "none", border: "none", color: "var(--text3)",
                                      fontSize: 14, cursor: "pointer", padding: "2px 6px",
                                    }}>✕</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── SUMMARY ──────────────────────────────────────────────── */}
            {page === "summary" && (
              <div style={{ animation: "up 0.28s ease" }}>
                <SectionHeader
                  label="Analytics"
                  title="Summary"
                  subtitle={activeProject ? activeProject.examName : "Select a project first"}
                />
                {!activeProject?.students.length ? (
                  <Card><div style={{ color: "var(--text2)", textAlign: "center", fontSize: 13, padding: "20px 0" }}>No data yet.</div></Card>
                ) : (() => {
                  const s = summaryStats();
                  const subStats = getSubjectStats();
                  return (
                    <>
                      {/* KPI row */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 9 }}>
                        <StatTile label="Total Students" value={s.total} />
                        <StatTile label="Pass Rate" value={`${s.rate}%`} color="var(--green)" />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 9 }}>
                        <StatTile
                          label="Passed" value={s.pass} color="var(--green)"
                          onClick={() => setStudentModal({
                            title: "Passed Students",
                            students: activeProject.students.filter(st => st.status === "PASS"),
                            color: "var(--green)",
                          })}
                        />
                        <StatTile
                          label="Failed" value={s.fail} color="var(--red)"
                          onClick={() => setStudentModal({
                            title: "Failed Students",
                            students: activeProject.students.filter(st => st.status === "FAIL"),
                            color: "var(--red)",
                          })}
                        />
                      </div>
                      <div style={{ marginBottom: 13 }}>
                        <StatTile label="Average GPA" value={s.avg} color="var(--sky)" style={{ display: "block" }} />
                      </div>

                      {/* Pass/Fail bar */}
                      <Card style={{ marginBottom: 13, borderRadius: 16, padding: "16px 18px" }}>
                        <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 12, letterSpacing: "-0.01em" }}>Pass/Fail Overview</div>
                        <div style={{ height: 10, borderRadius: 6, background: "color-mix(in srgb,var(--red) 15%,var(--surface2))", overflow: "hidden", marginBottom: 8 }}>
                          <div style={{
                            height: 10, borderRadius: 6, background: "var(--green)",
                            width: `${s.rate}%`, transition: "width 0.8s ease",
                          }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                          <span style={{ color: "var(--green)", fontWeight: 600 }}>✓ {s.pass} Passed ({s.rate}%)</span>
                          <span style={{ color: "var(--red)", fontWeight: 600 }}>✕ {s.fail} Failed</span>
                        </div>
                      </Card>

                      {/* Grade Distribution */}
                      <Card style={{ borderRadius: 16 }}>
                        <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 16, letterSpacing: "-0.01em" }}>Grade Distribution</div>
                        {["A+", "A", "A-", "B", "C", "D", "F"].map(g => {
                          const gstuds = activeProject.students.filter(x => x.grade === g);
                          const count = gstuds.length;
                          const pct = ((count / activeProject.students.length) * 100).toFixed(0);
                          return (
                            <div key={g} style={{ marginBottom: 12 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, marginBottom: 5 }}>
                                <span style={{ fontWeight: 800, color: gradeColor(g), minWidth: 26, fontFamily: "var(--font-mono)" }}>{g}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ color: "var(--text2)", fontFamily: "var(--font-mono)", fontSize: 11.5 }}>
                                    {count} ({pct}%)
                                  </span>
                                  {count > 0 && (
                                    <button onClick={() => setStudentModal({
                                      title: `Grade ${g} Students`,
                                      students: gstuds,
                                      color: gradeColor(g),
                                    })} style={{
                                      padding: "3px 9px", borderRadius: 7,
                                      border: `1.5px solid color-mix(in srgb,${gradeColor(g)} 28%,transparent)`,
                                      background: `color-mix(in srgb,${gradeColor(g)} 8%,transparent)`,
                                      color: gradeColor(g), fontSize: 10, fontWeight: 700, cursor: "pointer",
                                    }}>View</button>
                                  )}
                                </div>
                              </div>
                              <div style={{ height: 6, borderRadius: 4, background: "var(--border)", overflow: "hidden" }}>
                                <div style={{
                                  height: 6, borderRadius: 4, width: `${pct}%`,
                                  background: gradeColor(g), transition: "width 0.7s ease"
                                }} />
                              </div>
                            </div>
                          );
                        })}
                      </Card>

                      {/* NEW: Subject Performance */}
                      {subStats.length > 0 && (
                        <Card style={{ marginTop: 13, borderRadius: 16 }}>
                          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 14, letterSpacing: "-0.01em" }}>Subject Performance</div>
                          {subStats.map((sub, i) => (
                            <div key={i} style={{
                              padding: "10px 12px", borderRadius: 11, marginBottom: 8,
                              background: "var(--surface2)", border: "1.5px solid var(--border)",
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                <div style={{ fontWeight: 600, fontSize: 12.5 }}>{sub.name}</div>
                                <div style={{ display: "flex", gap: 8, fontSize: 11, color: "var(--text2)" }}>
                                  <span>Avg: <b style={{ color: "var(--sky)", fontFamily: "var(--font-mono)" }}>{sub.avg}</b></span>
                                  <span>Pass: <b style={{ color: "var(--green)", fontFamily: "var(--font-mono)" }}>{sub.passRate}%</b></span>
                                </div>
                              </div>
                              <div style={{ height: 4, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
                                <div style={{
                                  height: 4, borderRadius: 3,
                                  width: `${sub.avg}%`,
                                  background: Number(sub.avg) >= 60 ? "var(--green)" : Number(sub.avg) >= 40 ? "var(--yellow)" : "var(--red)",
                                  transition: "width 0.7s ease",
                                }} />
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--text3)", marginTop: 4 }}>
                                <span>Lowest: {sub.lowest}</span>
                                <span>Highest: {sub.highest}</span>
                              </div>
                            </div>
                          ))}
                        </Card>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {/* ── MERIT ────────────────────────────────────────────────── */}
            {page === "merit" && (
              <div style={{ animation: "up 0.28s ease" }}>
                <SectionHeader
                  label="Rankings"
                  title="Merit Table"
                  subtitle={`${activeProject?.examName || "—"} · sorted by Roll No.`}
                />

                {!activeProject || !sortedByRoll.length ? (
                  <Card><div style={{ color: "var(--text2)", textAlign: "center", fontSize: 13, padding: "20px 0" }}>No students to display.</div></Card>
                ) : (
                  <>
                    {/* Top 3 podium */}
                    {top3.length > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <div style={{
                          fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em",
                          textTransform: "uppercase", color: "var(--text2)", marginBottom: 12
                        }}>🏆 Top Performers</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                          {[1, 0, 2].map(idx => {
                            const s = top3[idx];
                            if (!s) return <div key={idx} style={{ flex: 1 }} />;
                            const mc = medalColors[idx];
                            const isFirst = idx === 0;
                            return (
                              <div key={s.roll} style={{
                                flex: 1,
                                background: `color-mix(in srgb,${mc} 8%,var(--surface))`,
                                border: `1.5px solid color-mix(in srgb,${mc} 28%,var(--border))`,
                                borderRadius: 16,
                                padding: isFirst ? "20px 10px 16px" : "14px 10px 14px",
                                textAlign: "center",
                                transform: isFirst ? "translateY(-6px)" : "none",
                                boxShadow: isFirst ? `0 8px 24px color-mix(in srgb,${mc} 18%,transparent)` : "none",
                              }}>
                                <div style={{ fontSize: isFirst ? 28 : 22, marginBottom: 6 }}>{medals[idx]}</div>
                                <div style={{ fontWeight: 800, fontSize: 12.5, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>
                                  {s.name}
                                </div>
                                <div style={{ color: "var(--text2)", fontSize: 10, marginBottom: 8 }}>Roll: {s.roll}</div>
                                <div style={{
                                  display: "inline-block", padding: "3px 10px", borderRadius: 10,
                                  background: `color-mix(in srgb,${mc} 18%,transparent)`,
                                  color: mc, fontSize: 12, fontWeight: 800, fontFamily: "var(--font-mono)",
                                }}>GPA {s.gpa}</div>
                                <div style={{ marginTop: 6 }}>
                                  <Pill color={gradeColor(s.grade)}>{s.grade}</Pill>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <Card style={{ overflowX: "auto", padding: 0, marginBottom: 14, borderRadius: 18 }}>
                      <table>
                        <thead>
                          <tr>
                            <th style={{ paddingLeft: 16 }}>#</th>
                            <th>Name</th>
                            <th>Roll</th>
                            <th>Merit</th>
                            <th>GPA</th>
                            <th>Grade</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedByRoll.map((s, i) => {
                            const rank = meritRanks[s.roll];
                            const rankColor = rank === 1 ? "#f59e0b" : rank === 2 ? "#94a3b8" : rank === 3 ? "#cd7c2f" : null;
                            return (
                              <tr key={s.roll}>
                                <td style={{ paddingLeft: 16, color: "var(--text2)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{i + 1}</td>
                                <td style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</td>
                                <td style={{ fontFamily: "var(--font-mono)", color: "var(--text2)", fontSize: 12 }}>{s.roll}</td>
                                <td>
                                  {rankColor ? (
                                    <span style={{
                                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                                      width: 26, height: 26, borderRadius: "50%", fontSize: 11, fontWeight: 800,
                                      background: rankColor, color: "#fff",
                                    }}>{rank}</span>
                                  ) : (
                                    <span style={{ color: "var(--text2)", fontSize: 12, fontFamily: "var(--font-mono)" }}>#{rank}</span>
                                  )}
                                </td>
                                <td style={{ fontWeight: 700, color: gradeColor(s.grade), fontFamily: "var(--font-mono)" }}>{s.gpa}</td>
                                <td><Pill color={gradeColor(s.grade)}>{s.grade}</Pill></td>
                                <td style={{ fontFamily: "var(--font-mono)", fontSize: 12.5 }}>{s.total}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </Card>

                    <Btn onClick={() => downloadMeritListPDF(activeProject, showToast)}
                      style={{ width: "100%", padding: "14px" }} size="lg">
                      ⬇ Download Merit List PDF
                    </Btn>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {fbReady && authReady && user && !fbError && !isAccountBlocked && (
        <Dock page={page} go={go} isAdmin={isAdmin} onAdminOpen={() => setShowAdmin(true)} />
      )}
    </>
  );
  }
