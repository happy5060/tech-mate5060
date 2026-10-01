/**
 * Shared Gemini API integration for Supabase Edge Functions.
 * Calls Gemini 2.5 Flash / Gemini 3.5 Flash with fallback and retry support.
 * Strictly enforces JSON responses.
 */

export async function callGeminiJson<T = any>(
  systemInstruction: string,
  userPrompt: string
): Promise<T> {
  const apiKey =
    (typeof Deno !== 'undefined' ? Deno.env.get('GEMINI_API_KEY') : undefined) ||
    (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined);

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment.');
  }

  // Model hierarchy: Attempt gemini-2.5-flash first (per requirement),
  // then stable available flash versions (gemini-3.5-flash, gemini-3.5-flash-lite, gemini-3.7-flash)
  const modelCandidates = [
    'gemini-2.5-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ];

  let lastError: Error | null = null;

  for (const model of modelCandidates) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.35,
            }
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          // If 404 (model replaced) or 503 (demand spike) or 429 (rate limit), retry or try next
          if (response.status === 404 || response.status === 503 || response.status === 429) {
            lastError = new Error(`Model ${model} (${response.status}): ${errorBody}`);
            if (response.status === 503 && attempt === 0) {
              await new Promise((r) => setTimeout(r, 800));
              continue;
            }
            break; // Move to next model candidate
          }
          throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
          throw new Error('Gemini returned an empty response candidate.');
        }

        // Clean any potential markdown code blocks
        let cleaned = rawText.trim();
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        } else if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```\s*/, '').replace(/```$/, '').trim();
        }

        const parsed: T = JSON.parse(cleaned);
        return parsed;
      } catch (err: any) {
        lastError = err;
        console.warn(`[callGeminiJson] Candidate ${model} attempt ${attempt} warning:`, err.message || err);
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }
        break; // Proceed to next candidate model
      }
    }
  }

  throw lastError || new Error('All candidate Gemini models failed.');
}

/**
 * Text generation helper for conversational assistants (Markdown support)
 */
export async function callGeminiText(
  systemInstruction: string,
  userPrompt: string
): Promise<string> {
  const apiKey =
    (typeof Deno !== 'undefined' ? Deno.env.get('GEMINI_API_KEY') : undefined) ||
    (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined);

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment.');
  }

  const modelCandidates = [
    'gemini-2.5-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.7-flash',
    'gemini-flash-latest'
  ];

  let lastError: Error | null = null;

  for (const model of modelCandidates) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }]
              }
            ],
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 1200
            }
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          if (response.status === 404 || response.status === 503 || response.status === 429) {
            lastError = new Error(`Model ${model} (${response.status}): ${errorBody}`);
            break;
          }
          throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error('Empty Gemini candidate returned.');
        return rawText.trim();
      } catch (err: any) {
        lastError = err;
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error('All candidate Gemini models failed.');
}

