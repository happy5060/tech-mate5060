// Supabase Edge Function: generate-lesson
import { corsHeaders } from '../_shared/cors.ts';
import { callGeminiJson } from '../_shared/gemini.ts';

interface RequestBody {
  subject: string;
  topic: string;
  classLevel: string;
  duration: string;
  learningObjective: string;
  teachingStyle: string;
  difficulty: string;
  language: string;
}

export async function handleGenerateLesson(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();

    // Input Validation
    if (!body.subject?.trim()) {
      return new Response(JSON.stringify({ error: 'Missing required field: subject' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!body.topic?.trim()) {
      return new Response(JSON.stringify({ error: 'Missing required field: topic' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!body.classLevel?.trim()) {
      return new Response(JSON.stringify({ error: 'Missing required field: classLevel' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!body.learningObjective?.trim()) {
      return new Response(JSON.stringify({ error: 'Missing required field: learningObjective' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemInstruction = `You are an expert pedagogical curriculum designer for modern classrooms.
Generate a structured, topic-specific classroom lesson package tailored precisely to the teacher's requirements.
STRICT GUIDELINES:
1. Match the supplied Subject: "${body.subject}"
2. Match the supplied Topic: "${body.topic}"
3. Match the supplied Class / Student Level: "${body.classLevel}"
4. Match the supplied Learning Objective: "${body.learningObjective}"
5. Respect Lesson Duration: "${body.duration}"
6. Respect Teaching Style: "${body.teachingStyle}"
7. Respect Difficulty Level: "${body.difficulty}"
8. Deliver content in Language: "${body.language}" (If Hindi/Punjabi/Hinglish requested, provide natural fluent expression for that medium).
9. Avoid generic filler. Everything must be directly related to "${body.topic}".
10. The classroom activity must fit within the specified duration and match the teaching style.
11. Discussion questions must stimulate high-order inquiry.
12. Assessment MUST test the stated learning objective and include:
    - Multiple Choice Question (MCQ) with 4 options and identified correct answer
    - Short Answer Question with rubric
    - True / False Question with explanation
    - Application Based Question with grading criteria

Return JSON ONLY matching this exact structure:
{
  "title": "${body.subject}: ${body.topic}",
  "introduction": "Engaging introduction and hook...",
  "learning_objectives": [
    "Objective 1...",
    "Objective 2...",
    "Objective 3..."
  ],
  "concept_explanation": "In-depth, structured explanation...",
  "examples": [
    {
      "id": "ex-1",
      "title": "Example Title",
      "scenario": "Concrete real-world situation...",
      "explanation": "Why this illustrates the concept..."
    }
  ],
  "classroom_activity": {
    "title": "Activity Name",
    "duration_minutes": 15,
    "materials_needed": ["Item 1", "Item 2"],
    "step_by_step_instructions": ["Step 1", "Step 2", "Step 3"],
    "expected_outcome": "Pedagogical outcome..."
  },
  "discussion_questions": [
    {
      "id": "dq-1",
      "question": "Inquiry question prompt...",
      "facilitator_guidance": "Teacher guidance..."
    }
  ],
  "assessment": {
    "instructions": "Diagnostic guidelines...",
    "questions": [
      {
        "id": "q-1",
        "type": "MCQ",
        "question": "Question text...",
        "options": ["A", "B", "C", "D"],
        "correct_answer": "A",
        "explanation": "Why A is correct..."
      },
      {
        "id": "q-2",
        "type": "True / False",
        "question": "Question text...",
        "options": ["True", "False"],
        "correct_answer": "True",
        "explanation": "Reason..."
      },
      {
        "id": "q-3",
        "type": "Short Answer",
        "question": "Question text...",
        "correct_answer": "Model answer...",
        "rubric": "Grading criteria..."
      },
      {
        "id": "q-4",
        "type": "Application Based",
        "question": "Question text...",
        "correct_answer": "Model answer...",
        "rubric": "Grading criteria..."
      }
    ]
  },
  "conclusion": "Synthesis and transition to next topics..."
}`;

    const userPrompt = `Generate the lesson package for:
Subject: ${body.subject}
Topic: ${body.topic}
Class Level: ${body.classLevel}
Duration: ${body.duration}
Learning Objective: ${body.learningObjective}
Teaching Style: ${body.teachingStyle}
Difficulty: ${body.difficulty}
Language: ${body.language}`;

    const generated = await callGeminiJson<any>(systemInstruction, userPrompt);

    // Validate required generated sections
    const requiredSections = [
      'introduction',
      'learning_objectives',
      'concept_explanation',
      'examples',
      'classroom_activity',
      'discussion_questions',
      'assessment',
      'conclusion'
    ];

    for (const sec of requiredSections) {
      if (!generated[sec]) {
        throw new Error(`Model response missing required section: ${sec}`);
      }
    }

    return new Response(JSON.stringify({ data: generated }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('generate-lesson error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal error in generate-lesson function',
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
  (Deno as any).serve(handleGenerateLesson);
}
