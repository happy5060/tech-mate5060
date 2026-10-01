// Supabase Edge Function: check-lesson-quality
import { corsHeaders } from '../_shared/cors.ts';
import { callGeminiJson } from '../_shared/gemini.ts';

interface CheckLessonQualityRequestBody {
  subject: string;
  topic: string;
  classLevel: string;
  duration?: string;
  learningObjective: string;
  teachingStyle?: string;
  difficulty: string;
  language?: string;
  lessonContent: any;
}

export interface QualitySectionResult {
  section: string;
  status: 'good' | 'needs_review';
  reason: string;
}

export interface LessonQualityResponse {
  overall_status: 'ready' | 'needs_review';
  summary?: string;
  sections: QualitySectionResult[];
}

export async function handleCheckLessonQuality(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: CheckLessonQualityRequestBody = await req.json();

    if (!body.topic?.trim()) {
      return new Response(JSON.stringify({ error: 'Missing topic parameter.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemInstruction = `You are a Senior Educational Quality Assurance and Pedagogical Auditor for classroom curriculum.
Your role is to rigorously evaluate a generated classroom lesson package against explicit pedagogical standards.

EVALUATION CRITERIA:
1. Learning objective exists and is cognitively measurable (Bloom's Taxonomy).
2. Introduction supports topic and hooks student curiosity.
3. Concept explanation directly supports the learning objective with clear principles.
4. Examples realistically match the topic and clarify misconceptions.
5. Classroom activity matches topic, class level, and estimated duration.
6. Discussion questions promote inquiry and critical thinking relevant to the topic.
7. Assessment rigorously tests the learning objective (formative alignment).
8. Conclusion accurately synthesizes key takeaways of the lesson.
9. Content depth and vocabulary are strictly appropriate for Class/Grade Level: "${body.classLevel || 'General'}".
10. Difficulty level accurately matches selected Difficulty: "${body.difficulty || 'Medium'}".

CRITICAL RULES:
- DO NOT invent arbitrary scores, percentages, or numerical metrics.
- For each section, assign status STRICTLY as either:
  "good" (meeting or exceeding pedagogical standards) OR
  "needs_review" (lacking clarity, misaligned, inappropriately paced, or too difficult/easy for the grade level).
- If status is "needs_review", provide an actionable pedagogical reason explaining what needs revision.
- Set overall_status to "ready" if all or nearly all sections are "good". If critical pedagogical gaps exist, set to "needs_review".

Evaluate these 8 sections:
1. "introduction"
2. "learningObjectives"
3. "conceptExplanation"
4. "examples"
5. "classroomActivity"
6. "discussionQuestions"
7. "assessment"
8. "conclusion"

Return JSON ONLY matching this structure:
{
  "overall_status": "ready",
  "summary": "Concise summary of curriculum quality and readiness",
  "sections": [
    {
      "section": "introduction",
      "status": "good",
      "reason": "Engages students directly with clear contextual hook."
    },
    {
      "section": "learningObjectives",
      "status": "good",
      "reason": "Measurable objectives aligned with grade level."
    },
    {
      "section": "conceptExplanation",
      "status": "good",
      "reason": "Detailed conceptual breakdown matching target difficulty."
    },
    {
      "section": "examples",
      "status": "good",
      "reason": "Real-world cases reinforce core principles."
    },
    {
      "section": "classroomActivity",
      "status": "good",
      "reason": "Collaborative exercise fits duration and resources."
    },
    {
      "section": "discussionQuestions",
      "status": "good",
      "reason": "Open-ended inquiry prompts."
    },
    {
      "section": "assessment",
      "status": "good",
      "reason": "Questions diagnose mastery of stated objective."
    },
    {
      "section": "conclusion",
      "status": "good",
      "reason": "Synthesizes main takeaways effectively."
    }
  ]
}`;

    const userPrompt = `Target Lesson Parameters:
- Subject: ${body.subject || 'Not specified'}
- Topic: ${body.topic}
- Class Level: ${body.classLevel || 'Not specified'}
- Difficulty: ${body.difficulty || 'Medium'}
- Learning Objective: ${body.learningObjective || 'Not specified'}
- Duration: ${body.duration || '45 min'}

Lesson Package Content to Evaluate:
${JSON.stringify(body.lessonContent, null, 2)}`;

    const result = await callGeminiJson<LessonQualityResponse>(
      systemInstruction,
      userPrompt
    );

    // Normalize output format
    const normalized: LessonQualityResponse = {
      overall_status: result.overall_status === 'needs_review' ? 'needs_review' : 'ready',
      summary: result.summary || 'Lesson package evaluated against curriculum criteria.',
      sections: Array.isArray(result.sections) ? result.sections : []
    };

    return new Response(JSON.stringify(normalized), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('check-lesson-quality error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal error in check-lesson-quality function',
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
  (Deno as any).serve(handleCheckLessonQuality);
}
