// Image generation using Gemini - tries models that support image output
// When unavailable, returns a placeholder SVG

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY || '');
const IMAGE_MODEL = 'gemini-2.0-flash-exp';

function createPlaceholderSvgBase64(prompt) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect fill="#1e1e2e" width="512" height="512"/>
    <text x="256" y="240" font-family="sans-serif" font-size="18" fill="#94a3b8" text-anchor="middle">Image generation</text>
    <text x="256" y="270" font-family="sans-serif" font-size="14" fill="#64748b" text-anchor="middle">${(prompt || 'N/A').slice(0, 40)}...</text>
    <text x="256" y="300" font-family="sans-serif" font-size="12" fill="#475569" text-anchor="middle">(Model may not support image output)</text>
  </svg>`;
  return Buffer.from(svg).toString('base64');
}

async function generateImage(prompt, anchorImageBase64 = null, anchorMimeType = 'image/png') {
  try {
    const model = genAI.getGenerativeModel({
      model: IMAGE_MODEL,
      generationConfig: {
        responseModalities: ['image', 'text'],
        responseMimeType: 'image/png',
      },
    });

    const parts = [{ text: `Generate an image: ${prompt}` }];
    if (anchorImageBase64) {
      parts.push({
        inlineData: {
          mimeType: anchorMimeType || 'image/png',
          data: anchorImageBase64,
        },
      });
    }

    const result = await model.generateContent(parts);
    const response = result.response;
    const partsOut = response.candidates?.[0]?.content?.parts || [];

    for (const p of partsOut) {
      if (p.inlineData && p.inlineData.data) {
        return {
          mimeType: p.inlineData.mimeType || 'image/png',
          data: p.inlineData.data,
        };
      }
    }

    return {
      mimeType: 'image/svg+xml',
      data: createPlaceholderSvgBase64(prompt),
    };
  } catch (err) {
    return {
      mimeType: 'image/svg+xml',
      data: createPlaceholderSvgBase64(prompt),
    };
  }
}

module.exports = { generateImage };
