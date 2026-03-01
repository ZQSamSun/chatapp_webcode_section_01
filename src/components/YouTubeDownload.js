import { useState } from 'react';

const API = process.env.REACT_APP_API_URL || '';

export default function YouTubeDownload({ user, onLogout }) {
  const [url, setUrl] = useState('');
  const [maxVideos, setMaxVideos] = useState(10);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setError('');
    setResult(null);
    if (!url.trim()) {
      setError('Please enter a YouTube channel URL');
      return;
    }
    const max = Math.min(100, Math.max(1, Number(maxVideos) || 10));
    setMaxVideos(max);
    setLoading(true);
    setProgress(0);
    let progressInterval;
    try {
      progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 8, 90));
      }, 300);
      const res = await fetch(`${API}/api/youtube/channel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, maxVideos: max }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Download failed');
      }

      const data = await res.json();
      setResult(data);
      setProgress(100);
    } catch (err) {
      setError(err.message || 'Failed to download channel data');
      setProgress(0);
    } finally {
      if (progressInterval) clearInterval(progressInterval);
      setLoading(false);
    }
  };

  const handleDownloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = result.channelTitle ? `${result.channelTitle.replace(/[^a-z0-9]/gi, '_')}_videos.json` : 'channel_videos.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="youtube-download">
      <header className="youtube-header">
        <h1>YouTube Channel Download</h1>
        <span className="youtube-username">{user?.username}</span>
        <button onClick={onLogout} className="youtube-logout">Log out</button>
      </header>

      <div className="youtube-content">
        <div className="youtube-form">
          <input
            type="text"
            placeholder="Channel URL (e.g. https://youtube.com/@veritasium or https://youtube.com/channel/UC..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          <div className="youtube-form-row">
            <label>
              Max videos:
              <input
                type="number"
                min={1}
                max={100}
                value={maxVideos}
                onChange={(e) => setMaxVideos(Math.min(100, Math.max(1, Number(e.target.value) || 10)))}
                disabled={loading}
              />
            </label>
            <button onClick={handleDownload} disabled={loading || !url.trim()}>
              {loading ? 'Downloading…' : 'Download Channel Data'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="youtube-progress">
            <div className="youtube-progress-bar">
              <div className="youtube-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {error && <div className="youtube-error">{error}</div>}

        {result && (
          <div className="youtube-result">
            <h3>{result.channelTitle || 'Channel'} — {result.videos?.length || 0} videos</h3>
            <button onClick={handleDownloadJson} className="youtube-download-btn">
              Download JSON
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
