// Supabase Edge Function: regenerate-section
import { corsHeaders } from '../_shared/cors.ts';
import { callGeminiJson } from '../_shared/gemini.ts';

interface RegenerateRequestBody {
  lessonConfiguration: {
    subject: string;
    topic: string;
    classLevel: string;
    duration: string;
    learningObjective: string;
    teachingStyle: string;
    difficulty: string;
    language: string;
  };
  sectionName: string;
  existingSectionContent: any;
  currentLessonContent?: any;
}

export async function handleRegenerateSection(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: RegenerateRequestBody = await req.json();

    if (!body.sectionName) {
      return new Response(JSON.stringify({ error: 'Missing sectionName parameter.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { lessonConfiguration: cfg, sectionName, existingSectionContent } = body;

    const systemInstruction = `You are an expert curriculum editor.
Your task is to REGENERATE ONLY ONE SINGLE SECTION of a classroom lesson package: "${sectionName}".
DO NOT modify or return other sections.
Ensure the regenerated content aligns with:
- Subject: ${cfg.subject}
- Topic: ${cfg.topic}
- Class Level: ${cfg.classLevel}
- Learning Objective: ${cfg.learningObjective}
- Language: ${cfg.language}
- Difficulty: ${cfg.difficulty}
- Teaching Style: ${cfg.teachingStyle}

Return JSON ONLY with a single key "new_content" holding the refreshed structure for "${sectionName}".

Examples of structure for each section type:
- If sectionName is "introduction": { "new_content": "A captivating, fresh introduction..." }
- If sectionName is "learning_objectives": { "new_content": ["Objective 1", "Objective 2", "Objective 3"] }
- If sectionName is "concept_explanation": { "new_content": "Refreshed conceptual breakdown with clear subheadings..." }
- If sectionName is "examples": { "new_content": [{ "id": "ex-r1", "title": "New Case", "scenario": "...", "explanation": "..." }] }
- If sectionName is "classroom_activity": { "new_content": { "title": "Refreshed Lab", "duration_minutes": 15, "materials_needed": [...], "step_by_step_instructions": [...], "expected_outcome": "..." } }
- If sectionName is "discussion_questions": { "new_content": [{ "id": "dq-r1", "question": "...", "facilitator_guidance": "..." }] }
- If sectionName is "assessment": { "new_content": { "instructions": "...", "questions": [{ "id": "q-r1", "type": "MCQ", "question": "...", "options": [...], "correct_answer": "...", "explanation": "..." }] } }
- If sectionName is "conclusion": { "new_content": "Synthesizing wrap-up and next steps..." }`;

    const userPrompt = `Regenerate ONLY the section: "${sectionName}".
Previous content was:
${JSON.stringify(existingSectionContent, null, 2)}

Provide a fresh, creative, and pedagogically rigorous replacement. Return { "new_content": ... } JSON.`;

    const result = await callGeminiJson<{ new_content: any }>(systemInstruction, userPrompt);

    return new Response(
      JSON.stringify({
        section: sectionName,
        newContent: result.new_content,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('regenerate-section error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal error in regenerate-section function',
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
  (Deno as any).serve(handleRegenerateSection);
}
