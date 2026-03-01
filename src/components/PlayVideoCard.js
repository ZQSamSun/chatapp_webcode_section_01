export default function PlayVideoCard({ videoId, title, thumbnailUrl, videoUrl }) {
  const thumb = thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const url = videoUrl || `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="play-video-card"
    >
      <div className="play-video-thumb">
        <img src={thumb} alt="" />
        <span className="play-video-icon">▶</span>
      </div>
      <span className="play-video-title">{title || 'Video'}</span>
    </a>
  );
}
