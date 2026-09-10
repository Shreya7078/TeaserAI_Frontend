import React, { useState, useEffect } from 'react';
import { VideoUploader } from '../components/VideoUploader';
import { ProcessingState } from '../components/ProcessingState';
import { VideoPreview } from '../components/VideoPreview';
import { ProcessingStatus, PipelineStep, SelectedVideoInfo, TeaserResult } from '../types/teaser';
import { processVideoTeaser, fetchLastGeneratedTeaser } from '../services/teaserApi';
import { ArrowLeft, AlertCircle, PlayCircle, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

export const TeaserGeneratorPage: React.FC = () => {
  const { token } = useAuth();
  const [status, setStatus] = useState<ProcessingStatus>('INITIAL');
  const [selectedVideo, setSelectedVideo] = useState<SelectedVideoInfo | null>(null);
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>('idle');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [teaserResult, setTeaserResult] = useState<TeaserResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSavedTeaser, setLastSavedTeaser] = useState<TeaserResult | null>(null);
  const [isLoadingLastTeaser, setIsLoadingLastTeaser] = useState(false);

  // Retrieve user's last generated teaser from MongoDB when opening the Studio
  useEffect(() => {
    let isMounted = true;
    if (token) {
      setIsLoadingLastTeaser(true);
      fetchLastGeneratedTeaser(token)
        .then((lastTeaser) => {
          if (isMounted && lastTeaser) {
            setLastSavedTeaser(lastTeaser);
          }
        })
        .finally(() => {
          if (isMounted) setIsLoadingLastTeaser(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleLoadLastTeaser = () => {
    if (lastSavedTeaser) {
      setTeaserResult(lastSavedTeaser);
      setStatus('SUCCESS');
      setPipelineStep('complete');
    }
  };

  const handleSelectVideo = (video: SelectedVideoInfo) => {
    setSelectedVideo(video);
    setStatus('VIDEO_SELECTED');
    setErrorMessage(null);
  };

  const handleClearVideo = () => {
    if (selectedVideo?.objectUrl) {
      URL.revokeObjectURL(selectedVideo.objectUrl);
    }
    setSelectedVideo(null);
    setStatus('INITIAL');
    setTeaserResult(null);
    setErrorMessage(null);
  };

  const handleGenerateTeaser = async () => {
    if (!selectedVideo) return;

    setStatus('UPLOADING');
    setPipelineStep('uploading');
    setProgressPercent(10);
    setErrorMessage(null);

    try {
      let isDone = false;
      const result = await processVideoTeaser(selectedVideo, token, (step, percent) => {
        if (isDone) return;
        if (step === 'uploading') setStatus('UPLOADING');
        else setStatus('PROCESSING');

        setPipelineStep(step);
        setProgressPercent(percent);
      });

      isDone = true;
      setTeaserResult(result);
      setLastSavedTeaser(result);
      setStatus('SUCCESS');
      setPipelineStep('complete');
    } catch (err) {
      console.error('Generation Error:', err);
      setStatus('ERROR');
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred during teaser generation. Please try again.'
      );
    }
  };

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
      {/* Merged Title & Back Button Header Container */}
      <div className="workspace-header-bar">
        <Link to="/" className="btn-back">
          <ArrowLeft size={16} /> Go Back
        </Link>
        <div className="workspace-header-text">
          <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.4rem)', marginBottom: '0.2rem' }}>
            Teaser Generator <span className="gradient-text">Workspace</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
            Upload your video file and generate a teaser preview.
          </p>
        </div>
      </div>

      {/* Teaser generation errors need attention without shifting the workspace layout. */}
      {status === 'ERROR' && errorMessage && (
        <div className="error-popup-backdrop" role="presentation">
          <div
            className="error-popup"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="teaser-error-title"
            aria-describedby="teaser-error-message"
          >
            <button
              type="button"
              className="error-popup-close"
              onClick={() => setErrorMessage(null)}
              aria-label="Close error message"
              title="Close"
            >
              <X size={18} />
            </button>
            <div className="error-popup-icon">
              <AlertCircle size={22} />
            </div>
            <div className="error-popup-content">
              <h2 id="teaser-error-title">Teaser generation failed</h2>
              <p id="teaser-error-message">{errorMessage}</p>
              <div className="error-popup-actions">
                <button type="button" className="btn-secondary" onClick={() => setErrorMessage(null)}>
                  Close
                </button>
                {selectedVideo && (
                  <button type="button" className="btn-primary" onClick={handleGenerateTeaser}>
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workspace Container: Left Sidebar (Desktop) + Main Content */}
      <div className={lastSavedTeaser && status !== 'SUCCESS' ? 'studio-workspace-layout fade-in' : 'fade-in'} style={!lastSavedTeaser || status === 'SUCCESS' ? { maxWidth: '800px', margin: '0 auto' } : undefined}>
        
        {/* Left Side: Last Teaser Tab (Large Screens >= 900px) */}
        {lastSavedTeaser && status !== 'SUCCESS' && (
          <aside className="last-teaser-sidebar-card studio-desktop-sidebar">
            <div className="last-teaser-tag">
              <Sparkles size={13} /> Last Teaser
            </div>

            <div
              className="last-teaser-thumb-wrapper"
              onClick={handleLoadLastTeaser}
              title="Click to open last teaser in Studio Player"
            >
              <video
                src={lastSavedTeaser.videoUrl}
                className="last-teaser-thumb-video"
                preload="metadata"
                muted
              />
              <div className="last-teaser-play-overlay">
                <div className="last-teaser-play-btn-circle">
                  <PlayCircle size={24} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={lastSavedTeaser.filename}
              >
                {lastSavedTeaser.filename || 'Previous Teaser'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Duration: {lastSavedTeaser.durationSeconds}s
              </div>
            </div>

            <button
              onClick={handleLoadLastTeaser}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.6rem',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <PlayCircle size={15} /> Open in Studio
            </button>
          </aside>
        )}

        {/* Main Content Area */}
        <div style={{ width: '100%' }}>
          {/* Previous Horizontal Banner Style for Small Screens (< 900px) */}
          {lastSavedTeaser && status !== 'SUCCESS' && status !== 'UPLOADING' && status !== 'PROCESSING' && (
            <div
              className="glass-card fade-in studio-mobile-banner"
              style={{
                margin: '0 auto 1.25rem',
                padding: '0.9rem 1.2rem',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: 'rgba(236, 72, 153, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-pink)',
                    flexShrink: 0,
                  }}
                >
                  <Sparkles size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>
                    Your Previous Teaser is Available
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lastSavedTeaser.filename || 'Previously generated video'} ({lastSavedTeaser.durationSeconds}s)
                  </div>
                </div>
              </div>
              <button
                onClick={handleLoadLastTeaser}
                className="btn-primary"
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <PlayCircle size={15} /> Open in Studio
              </button>
            </div>
          )}

          {(status === 'INITIAL' || status === 'VIDEO_SELECTED' || status === 'ERROR') && (
            <VideoUploader
              selectedVideo={selectedVideo}
              onSelectVideo={handleSelectVideo}
              onClearVideo={handleClearVideo}
              onGenerate={handleGenerateTeaser}
            />
          )}

          {(status === 'UPLOADING' || status === 'PROCESSING') && (
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <ProcessingState currentStep={pipelineStep} progressPercent={progressPercent} />
            </div>
          )}

          {status === 'SUCCESS' && teaserResult && (
            <div className="glass-card">
              <VideoPreview result={teaserResult} onReset={handleClearVideo} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
