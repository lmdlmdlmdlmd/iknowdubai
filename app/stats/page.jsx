"use client";

import { useState, useEffect } from 'react';

// TODO: Replace with PostHog API fetch
// Endpoint: POST https://eu.i.posthog.com/api/projects/{PROJECT_ID}/insights/
// Use posthog-node or fetch with personal API key (server-side via Next.js API route)
// Events to query: quiz_completed, certificate_downloaded, shared_on_x
const stats = {
  totalQuizzes: 1247,
  distribution: {
    earned: 89,
    qualified: 312,
    wrong: 445,
    bullshitter: 287,
    american: 114,
  },
  averageScore: 42,
  certificatesDownloaded: 634,
  sharedOnX: 218,
  topCountries: [
    { flag: '🇦🇪', name: 'UAE', count: 389 },
    { flag: '🇺🇸', name: 'United States', count: 276 },
    { flag: '🇬🇧', name: 'United Kingdom', count: 198 },
    { flag: '🇮🇳', name: 'India', count: 142 },
    { flag: '🇩🇪', name: 'Germany', count: 87 },
  ],
};

const tiers = [
  { key: 'earned', emoji: '🏆', label: 'Earned Your Opinion', color: '#D4AF37' },
  { key: 'qualified', emoji: '⚠️', label: 'Qualified-ish', color: '#7CB3BD' },
  { key: 'wrong', emoji: '🤡', label: 'Confidently Wrong', color: '#DEBB94' },
  { key: 'bullshitter', emoji: '💩', label: 'Certified Bullshitter', color: '#D9A87E' },
  { key: 'american', emoji: '🦅', label: 'Americans', color: '#E5CBA8' },
];

