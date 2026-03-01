// Chat API — calls backend /api/chat/* (Gemini key stays on server)

const API = process.env.REACT_APP_API_URL || '';

export const CODE_KEYWORDS =
  /\b(plot|chart|graph|analyz|statistic|regression|correlat|histogram|visualiz|calculat|compute|run code|write code|execute|pandas|numpy|matplotlib|csv|data)\b/i;

async function* readNdjsonStream(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
          try {
            yield JSON.parse(trimmed);
          } catch (_) {}
        }
      }
    }
    if (buffer.trim()) {
      try {
        yield JSON.parse(buffer.trim());
      } catch (_) {}
    }
  } finally {
    reader.releaseLock();
  }
}

export const streamChat = async function* (history, newMessage, imageParts = [], useCodeExecution = false, options = {}) {
  const res = await fetch(`${API}/api/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      history,
      message: newMessage,
      imageParts,
      useCodeExecution,
    }),
    signal: options.signal,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || res.statusText);
  }

  for await (const chunk of readNdjsonStream(res)) {
    yield chunk;
  }
};

export const chatWithCsvTools = async (history, newMessage, csvHeaders, csvRows) => {
  const res = await fetch(`${API}/api/chat/tools`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      history,
      message: newMessage,
      csvHeaders,
      csvRows,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || res.statusText);
  }

  return res.json();
};
