// Vercel Edge function — proxies requests to Google Gemini API
// The API key is server-side only (no VITE_ prefix) so it's never exposed in the browser

export const config = { runtime: 'edge' };

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default async function handler(request: Request): Promise<Response> {
  // Only allow POST
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured on server' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { messages: Message[]; systemPrompt: string };
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  const { messages, systemPrompt } = body;

  // Convert from our format to Gemini's format
  // Gemini uses "model" for assistant, and parts array
  const geminiContents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const geminiBody = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: geminiContents,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.75,
    },
  };

  // Call Gemini streaming endpoint
  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    },
  );

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    return new Response(JSON.stringify({ error: errText }), {
      status: geminiRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Pipe Gemini's SSE stream back to the client
  return new Response(geminiRes.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
