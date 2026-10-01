// Supabase Edge Function: check-alignment
import { corsHeaders } from '../_shared/cors.ts';
import { callGeminiJson } from '../_shared/gemini.ts';

interface CheckAlignmentRequestBody {
  learningObjective: string;
  lessonContent: any;
}

export interface SectionAlignmentResult {
  section: string;
  aligned: boolean;
  reason: string;
}

export async function handleCheckAlignment(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: CheckAlignmentRequestBody = await req.json();

    if (!body.learningObjective?.trim()) {
      return new Response(JSON.stringify({ error: 'Missing learningObjective parameter.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemInstruction = `You are a pedagogical auditor evaluating curriculum alignment.
Analyze whether each major section of a classroom lesson aligns with the teacher's stated Learning Objective:
"${body.learningObjective}"

CRITICAL RULES:
- DO NOT return numerical percentages or scores.
- Evaluate each major section:
  1. "introduction"
  2. "learningObjectives"
  3. "conceptExplanation"
  4. "examples"
  5. "classroomActivity"
  6. "discussionQuestions"
  7. "assessment"
  8. "conclusion"
- Determine boolean alignment ("aligned": true or false) and a concise, actionable rationale ("reason": "...").

Return JSON ONLY as an object with key "alignments" containing an array of:
{
  "alignments": [
    {
      "section": "introduction",
      "aligned": true,
      "reason": "Clear explanation of why it aligns with the stated objective."
    },
    ...
  ]
}`;

    const userPrompt = `Learning Objective:
${body.learningObjective}

Lesson Content to Audit:
${JSON.stringify(body.lessonContent, null, 2)}`;

    const result = await callGeminiJson<{ alignments: SectionAlignmentResult[] }>(
      systemInstruction,
      userPrompt
    );

    return new Response(
      JSON.stringify({
        alignments: result.alignments,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('check-alignment error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal error in check-alignment function',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

// Deno server listener for Supabase Edge Runtime
if (typeof Deno !== 'undefined' && 'serve' in Deno) {
  (Deno as any).serve(handleCheckAlignment);
}
