import { useState } from 'react';

export default function GeneratedImageDisplay({ mimeType, data }) {
  const [enlarged, setEnlarged] = useState(false);

  const handleDownload = () => {
    const ext = mimeType?.includes('svg') ? 'svg' : 'png';
    const a = document.createElement('a');
    a.href = `data:${mimeType || 'image/png'};base64,${data}`;
    a.download = `generated-${Date.now()}.${ext}`;
    a.click();
  };

  const src = `data:${mimeType || 'image/png'};base64,${data}`;

  return (
    <div
      className={`generated-image-wrap ${enlarged ? 'enlarged' : ''}`}
      onClick={() => setEnlarged((e) => !e)}
      role="button"
      tabIndex={0}
      onKeyDown={(ev) => ev.key === 'Enter' && setEnlarged((e) => !e)}
      aria-label={enlarged ? 'Shrink image' : 'Enlarge image'}
    >
      <div className="generated-image-actions" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={() => setEnlarged((e) => !e)}>
          {enlarged ? 'Shrink' : 'Enlarge'}
        </button>
        <button type="button" onClick={handleDownload}>
          Download
        </button>
      </div>
      <img src={src} alt="Generated" className="generated-image" />
    </div>
  );
}