export default function StatsPage() {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem('stats_auth') === 'ps') {
      setIsUnlocked(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'ps') {
      localStorage.setItem('stats_auth', 'ps');
      setIsUnlocked(true);
    }
  };

  const maxCount = Math.max(...Object.values(stats.distribution));

  // Don't render until mounted to avoid hydration mismatch with localStorage
  if (!mounted) return null;

  return (
    <>
      <style>{`
        .font-archivo {
          font-family: 'Archivo Black', sans-serif;
        }
        .font-space {
          font-family: 'Space Mono', monospace;
        }
      `}</style>

      <div
        className="min-h-screen flex flex-col items-center px-6 py-12 relative overflow-hidden"
        style={{
          background: `linear-gradient(180deg,
            #F5EBD7 0%,
            #EDDFCB 25%,
            #E5CBA8 50%,
            #DEBB94 75%,
            #D9A87E 100%
          )`,
        }}
      >
        {/* Gold accent bar */}
        <div
          className="absolute top-0 left-0 w-full"
          style={{ height: '6px', backgroundColor: '#D4AF37' }}
        />

        {/* Logo */}
        <div className="absolute top-5 left-0 w-full flex justify-center" style={{ zIndex: 20 }}>
          <a
            href="/"
            className="font-archivo"
            style={{
              color: '#1A0F08',
              fontSize: '18px',
              textDecoration: 'none',
              textTransform: 'lowercase',
              letterSpacing: '-0.01em',
            }}
          >
            iknowdubai.lol
          </a>
        </div>

        {/* Password Gate */}
        {!isUnlocked && (
          <div className="flex flex-col items-center justify-center" style={{ minHeight: '60vh', marginTop: '60px' }}>
            <div
              style={{
                backgroundColor: '#F5EBD7',
                border: '4px solid #2A1810',
                padding: '32px 28px',
                textAlign: 'center',
                width: '100%',
                maxWidth: '400px',
              }}
            >
              <p
                className="font-space"
                style={{
                  color: '#2A1810',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  marginBottom: '16px',
                }}
              >
                RESTRICTED ACCESS
              </p>
              <h2
                className="font-archivo"
                style={{
                  color: '#1A0F08',
                  fontSize: '1.5rem',
                  textTransform: 'uppercase',
                  marginBottom: '24px',
                }}
              >
                Enter Password
              </h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-space"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: 700,
                    backgroundColor: '#EDDFCB',
                    border: '3px solid #2A1810',
                    borderRadius: 0,
                    color: '#1A0F08',
                    textAlign: 'center',
                    letterSpacing: '0.1em',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  placeholder="••••"
                  autoFocus
                />
                <button
                  type="submit"
                  onMouseEnter={() => setHoveredButton('unlock')}
                  onMouseLeave={() => setHoveredButton(null)}
                  className="font-space"
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    backgroundColor: '#7CB3BD',
                    color: '#1A0F08',
                    padding: '14px 32px',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    border: '3px solid #2A1810',
                    borderRadius: 0,
                    cursor: 'pointer',
                    transform: hoveredButton === 'unlock' ? 'translate(-4px, -4px)' : 'translate(0, 0)',
                    boxShadow: hoveredButton === 'unlock' ? '4px 4px 0 #2A1810' : 'none',
                    transition: 'none',
                  }}
                >
                  UNLOCK
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Stats Dashboard */}
        {isUnlocked && (
          <div className="max-w-xl w-full flex flex-col gap-4" style={{ marginTop: '60px' }}>

            {/* Headline */}
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <p
                className="font-space"
                style={{
                  color: '#2A1810',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  marginBottom: '8px',
                }}
              >
                THE STATS ARE IN
              </p>
              <h1
                className="font-archivo"
                style={{
                  color: '#1A0F08',
                  fontSize: 'clamp(1.3rem, 5vw, 2rem)',
                  textTransform: 'uppercase',
                  lineHeight: 1.05,
                }}
              >
                How Dubai-Pilled Is The Internet?
              </h1>
            </div>

            {/* Hero Stat: Total Quizzes */}
            <div
              style={{
                backgroundColor: '#F5EBD7',
                border: '4px solid #2A1810',
                padding: '28px 20px',
                textAlign: 'center',
              }}
            >
              <p
                className="font-archivo"
                style={{
                  color: '#1A0F08',
                  fontSize: 'clamp(3rem, 10vw, 5rem)',
                  lineHeight: 1,
                }}
              >
                {stats.totalQuizzes.toLocaleString()}
              </p>
              <p
                className="font-space"
                style={{
                  color: '#2A1810',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  marginTop: '8px',
                }}
              >
                QUIZZES COMPLETED
              </p>
            </div>

            {/* Results Distribution */}
            <div
              style={{
                backgroundColor: '#F5EBD7',
                border: '4px solid #2A1810',
                padding: '24px 20px',
              }}
            >
              <p
                className="font-space"
                style={{
                  color: '#2A1810',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  marginBottom: '16px',
                  textAlign: 'center',
                }}
              >
                RESULTS DISTRIBUTION
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tiers.map((tier) => {
                  const count = stats.distribution[tier.key];
                  const pct = Math.round((count / stats.totalQuizzes) * 100);
                  const barWidth = Math.round((count / maxCount) * 100);
                  return (
                    <div key={tier.key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                        <span
                          className="font-space"
                          style={{
                            color: '#2A1810',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          {tier.emoji} {tier.label}
                        </span>
                        <span
                          className="font-space"
                          style={{
                            color: '#2A1810',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: '20px',
                          backgroundColor: '#EDDFCB',
                          border: '2px solid #2A1810',
                        }}
                      >
                        <div
                          style={{
                            width: `${barWidth}%`,
                            height: '100%',
                            backgroundColor: tier.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Average Score */}
            <div
              style={{
                backgroundColor: '#F5EBD7',
                border: '4px solid #2A1810',
                padding: '24px 20px',
                textAlign: 'center',
              }}
            >
              <p
                className="font-space"
                style={{
                  color: '#2A1810',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  marginBottom: '8px',
                }}
              >
                AVERAGE SCORE
              </p>
              <p
                className="font-archivo"
                style={{
                  color: '#1A0F08',
                  fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                  lineHeight: 1,
                }}
              >
                {stats.averageScore}%
              </p>
              <p
                className="font-space"
                style={{
                  color: '#2A1810',
                  fontSize: '11px',
                  fontWeight: 700,
                  marginTop: '8px',
                  opacity: 0.7,
                }}
              >
                THE INTERNET IS CONFIDENTLY WRONG
              </p>
            </div>

            {/* Engagement Stats - Two Column */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div
                style={{
                  backgroundColor: '#F5EBD7',
                  border: '4px solid #2A1810',
                  padding: '20px 16px',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '28px', marginBottom: '4px' }}>📥</p>
                <p
                  className="font-archivo"
                  style={{
                    color: '#1A0F08',
                    fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
                    lineHeight: 1,
                  }}
                >
                  {stats.certificatesDownloaded.toLocaleString()}
                </p>
                <p
                  className="font-space"
                  style={{
                    color: '#2A1810',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    marginTop: '6px',
                  }}
                >
                  CERTIFICATES
                </p>
              </div>

              <div
                style={{
                  backgroundColor: '#F5EBD7',
                  border: '4px solid #2A1810',
                  padding: '20px 16px',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '28px', marginBottom: '4px' }}>🐦</p>
                <p
                  className="font-archivo"
                  style={{
                    color: '#1A0F08',
                    fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
                    lineHeight: 1,
                  }}
                >
                  {stats.sharedOnX.toLocaleString()}
                </p>
                <p
                  className="font-space"
                  style={{
                    color: '#2A1810',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    marginTop: '6px',
                  }}
                >
                  SHARED ON X
                </p>
              </div>
            </div>

            {/* Top Countries */}
            <div
              style={{
                backgroundColor: '#F5EBD7',
                border: '4px solid #2A1810',
                padding: '24px 20px',
              }}
            >
              <p
                className="font-space"
                style={{
                  color: '#2A1810',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  marginBottom: '16px',
                  textAlign: 'center',
                }}
              >
                TOP COUNTRIES
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stats.topCountries.map((country, i) => (
                  <div
                    key={country.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: i === 0 ? '#D4AF37' : 'transparent',
                      border: i === 0 ? '2px solid #2A1810' : '2px solid transparent',
                    }}
                  >
                    <span
                      className="font-space"
                      style={{
                        color: '#2A1810',
                        fontSize: '13px',
                        fontWeight: 700,
                      }}
                    >
                      {i + 1}. {country.flag} {country.name}
                    </span>
                    <span
                      className="font-archivo"
                      style={{
                        color: '#1A0F08',
                        fontSize: '16px',
                      }}
                    >
                      {country.count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', padding: '20px 0 8px' }}>
              <p
                className="font-space"
                style={{
                  color: '#2A1810',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  opacity: 0.6,
                  marginBottom: '12px',
                }}
              >
                LAST UPDATED: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
              </p>
              <p
                className="font-archivo"
                style={{
                  color: '#1A0F08',
                  fontSize: '16px',
                  textTransform: 'lowercase',
                }}
              >
                iknowdubai.lol
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
