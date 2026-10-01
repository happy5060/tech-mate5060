import type { IncomingMessage, ServerResponse } from 'http';
import dns from 'node:dns';
import { handleGenerateLesson } from '../supabase/functions/generate-lesson/index';
import { handleRegenerateSection } from '../supabase/functions/regenerate-section/index';
import { handleCheckAlignment } from '../supabase/functions/check-alignment/index';
import { handleCheckLessonQuality } from '../supabase/functions/check-lesson-quality/index';
import { handleLessonChat } from '../supabase/functions/lesson-chat/index';
import { handleAnalyzeVideo } from '../supabase/functions/analyze-video/index';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

/**
 * Converts Node IncomingMessage to Web Standard Request
 */
async function nodeToWebRequest(req: IncomingMessage): Promise<Request> {
  const protocol = 'http';
  const host = req.headers.host || 'localhost:5173';
  const url = new URL(req.url || '/', `${protocol}://${host}`);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }

  let body: any = null;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    body = Buffer.concat(chunks);
  }

  return new Request(url.toString(), {
    method: req.method,
    headers,
    body: body && body.length > 0 ? body : undefined,
  });
}

/**
 * Streams Web Standard Response back to Node ServerResponse
 */
async function webToNodeResponse(webRes: Response, nodeRes: ServerResponse) {
  nodeRes.statusCode = webRes.status;
  webRes.headers.forEach((val, key) => {
    nodeRes.setHeader(key, val);
  });

  const arrayBuffer = await webRes.arrayBuffer();
  nodeRes.end(Buffer.from(arrayBuffer));
}

/**
 * Connect middleware dispatching to Supabase Edge Function handlers
 */
export function edgeFunctionsMiddleware() {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url || '';

    // Route matching for Supabase Edge Functions endpoints
    if (url.includes('/functions/v1/generate-lesson') || url.includes('/api/generate-lesson')) {
      const webReq = await nodeToWebRequest(req);
      const webRes = await handleGenerateLesson(webReq);
      return webToNodeResponse(webRes, res);
    }

    if (url.includes('/functions/v1/regenerate-section') || url.includes('/api/regenerate-section')) {
      const webReq = await nodeToWebRequest(req);
      const webRes = await handleRegenerateSection(webReq);
      return webToNodeResponse(webRes, res);
    }

    if (url.includes('/functions/v1/check-alignment') || url.includes('/api/check-alignment')) {
      const webReq = await nodeToWebRequest(req);
      const webRes = await handleCheckAlignment(webReq);
      return webToNodeResponse(webRes, res);
    }

    if (url.includes('/functions/v1/check-lesson-quality') || url.includes('/api/check-lesson-quality')) {
      const webReq = await nodeToWebRequest(req);
      const webRes = await handleCheckLessonQuality(webReq);
      return webToNodeResponse(webRes, res);
    }

    if (url.includes('/functions/v1/lesson-chat') || url.includes('/api/lesson-chat')) {
      const webReq = await nodeToWebRequest(req);
      const webRes = await handleLessonChat(webReq);
      return webToNodeResponse(webRes, res);
    }



    if (url.includes('/functions/v1/analyze-video') || url.includes('/api/analyze-video')) {
      const webReq = await nodeToWebRequest(req);
      const webRes = await handleAnalyzeVideo(webReq);
      return webToNodeResponse(webRes, res);
    }

    next();
  };
}
