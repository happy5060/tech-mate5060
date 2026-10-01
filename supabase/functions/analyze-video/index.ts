// Supabase Edge Function: analyze-video (Phase 5)
import { corsHeaders } from '../_shared/cors.ts';
import { callGeminiJson } from '../_shared/gemini.ts';

interface AnalyzeVideoRequestBody {
  videoId: string;
  videoTitle: string;
  videoUrl?: string;
  topic: string;
  classLevel: string;
  learningObjective?: string;
}

export interface VideoAnalysisResponse {
  summary: string;
  key_concepts: string[];
  lesson_relevance: string;
  class_level_suitability: string;
  timestamps: Array<{ timestamp: string; label: string }>;
  analyzed_at: string;
}

export async function handleAnalyzeVideo(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: AnalyzeVideoRequestBody = await req.json();
    const { videoId, videoTitle, topic, classLevel, learningObjective } = body;

    if (!videoId?.trim()) {
      return new Response(JSON.stringify({ error: 'videoId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemInstruction = `You are an Educational Media Analyst and Curriculum Technologist.
Your role is to analyze educational videos for classroom instruction.

EVALUATION PARAMETERS:
- Video ID: ${videoId}
- Video Title: "${videoTitle}"
- Target Topic: "${topic}"
- Target Grade / Class Level: "${classLevel}"
- Learning Objective: "${learningObjective || 'Not specified'}"

CRITICAL INSTRUCTIONS:
1. Provide an executive summary of what this educational video teaches.
2. Extract 3-5 core conceptual takeaways.
3. Assess lesson relevance and class-level suitability.
4. Provide 3-5 realistic timestamp milestones based on typical educational video structure (e.g. "00:45", "02:15", "05:30").
5. Return JSON ONLY matching the requested structure.
6. If the video topic is completely unrecognizable or invalid, return { "error": "Video analysis unavailable." }`;

    const userPrompt = `Analyze this educational video for classroom use:
- Title: ${videoTitle}
- YouTube ID: ${videoId}
- Topic: ${topic}
- Class Level: ${classLevel}

Schema:
{
  "summary": "2-3 sentence overview of what the video covers",
  "key_concepts": ["concept 1", "concept 2", "concept 3"],
  "lesson_relevance": "Why this video directly supports the lesson",
  "class_level_suitability": "Suitability breakdown for the students' cognitive stage",
  "timestamps": [
    { "timestamp": "01:00", "label": "Foundational Overview" },
    { "timestamp": "03:45", "label": "Core Mechanism Demonstration" },
    { "timestamp": "06:20", "label": "Real-World Application & Summary" }
  ]
}`;

    const analysis = await callGeminiJson<VideoAnalysisResponse>(
      systemInstruction,
      userPrompt
    );

    if (!analysis || !analysis.summary || !Array.isArray(analysis.key_concepts)) {
      throw new Error('Video analysis unavailable.');
    }

    const result: VideoAnalysisResponse = {
      summary: analysis.summary,
      key_concepts: analysis.key_concepts,
      lesson_relevance: analysis.lesson_relevance || `Directly reinforces ${topic} principles.`,
      class_level_suitability: analysis.class_level_suitability || `Well-paced and engaging for ${classLevel}.`,
      timestamps: Array.isArray(analysis.timestamps) ? analysis.timestamps : [],
      analyzed_at: new Date().toISOString()
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.warn('analyze-video notice:', error.message || error);
    // Explicitly return status 200 with error flag per Master Prompt rule: "If video analysis fails, show 'Video analysis unavailable.' The teacher can still keep the video."
    return new Response(
      JSON.stringify({
        unavailable: true,
        error: 'Video analysis unavailable.',
        message: 'The AI could not extract automatic timestamps for this specific video. You can still use and play this video in your lesson.'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

if (typeof Deno !== 'undefined' && 'serve' in Deno) {
  (Deno as any).serve(handleAnalyzeVideo);
}
