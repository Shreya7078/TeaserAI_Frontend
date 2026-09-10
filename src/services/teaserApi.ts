import { TeaserResult, SelectedVideoInfo } from '../types/teaser';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://api.teaser.velyx.me').replace(/\/$/, '');
const FILE_FIELD = import.meta.env.VITE_API_FILE_FIELD || 'file';

function resolveApiUrl(path: string): string {
  return path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function uploadVideoToBackend(file: File, token: string | null): Promise<{ success: boolean; videoId?: string; message?: string }> {
  const formData = new FormData();
  formData.append(FILE_FIELD, file);

  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/videos/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json().catch(() => ({}));
    return {
      success: true,
      videoId: data.id || data.video_id || 'vid_' + Date.now(),
      message: 'Video uploaded successfully to backend',
    };
  } catch (error) {
    console.warn('Real POST /videos/upload unavailable or failed. Using fallback mock flow.', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error connecting to backend',
    };
  }
}


/**
 * Simulates the remaining processing pipeline (FFmpeg audio extraction,
 * Speech-to-Text, LLM best moments selection, and FFmpeg video clipping).
 * Calls onProgress callback with stage updates.
 */
export async function processVideoTeaserMock(
  videoInfo: SelectedVideoInfo,
  token: string | null,
  onProgress: (step: 'uploading' | 'extracting_audio' | 'speech_to_text' | 'analyzing_moments' | 'clipping_teaser', percent: number) => void
): Promise<TeaserResult> {
  // Step 1: Uploading
  onProgress('uploading', 20);
  await new Promise((r) => setTimeout(r, 1000));

  // Try real upload in background if file is present
  if (videoInfo.file) {
    await uploadVideoToBackend(videoInfo.file, token);
  }

  // Step 2: FFmpeg Extracting Audio
  onProgress('extracting_audio', 40);
  await new Promise((r) => setTimeout(r, 1200));

  // Step 3: Speech to Text Transcript
  onProgress('speech_to_text', 65);
  await new Promise((r) => setTimeout(r, 1200));

  // Step 4: LLM Analyzing Best Moments
  onProgress('analyzing_moments', 85);
  await new Promise((r) => setTimeout(r, 1200));

  // Step 5: FFmpeg Clipping Final Teaser
  onProgress('clipping_teaser', 98);
  await new Promise((r) => setTimeout(r, 1000));

  // Create local object URL for preview demo or sample video
  // If youtubeUrl is used, we can use a sample public MP4 file for preview
  const videoObjectUrl = videoInfo.objectUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  return {
    videoUrl: videoObjectUrl,
    filename: videoInfo.file ? `teaser_${videoInfo.file.name}` : `teaser_youtube_video.mp4`,
    durationSeconds: 15,
    highlightsCount: 3,
    aspectRatio: '16:9',
    transcriptExcerpt: videoInfo.customPrompt
      ? `[Custom Prompt applied: "${videoInfo.customPrompt}"] “The key to great content is catching attention in the first 3 seconds...”`
      : '“The key to great content is catching attention in the first 3 seconds...”',
    clips: [
      {
        clip_id: 'clip_1',
        start: 0,
        end: 15,
        duration: 15,
        reason: videoInfo.customPrompt
          ? `[Custom Prompt: "${videoInfo.customPrompt}"] The key to great content is catching attention in the first 3 seconds...`
          : 'The key to great content is catching attention in the first 3 seconds...',
        clip_url: videoObjectUrl,
      }
    ],
  };
}

/**
 * Sends video file or YouTube URL to real backend, processes, and returns actual teaser result.
 */
