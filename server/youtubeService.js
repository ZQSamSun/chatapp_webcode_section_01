// YouTube Channel Data fetcher using YouTube Data API v3
// Requires YOUTUBE_API_KEY in .env
// Falls back to sample data if API key is missing

const { google } = require('googleapis');

function parseChannelInput(urlOrHandle) {
  const s = String(urlOrHandle || '').trim();
  // @username
  const handleMatch = s.match(/@([a-zA-Z0-9_-]+)/) || (s.startsWith('@') ? [null, s.slice(1)] : null);
  if (handleMatch) return { type: 'handle', value: handleMatch[1] };
  // /channel/UC...
  const channelMatch = s.match(/channel\/(UC[\w-]+)/i) || s.match(/(UC[\w-]{22,})/);
  if (channelMatch) return { type: 'channelId', value: channelMatch[1] };
  // /c/custom
  const cMatch = s.match(/\/c\/([a-zA-Z0-9_-]+)/i);
  if (cMatch) return { type: 'customUrl', value: cMatch[1] };
  // Just a handle without @
  if (/^[a-zA-Z0-9_-]+$/.test(s)) return { type: 'handle', value: s };
  return null;
}

function parseDuration(iso) {
  if (!iso) return null;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  const h = parseInt(match[1] || 0, 10);
  const m = parseInt(match[2] || 0, 10);
  const s = parseInt(match[3] || 0, 10);
  return h * 3600 + m * 60 + s;
}

async function fetchChannelVideos(urlOrHandle, maxVideos = 10) {
  const apiKey = process.env.YOUTUBE_API_KEY || process.env.REACT_APP_YOUTUBE_API_KEY;
  const parsed = parseChannelInput(urlOrHandle);

  if (!parsed) {
    throw new Error('Invalid channel URL or handle. Use @username, /channel/UC..., or /c/name');
  }

  if (!apiKey) {
    return getSampleVeritasiumData(maxVideos);
  }

  const youtube = google.youtube({ version: 'v3', auth: apiKey });
  let channelId = null;

  if (parsed.type === 'channelId') {
    channelId = parsed.value;
  } else if (parsed.type === 'handle') {
    const res = await youtube.channels.list({
      part: 'snippet',
      forHandle: `@${parsed.value}`,
    });
    channelId = res.data?.items?.[0]?.id;
  } else if (parsed.type === 'customUrl') {
    const res = await youtube.search.list({
      part: 'snippet',
      q: parsed.value,
      type: 'channel',
      maxResults: 1,
    });
    channelId = res.data?.items?.[0]?.snippet?.channelId;
  }

  if (!channelId) throw new Error('Channel not found');

  const channelRes = await youtube.channels.list({
    part: 'snippet',
    id: channelId,
  });
  const channelTitle = channelRes.data?.items?.[0]?.snippet?.title || 'Unknown';

  const searchRes = await youtube.search.list({
    part: 'id,snippet',
    channelId,
    type: 'video',
    maxResults: Math.min(50, maxVideos),
    order: 'date',
  });

  const videoIds = (searchRes.data?.items || []).map((i) => i.id?.videoId).filter(Boolean);
  if (!videoIds.length) return { channelTitle, channelId, videos: [] };

  const videosRes = await youtube.videos.list({
    part: 'snippet,contentDetails,statistics',
    id: videoIds,
  });

  const videos = (videosRes.data?.items || []).map((v) => {
    const stats = v.statistics || {};
    const snippet = v.snippet || {};
    const content = v.contentDetails || {};
    const durationSec = parseDuration(content.duration);
    return {
      videoId: v.id,
      title: snippet.title || '',
      description: (snippet.description || '').slice(0, 500),
      transcript: null, // YouTube Data API doesn't provide transcripts
      duration: durationSec,
      durationIso: content.duration,
      publishedAt: snippet.publishedAt || null,
      viewCount: parseInt(stats.viewCount || 0, 10),
      likeCount: parseInt(stats.likeCount || 0, 10),
      commentCount: parseInt(stats.commentCount || 0, 10),
      thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
      videoUrl: `https://www.youtube.com/watch?v=${v.id}`,
    };
  });

  return { channelTitle, channelId, videos };
}

function getSampleVeritasiumData(maxVideos) {
  const path = require('path');
  const fs = require('fs');
  const samplePath = path.join(__dirname, '../public/veritasium_channel_data.json');
  let sample = { channelTitle: 'Veritasium', channelId: 'UCs0-BX-iGyzT3BOo1y1kVyA', videos: [] };
  try {
    sample = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
  } catch (_) {}
  const videos = (sample.videos || []).slice(0, Math.min(maxVideos, 10));
  return {
    channelTitle: sample.channelTitle || 'Veritasium',
    channelId: sample.channelId || 'UCs0-BX-iGyzT3BOo1y1kVyA',
    videos,
  };
}

module.exports = { fetchChannelVideos };
