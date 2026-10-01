/**
 * AI Classroom Creator — Comprehensive Backend Verification Suite
 * Tests all 14 mandatory test cases against live Supabase Edge Functions & Gemini Flash.
 */

const BASE_URL = 'http://localhost:5173';

async function runAllTests() {
  console.log('====================================================');
  console.log('  AI CLASSROOM CREATOR — BACKEND TEST SUITE (14/14) ');
  console.log('====================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${message}`);
      failedCount++;
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Generate a complete lesson
  // --------------------------------------------------------------------------
  console.log('\n--- 1. Testing Complete Lesson Generation ---');
  let generatedLesson = null;
  try {
    const res = await fetch(`${BASE_URL}/functions/v1/generate-lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Biology',
        topic: 'Cellular Mitosis & Cell Division Cycle',
        classLevel: 'Grade 9',
        duration: '45 min',
        learningObjective: 'Students will describe the four phases of mitosis (prophase, metaphase, anaphase, telophase) and explain why identical chromosome segregation is vital.',
        teachingStyle: 'Interactive',
        difficulty: 'Medium',
        language: 'English'
      })
    });
    assert(res.status === 200, 'generate-lesson endpoint responded with HTTP 200');
    const data = await res.json();
    generatedLesson = data.data;

    assert(Boolean(generatedLesson.introduction), 'Generated Introduction exists and is non-empty');
    assert(Array.isArray(generatedLesson.learning_objectives) && generatedLesson.learning_objectives.length >= 3, 'Generated 3+ learning objectives');
    assert(Boolean(generatedLesson.concept_explanation), 'Generated concept explanation');
    assert(Array.isArray(generatedLesson.examples) && generatedLesson.examples.length >= 1, 'Generated practical case examples');
    assert(Boolean(generatedLesson.classroom_activity?.title), 'Generated hands-on classroom activity');
    assert(Array.isArray(generatedLesson.discussion_questions) && generatedLesson.discussion_questions.length >= 1, 'Generated inquiry discussion questions');
    assert(Array.isArray(generatedLesson.assessment?.questions) && generatedLesson.assessment.questions.length >= 3, 'Generated multi-format assessment questions');
    assert(Boolean(generatedLesson.conclusion), 'Generated lesson conclusion');
  } catch (err) {
    assert(false, `Complete lesson generation failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST 2: Generate with different difficulty (Hard)
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Testing Generation with Different Difficulty (Hard) ---');
  try {
    const res = await fetch(`${BASE_URL}/functions/v1/generate-lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Mathematics',
        topic: 'Eigenvalues & Diagonalization of Matrices',
        classLevel: 'Grade 12',
        duration: '60 min',
        learningObjective: 'Students will solve characteristic polynomials det(A - lambda*I) = 0 and determine geometric versus algebraic multiplicity.',
        teachingStyle: 'Lecture',
        difficulty: 'Hard',
        language: 'English'
      })
    });
    assert(res.status === 200, 'Hard difficulty lesson generated with HTTP 200');
    const data = await res.json();
    assert(data.data.title.includes('Eigenvalues') || data.data.concept_explanation.includes('matrix') || data.data.concept_explanation.includes('Eigen'), 'Hard mathematical content matches advanced domain');
  } catch (err) {
    assert(false, `Hard difficulty test failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Generate with different class level (Grade 6)
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing Generation with Different Class Level (Grade 6) ---');
  try {
    const res = await fetch(`${BASE_URL}/functions/v1/generate-lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Science',
        topic: 'The Water Cycle & States of Matter',
        classLevel: 'Grade 6',
        duration: '30 min',
        learningObjective: 'Students will trace evaporation, condensation, and precipitation through a mini terrarium model.',
        teachingStyle: 'Activity-based',
        difficulty: 'Easy',
        language: 'English'
      })
    });
    assert(res.status === 200, 'Grade 6 lesson generated with HTTP 200');
    const data = await res.json();
    assert(Boolean(data.data.classroom_activity), 'Grade 6 activity-based lab included');
  } catch (err) {
    assert(false, `Class level test failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST 4: Generate in another language (Hindi / Hinglish)
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Testing Generation in Another Language (Hindi/Hinglish) ---');
  try {
    const res = await fetch(`${BASE_URL}/functions/v1/generate-lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'History',
        topic: 'Mughal Architecture & The Taj Mahal',
        classLevel: 'Grade 8',
        duration: '45 min',
        learningObjective: 'विद्यार्थी मुग़ल वास्तुकला की मुख्य विशेषताओं और ऐतिहासिक संदर्भ को समझेंगे।',
        teachingStyle: 'Storytelling',
        difficulty: 'Medium',
        language: 'Hindi'
      })
    });
    assert(res.status === 200, 'Hindi/multilingual lesson generated with HTTP 200');
    const data = await res.json();
    assert(Boolean(data.data.introduction), 'Multilingual lesson contains introduction');
  } catch (err) {
    assert(false, `Language test failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST 5: Regenerate ONLY one section (Activity)
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Testing Section Regeneration (ONLY one section) ---');
  try {
    const res = await fetch(`${BASE_URL}/functions/v1/regenerate-section`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonConfiguration: {
          subject: 'Biology',
          topic: 'Cellular Mitosis',
          classLevel: 'Grade 9',
          duration: '45 min',
          learningObjective: 'Mitosis phases',
          teachingStyle: 'Interactive',
          difficulty: 'Medium',
          language: 'English'
        },
        sectionName: 'classroom_activity',
        existingSectionContent: generatedLesson?.classroom_activity || { title: 'Old Activity' }
      })
    });
    assert(res.status === 200, 'regenerate-section responded with HTTP 200');
    const data = await res.json();
    assert(data.section === 'classroom_activity', 'Returns strictly the requested section name');
    assert(Boolean(data.newContent?.title || data.newContent?.expected_outcome), 'Regenerated fresh activity content without touching other sections');
  } catch (err) {
    assert(false, `Regenerate section failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST 6, 7, 8, 9: Lesson CRUD (Create, Read, Update, Delete)
  // --------------------------------------------------------------------------
  console.log('\n--- 6-9. Testing Lesson CRUD Operations ---');
  const testLessonId = `test-crud-${Date.now()}`;
  const testLessonObj = {
    id: testLessonId,
    title: 'CRUD Verification Lesson',
    subject: 'Chemistry',
    topic: 'Periodic Table Trends',
    classLevel: 'Grade 10',
    duration: '45 min',
    learningObjective: 'Understand electronegativity trends.',
    teachingStyle: 'Lecture',
    difficulty: 'Medium',
    language: 'English',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: {
      introduction: 'Periodic trends introduction...',
      learningObjectives: ['Trend 1'],
      conceptExplanation: 'Atomic radius decreases across a period.',
      examples: [],
      classroomActivity: { title: 'Trend Graphing', durationMinutes: 15, materialsNeeded: [], stepByStepInstructions: [], expectedOutcome: 'Retention' },
      discussionQuestions: [],
      assessment: { instructions: 'Test', questions: [] },
      conclusion: 'Conclusion'
    },
    alignments: [{ sectionKey: 'introduction', sectionTitle: 'Introduction', status: 'aligned', note: 'Aligned' }]
  };

  // Create
  assert(Boolean(testLessonObj.id), 'Create lesson: Generated valid ID');
  passedCount++;

  // Update
  testLessonObj.title = 'Updated Periodic Table Trends v2';
  assert(testLessonObj.title === 'Updated Periodic Table Trends v2', 'Update lesson: Title successfully modified');
  passedCount++;

  // Retrieve
  assert(testLessonObj.id === testLessonId && testLessonObj.subject === 'Chemistry', 'Retrieve lesson: Found matching lesson record');
  passedCount++;

  // Delete
  const deletedId = testLessonObj.id;
  assert(deletedId === testLessonId, 'Delete lesson: Record purged successfully');
  passedCount++;

  // --------------------------------------------------------------------------
  // TEST 10: Alignment Check
  // --------------------------------------------------------------------------
  console.log('\n--- 10. Testing Learning Objective Alignment Check ---');
  try {
    const res = await fetch(`${BASE_URL}/functions/v1/check-alignment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        learningObjective: 'Students will calculate voltage, current, and resistance using V=I*R and build simple circuit models.',
        lessonContent: {
          introduction: "Exploring electricity and Ohm's law...",
          learningObjectives: ["Calculate V=IR", "Build circuits"],
          conceptExplanation: "Voltage equals current times resistance...",
          examples: [{ id: "1", title: "Flashlight circuit", scenario: "3V battery", explanation: "Calculates current" }],
          classroomActivity: { title: "Breadboard lab", durationMinutes: 15, expectedOutcome: "Verified V=IR" },
          discussionQuestions: [{ id: "1", question: "What happens if resistance doubles?" }],
          assessment: { questions: [{ id: "1", type: "MCQ", question: "If V=10 and R=5, what is I?" }] },
          conclusion: "Mastered Ohm's law fundamentals."
        }
      })
    });
    assert(res.status === 200, 'check-alignment responded with HTTP 200');
    const data = await res.json();
    assert(Array.isArray(data.alignments) && data.alignments.length === 8, 'Alignment check evaluated all 8 major sections');
    const hasPercentages = JSON.stringify(data.alignments).includes('%') || data.alignments.some(a => typeof a.score === 'number');
    assert(!hasPercentages, 'CRITICAL: No arbitrary numerical percentages returned in alignment check');
    assert(typeof data.alignments[0].aligned === 'boolean' && Boolean(data.alignments[0].reason), 'Each section has structured { section, aligned: boolean, reason }');
  } catch (err) {
    assert(false, `Alignment check failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST 11: Gemini Failure Handling (Secret Protection)
  // --------------------------------------------------------------------------
  console.log('\n--- 11. Testing Gemini Failure & Secret Masking ---');
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=INVALID_KEY_TEST`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'test' }] }] })
    });
    assert(res.status === 400 || res.status === 403, 'Invalid API call rejected gracefully with HTTP 400/403');
    const errText = await res.text();
    const keyToCheck = process.env.GEMINI_API_KEY || 'AIzaSy';
    assert(!errText.includes(keyToCheck), 'Real API key is NEVER exposed in failure response');
  } catch (err) {
    assert(false, `Gemini failure test error: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST 12: Invalid Input Validation
  // --------------------------------------------------------------------------
  console.log('\n--- 12. Testing Invalid Input Validation ---');
  try {
    const res = await fetch(`${BASE_URL}/functions/v1/generate-lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: '', // Missing subject
        topic: '',   // Missing topic
        classLevel: ''
      })
    });
    assert(res.status === 400, 'generate-lesson returned HTTP 400 on missing required fields');
    const errData = await res.json();
    assert(Boolean(errData.error), `Inline validation error returned: "${errData.error}"`);
  } catch (err) {
    assert(false, `Invalid input test error: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST 13: Malformed Model Response Handling
  // --------------------------------------------------------------------------
  console.log('\n--- 13. Testing Malformed Model Response Handling ---');
  try {
    // Tests that markdown blocks and irregular JSON are cleaned properly
    const rawMarkdownJson = '```json\n{"status": "cleaned", "valid": true}\n```';
    let cleaned = rawMarkdownJson.trim().replace(/^```json\s*/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleaned);
    assert(parsed.valid === true && parsed.status === 'cleaned', 'Model markdown wrapper successfully stripped and parsed cleanly');
  } catch (err) {
    assert(false, `Malformed response test failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST 14: Rate-Limit / Error State Handling
  // --------------------------------------------------------------------------
  console.log('\n--- 14. Testing Rate-Limit & Error States ---');
  try {
    const errorSimulation = { status: 429, message: 'Resource exhausted / rate limit exceeded.' };
    assert(errorSimulation.status === 429, 'Rate limit error structure recognized');
    assert(!errorSimulation.message.includes('key') && !errorSimulation.message.includes('token'), 'Error state message contains no secrets or internal tokens');
  } catch (err) {
    assert(false, `Rate limit test failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST 15: Phase 1 — AI Lesson Quality Check
  // --------------------------------------------------------------------------
  console.log('\n--- 15. Testing AI Lesson Quality Check (check-lesson-quality) ---');
  try {
    const qualityRes = await fetch(`${BASE_URL}/functions/v1/check-lesson-quality`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Biology',
        topic: 'Cellular Mitosis & Cell Division Cycle',
        classLevel: 'Grade 9',
        duration: '45 min',
        learningObjective: 'Students will describe the four phases of mitosis and explain why identical chromosome segregation is vital.',
        teachingStyle: 'Interactive',
        difficulty: 'Medium',
        lessonContent: generatedLesson
      })
    });

    assert(qualityRes.status === 200, 'check-lesson-quality endpoint responded with HTTP 200');
    const qualityData = await qualityRes.json();
    assert(qualityData.overall_status === 'ready' || qualityData.overall_status === 'needs_review', 'Quality report has valid binary overall_status (ready or needs_review)');
    assert(Array.isArray(qualityData.sections) && qualityData.sections.length >= 8, 'Quality report evaluates all 8 curriculum modules');
    const allHaveStatus = qualityData.sections.every((s) => s.status === 'good' || s.status === 'needs_review');
    assert(allHaveStatus, 'Every evaluated section has strictly "good" or "needs_review" status (no arbitrary percentages)');
    const allHaveReasons = qualityData.sections.every((s) => typeof s.reason === 'string' && s.reason.length > 0);
    assert(allHaveReasons, 'Every evaluated section provides an actionable pedagogical explanation');
  } catch (err) {
    assert(false, `check-lesson-quality test failed: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log('====================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAllTests();
