import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Video, Scissors } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="fade-in" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Topographic Background Overlay */}
      <div className="topo-pattern" />

      {/* Hero Section */}
      <section style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto 3.5rem', padding: '0 1rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: 'rgba(236, 72, 153, 0.1)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            borderRadius: '999px',
            fontSize: '0.85rem',
            color: 'var(--primary-pink)',
            fontWeight: 600,
            marginBottom: '1.25rem',
          }}
        >
          <Sparkles size={16} /> AI Powered Teaser Generator
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 4rem)',
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            color: '#ffffff',
          }}
        >
          Transform Long Videos into <span className="gradient-text">Engaging Teasers</span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '2rem',
            fontWeight: 400,
          }}
        >
          Upload your raw video, let our backend extract speech-to-text transcripts, identify peak viral moments, and automatically slice a ready-to-share teaser.
        </p>

        <div className="hero-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link to="/generator" className="btn-primary">
            <Sparkles size={18} /> Get Started Now <ArrowRight size={18} />
          </Link>
          {!user && (
            <Link to="/login" className="btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '999px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
              Sign In
            </Link>
          )}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="container" style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.85rem', marginBottom: '0.5rem', color: '#ffffff' }}>
            Built for <span style={{ background: 'linear-gradient(135deg, var(--primary-pink) 0%, #ffffff 50%, var(--primary-cyan) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Everyone</span>
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Streamlined pipeline from long-form content to short viral highlights
          </p>
        </div>

        <div className="grid-2">
          <div className="glass-card">
            <div
              className="icon-bounce"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(236, 72, 153, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-pink)',
                marginBottom: '1rem',
                transition: 'transform 0.3s ease',
              }}
            >
              <Video size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: '#ffffff' }}>Single Video Focus</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
              Simple, uncluttered interface designed to take one video file at a time and produce a high-impact teaser without any complexities.
            </p>
          </div>

          <div className="glass-card">
            <div
              className="icon-bounce"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-cyan)',
                marginBottom: '1rem',
                transition: 'transform 0.3s ease',
              }}
            >
              <Scissors size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: '#ffffff' }}>FFmpeg & Speech AI</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
              Precision audio extraction and timestamped transcript analysis isolate key hooks, punchlines, and core insights automatically.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container" style={{ position: 'relative', marginTop: '5rem', marginBottom: '3rem' }}>
        {/* Glow Effects behind the card */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '160px',
          background: 'radial-gradient(ellipse, rgba(236, 72, 153, 0.22) 0%, rgba(6, 182, 212, 0.22) 50%, transparent 100%)',
          filter: 'blur(60px)',
          zIndex: -1,
          pointerEvents: 'none'
        }} />

        <div
          className="glass-card"
          style={{
            background: 'linear-gradient(135deg, rgba(13, 15, 23, 0.8) 0%, rgba(26, 20, 48, 0.6) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 35px rgba(147, 51, 234, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            padding: '4rem 2rem',
            textAlign: 'center',
            borderRadius: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative floating gradient glows inside the card */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '120px',
            height: '120px',
            background: 'var(--primary-pink)',
            filter: 'blur(80px)',
            opacity: 0.35,
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '120px',
            height: '120px',
            background: 'var(--primary-cyan)',
            filter: 'blur(80px)',
            opacity: 0.35,
            pointerEvents: 'none'
          }} />

          {/* Rotating Sparkle Icon Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            color: 'var(--primary-pink)',
            marginBottom: '1.5rem',
            transform: 'rotate(-6deg)',
          }}>
            <Sparkles size={24} style={{ filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.5))' }} />
          </div>

          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            marginBottom: '1rem',
            color: '#ffffff',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-display)'
          }}>
            Ready to Generate Your <span className="gradient-text">Cool Teaser?</span>
          </h2>

          <p style={{
            color: 'var(--text-muted)',
            maxWidth: '580px',
            margin: '0 auto 2.25rem',
            fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)',
            lineHeight: 1.6
          }}>
            No complicated timelines or technical setups. Just drag and drop your raw video directly into our studio generator and let the AI extract viral highlights in seconds.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Link
              to="/generator"
              className="btn-primary"
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1.05rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderRadius: '999px',
                boxShadow: '0 8px 30px rgba(236, 72, 153, 0.45)',
              }}
            >
              Open Studio Generator <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
