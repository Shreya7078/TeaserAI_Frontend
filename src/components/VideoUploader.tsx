import React, { useRef, useState } from 'react';
import { UploadCloud, Trash2, Sparkles, AlertCircle, FileVideo, Youtube } from 'lucide-react';
import { SelectedVideoInfo } from '../types/teaser';

interface VideoUploaderProps {
  selectedVideo: SelectedVideoInfo | null;
  onSelectVideo: (video: SelectedVideoInfo) => void;
  onClearVideo: () => void;
  onGenerate: () => void;
  disabled?: boolean;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  selectedVideo,
  onSelectVideo,
  onClearVideo,
  onGenerate,
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'youtube'>('file');
  const [youtubeUrlInput, setYoutubeUrlInput] = useState('');
  const [customPromptInput, setCustomPromptInput] = useState(selectedVideo?.customPrompt || '');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to format byte size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileValidation = (files: FileList | null) => {
    setErrorMessage(null);
    if (!files || files.length === 0) return;

    // Strict constraint: Single file only
    if (files.length > 1) {
      setErrorMessage('Single video required. Please upload exactly one video file at a time.');
      return;
    }

    const file = files[0];

    // Strict constraint: Video type only
    if (!file.type.startsWith('video/')) {
      setErrorMessage('Invalid file type. Only video files (MP4, MOV, WebM, etc.) are allowed.');
      return;
    }

    // Strict constraint: Max file size 1GB
    const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024; // 1 GB
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File size (${formatFileSize(file.size)}) exceeds the maximum allowed limit of 1GB.`);
      return;
    }

    const videoInfo: SelectedVideoInfo = {
      file,
      name: file.name,
      sizeFormatted: formatFileSize(file.size),
      objectUrl: URL.createObjectURL(file),
      customPrompt: customPromptInput || undefined,
    };

    onSelectVideo(videoInfo);
  };

  const handleYoutubeConfirm = () => {
    setErrorMessage(null);
    if (!youtubeUrlInput.trim()) {
      setErrorMessage('Please enter a YouTube video URL.');
      return;
    }

    // Basic YouTube link format check
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!ytRegex.test(youtubeUrlInput.trim())) {
      setErrorMessage('Invalid YouTube URL. Please enter a valid YouTube link.');
      return;
    }

    const videoInfo: SelectedVideoInfo = {
      youtubeUrl: youtubeUrlInput.trim(),
      name: `YouTube Video (${youtubeUrlInput.trim().substring(0, 35)}...)`,
      customPrompt: customPromptInput || undefined,
    };

    onSelectVideo(videoInfo);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCustomPromptInput(val);
    if (selectedVideo) {
      onSelectVideo({
        ...selectedVideo,
        customPrompt: val || undefined,
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFileValidation(e.dataTransfer.files);
  };

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#ffffff',
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    width: '100%',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  };

  const textareaStyle = {
    ...inputStyle,
    resize: 'vertical' as const,
    minHeight: '80px',
  };

  return (
    <div className="glass-card" style={{ width: '100%' }}>
      <h3 style={{ marginBottom: '0.4rem', fontSize: '1.3rem' }}>
        Select Source Video
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Upload a video file or provide a YouTube link, then optionally add any prompt to guide the teaser.
      </p>

      {errorMessage && (
        <div className="alert-banner alert-error" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Hidden file input strictly allowing single file and video/* */}
      <input
        type="file"
        ref={fileInputRef}
        accept="video/*"
        multiple={false}
        onChange={(e) => handleFileValidation(e.target.files)}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      {!selectedVideo && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setActiveTab('file')}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: '8px',
              border: activeTab === 'file' ? '1px solid var(--primary-pink)' : '1px solid rgba(255, 255, 255, 0.1)',
              background: activeTab === 'file' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(255, 255, 255, 0.02)',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <FileVideo size={16} />
            Upload Video File
          </button>
          <button
            onClick={() => setActiveTab('youtube')}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: '8px',
              border: activeTab === 'youtube' ? '1px solid var(--primary-cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
              background: activeTab === 'youtube' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255, 255, 255, 0.02)',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <Youtube size={16} />
            YouTube URL
          </button>
        </div>
      )}

      {!selectedVideo ? (
        activeTab === 'file' ? (
          <div
            className={`upload-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <div className="upload-icon-wrapper">
              <UploadCloud size={36} />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: '#fff' }}>
              Click or drag & drop video here
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Supports MP4, MOV, WebM, MKV (Max 1GB • 1 video file)
            </p>

            <span
              style={{
                display: 'inline-block',
                padding: '0.35rem 0.85rem',
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '999px',
                fontSize: '0.78rem',
                color: 'var(--primary-cyan)',
                fontWeight: 500,
              }}
            >
              ✦ Upload one video
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>YouTube Video Link</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                value={youtubeUrlInput}
                onChange={(e) => setYoutubeUrlInput(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
                disabled={disabled}
              />
              <button
                onClick={handleYoutubeConfirm}
                className="btn-primary"
                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.9rem' }}
                disabled={disabled || !youtubeUrlInput.trim()}
              >
                Confirm URL
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>
              Provide a public YouTube URL to let the generator pull transcript & process clips.
            </p>
          </div>
        )
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="selected-file-card">
            <div className="file-info">
              <div className="file-icon">
                {selectedVideo.youtubeUrl ? <Youtube size={24} color="#ef4444" /> : <FileVideo size={24} />}
              </div>
              <div>
                <div className="file-name" title={selectedVideo.name}>
                  {selectedVideo.name}
                </div>
                <div className="file-size">
                  {selectedVideo.youtubeUrl ? 'YouTube Link Selected' : `${selectedVideo.sizeFormatted} • File Selected`}
                </div>
              </div>
            </div>

            <button
              className="btn-outline-danger"
              onClick={() => {
                onClearVideo();
                setYoutubeUrlInput('');
              }}
              disabled={disabled}
              title="Clear selection"
            >
              <Trash2 size={16} /> Remove
            </button>
          </div>

          {/* Quick source preview if local file */}
          {selectedVideo.objectUrl && (
            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '220px', background: '#000' }}>
              <video
                src={selectedVideo.objectUrl}
                controls
                style={{ width: '100%', maxHeight: '220px', objectFit: 'contain' }}
              />
            </div>
          )}

          {/* Quick preview placeholder if YouTube URL */}
          {selectedVideo.youtubeUrl && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', height: '140px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', padding: '1rem', textAlign: 'center' }}>
              <Youtube size={36} color="#ef4444" />
              <div style={{ fontSize: '0.85rem', color: '#fff', wordBreak: 'break-all' }}>{selectedVideo.youtubeUrl}</div>
              <span style={{ fontSize: '0.75rem' }}>Ready to queue and fetch transcript clips</span>
            </div>
          )}
        </div>
      )}

      {/* Optional prompt field */}
      <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={16} style={{ color: 'var(--primary-cyan)' }} /> 
          Extra Instructions / Custom Prompt (Optional)
        </label>
        <textarea
          placeholder="E.g., Highlight coding explanations, focus on funniest hooks, target a high-energy clip..."
          value={customPromptInput}
          onChange={handlePromptChange}
          style={textareaStyle}
          disabled={disabled}
          rows={3}
        />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>
          Guide the AI highlight processor on what moments to capture or what summary tone to use.
        </p>
      </div>

      {selectedVideo && (
        <button
          className="btn-primary"
          onClick={onGenerate}
          disabled={disabled}
          style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.05rem', marginTop: '1.25rem' }}
        >
          <Sparkles size={20} /> Generate AI Teaser
        </button>
      )}
    </div>
  );
};
