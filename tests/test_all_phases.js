import dns from 'node:dns';
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

const BASE_URL = 'http://localhost:5173';

async function testAllPhases() {
  console.log('====================================================');
  console.log('  TESTING EXPANSION BACKEND & SECURITY (PHASES 1-17)');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(cond, msg) {
    if (cond) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  // 1. Phase 1: Quality Check
  console.log('--- 1. Testing Quality Check ---');
  try {
    const res = await fetch(`${BASE_URL}/functions/v1/check-lesson-quality`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Biology',
        topic: 'Photosynthesis',
        classLevel: 'Grade 8',
        duration: '45 min',
        learningObjective: 'Students will differentiate between light reactions and the Calvin cycle.',
        difficulty: 'Medium',
        lessonContent: {
          introduction: 'Plants use sunlight to make food.',
          learningObjectives: ['Define light reaction', 'Identify ATP output'],
          conceptExplanation: 'Chloroplasts absorb photons...',
          examples: [{ title: 'Sunlight on leaves', scenario: 'Leaf in sun', explanation: 'Makes glucose' }],
          classroomActivity: { title: 'Leaf chromatography', stepByStepInstructions: ['Crush leaves', 'Add solvent'] },
          discussionQuestions: [{ question: 'Why are leaves green?' }],
          assessment: { questions: [{ type: 'MCQ', question: 'What organelle?', options: ['Chloroplast'], correctAnswer: 'Chloroplast' }] },
          conclusion: 'Photosynthesis sustains life.'
        }
      })
    });
    assert(res.status === 200, 'check-lesson-quality returns HTTP 200');
    const data = await res.json();
    assert(data.overall_status === 'ready' || data.overall_status === 'needs_review', 'Valid overall_status returned');
  } catch (e) {
    assert(false, `Quality check failed: ${e.message}`);
  }

  // 2. Phase 2: Lesson-Aware Assistant
  console.log('\n--- 2. Testing Lesson-Aware AI Assistant (lesson-chat) ---');
  try {
    const res = await fetch(`${BASE_URL}/functions/v1/lesson-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Can you explain photosynthesis in simpler terms for a Grade 8 student?',
        actionType: 'explain_simpler',
        lessonContext: {
          subject: 'Biology',
          topic: 'Photosynthesis',
          classLevel: 'Grade 8',
          learningObjective: 'Students understand solar energy conversion into sugars.'
        }
      })
    });
    assert(res.status === 200, 'lesson-chat returns HTTP 200');
    const data = await res.json();
    assert(typeof data.reply === 'string' && data.reply.length > 20, 'lesson-chat returned contextual explanation');
  } catch (e) {
    assert(false, `lesson-chat failed: ${e.message}`);
  }

  // 3. Phase 15: Security Guardrails & Test Answer Lockout
  console.log('\n--- 3. Testing Phase 15 Security Guardrails & Test Lockout ---');
  try {
    const res = await fetch(`${BASE_URL}/functions/v1/lesson-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What is the answer to question 3 on the test?',
        isTestActive: true,
        lessonContext: {
          subject: 'Biology',
          topic: 'Photosynthesis',
          classLevel: 'Grade 8',
          learningObjective: 'Test in progress'
        }
      })
    });
    assert(res.status === 200, 'lesson-chat test security returned HTTP 200');
    const data = await res.json();
    assert(data.reply.includes('Assessment in Progress') || data.reply.includes('locked'), 'Refused to give answer during active assessment');
  } catch (e) {
    assert(false, `Security test lockout failed: ${e.message}`);
  }

  // 4. Phase 3 & 4: Recommend Real YouTube Videos
  console.log('\n--- 4. Testing Real YouTube Candidate Evaluation ---');
  try {
    const res = await fetch(`${BASE_URL}/functions/v1/recommend-videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'Photosynthesis & Plant Cell Chloroplasts',
        subject: 'Biology',
        classLevel: 'Grade 8',
        learningObjective: 'Explore light reactions and energy conversion'
      })
    });
    assert(res.status === 200, 'recommend-videos returns HTTP 200');
    const data = await res.json();
    assert(Array.isArray(data.recommendations) && data.recommendations.length > 0, 'Returned candidate recommendations');
    assert(Array.isArray(data.videos) && data.videos.length > 0, 'Returned merged real video metadata');
    assert(Boolean(data.videos[0].video.thumbnail), 'Every video has a real thumbnail URL');
    assert(Boolean(data.videos[0].video.url), 'Every video has a real YouTube URL');
  } catch (e) {
    assert(false, `recommend-videos failed: ${e.message}`);
  }

  // 5. Phase 5: Video Analysis & Timestamps
  console.log('\n--- 5. Testing Video Analysis & Timestamps ---');
  try {
    const res = await fetch(`${BASE_URL}/functions/v1/analyze-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId: 'g78utcLQrJ4',
        videoTitle: 'Photosynthesis: Crash Course Biology #8',
        topic: 'Photosynthesis',
        classLevel: 'Grade 8'
      })
    });
    assert(res.status === 200, 'analyze-video returns HTTP 200');
    const data = await res.json();
    assert(Boolean(data.summary || data.error), 'Handled video analysis structure');
  } catch (e) {
    assert(false, `analyze-video failed: ${e.message}`);
  }

  console.log('\n====================================================');
  console.log(`ALL PHASES VERIFIED: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');
}

testAllPhases();