export async function processVideoTeaser(
  videoInfo: SelectedVideoInfo,
  token: string | null,
  onProgress: (step: 'uploading' | 'extracting_audio' | 'speech_to_text' | 'analyzing_moments' | 'clipping_teaser', percent: number) => void
): Promise<TeaserResult> {
  const formData = new FormData();
  let url = `${BASE_URL}/videos/upload`;

  if (videoInfo.file) {
    formData.append(FILE_FIELD, videoInfo.file);
  } else if (videoInfo.youtubeUrl) {
    formData.append('youtube_url', videoInfo.youtubeUrl);
    url = `${BASE_URL}/videos/youtube`;
  } else {
    throw new Error("No video file or YouTube URL provided.");
  }

  if (videoInfo.customPrompt) {
    formData.append('prompt', videoInfo.customPrompt);
  } else if (videoInfo.youtubeUrl) {
    formData.append('prompt', 'Summarize the video in 3 sentences.');
  }

  const videoId = 'vid_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  formData.append('video_id', videoId);

  type StepType = 'uploading' | 'extracting_audio' | 'speech_to_text' | 'analyzing_moments' | 'clipping_teaser';
  let currentStep: StepType = 'uploading';
  let currentPercent = 5;
  let isCompleted = false;

  let targetPercent = 5;
  const eventSource = new EventSource(`${BASE_URL}/videos/${videoId}/status/stream`);

  eventSource.onmessage = (event) => {
    try {
      if (isCompleted) return;
      const data = JSON.parse(event.data);
      if (data.step && data.step !== 'idle') {
        currentStep = data.step as StepType;
        targetPercent = Math.max(targetPercent, data.percent);
        if (data.percent > currentPercent) {
          currentPercent = data.percent;
        }
        onProgress(currentStep, currentPercent);
      }
    } catch (err) {
      // Ignore
    }
  };

  eventSource.onerror = (err) => {
    console.error("SSE connection error:", err);
    eventSource.close();
  };

  // Keep a local timer for UI visual smoothness (micro-ticks)
  const interpolationTimer = setInterval(() => {
    if (isCompleted) {
      clearInterval(interpolationTimer);
      return;
    }
    if (currentPercent < targetPercent) {
      currentPercent += Math.min(2, targetPercent - currentPercent);
      onProgress(currentStep, currentPercent);
    } else if (currentPercent < 96 && (currentStep === 'analyzing_moments' || currentStep === 'clipping_teaser' || currentStep === 'extracting_audio')) {
      currentPercent += 1;
      onProgress(currentStep, currentPercent);
    }
  }, 350);

  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    isCompleted = true;
    clearInterval(interpolationTimer);
    eventSource.close();

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Server returned error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    if (!data.teaser_url) {
      throw new Error("The server response did not include a generated teaser URL.");
    }

    // Map all clips to absolute urls and correct structure
    const clipsMapped = (data.clips || []).map((clip: any) => {
      return {
        clip_id: clip.clip_id,
        start: clip.start,
        end: clip.end,
        duration: clip.duration,
        reason: clip.reason,
        clip_url: resolveApiUrl(clip.clip_url),
      };
    });

    const fullTeaserUrl = resolveApiUrl(data.teaser_url);

    const totalDuration = clipsMapped.reduce((sum: number, c: any) => sum + (c.duration || 0), 0);
    const combinedExcerpt = clipsMapped.map((c: any) => c.reason).filter(Boolean).join(' | ');

    return {
      videoUrl: fullTeaserUrl,
      filename: `${data.video_id}_teaser.mp4`,
      durationSeconds: Math.round(totalDuration || data.duration || 15),
      highlightsCount: clipsMapped.length,
      transcriptExcerpt: combinedExcerpt || 'No transcription highlight text available.',
      aspectRatio: '16:9',
      clips: clipsMapped,
    };
  } catch (error) {
    isCompleted = true;
    clearInterval(interpolationTimer);
    eventSource.close();
    console.error('Real backend call failed.', error);
    throw error;
  }
}

/**
 * Fetches the logged-in user's last generated teaser from MongoDB.
 */
export async function fetchLastGeneratedTeaser(token: string | null): Promise<TeaserResult | null> {
  if (!token) return null;

  try {
    const response = await fetch(`${BASE_URL}/videos/last-generated`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const teaser = data?.teaser;
    if (!teaser || !teaser.teaser_url) {
      return null;
    }

    const fullTeaserUrl = resolveApiUrl(teaser.teaser_url);

    const clipsMapped = (teaser.clips || []).map((clip: any) => ({
      clip_id: clip.clip_id || 'clip',
      start: clip.start || 0,
      end: clip.end || 0,
      duration: clip.duration || 0,
      reason: clip.reason || '',
      clip_url: resolveApiUrl(clip.clip_url),
    }));

    const totalDuration = clipsMapped.reduce((sum: number, c: any) => sum + (c.duration || 0), 0);
    const combinedExcerpt = clipsMapped.map((c: any) => c.reason).filter(Boolean).join(' | ');

    return {
      videoUrl: fullTeaserUrl,
      filename: teaser.filename || `${teaser.video_id || 'video'}_teaser.mp4`,
      durationSeconds: Math.round(totalDuration || 15),
      highlightsCount: clipsMapped.length,
      transcriptExcerpt: combinedExcerpt || undefined,
      aspectRatio: '16:9',
      clips: clipsMapped,
    };
  } catch (error) {
    console.warn('Failed to fetch last generated teaser from MongoDB:', error);
    return null;
  }
}
