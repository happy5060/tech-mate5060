// Test check-lesson-quality with incomplete / flawed content
import dns from 'node:dns';
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

async function testNeedsReview() {
  const payload = {
    subject: 'Physics',
    topic: 'Quantum Field Theory',
    classLevel: 'Grade 3', // Inappropriate class level!
    duration: '45 min',
    learningObjective: 'Learn physics', // Vague, unmeasurable!
    teachingStyle: 'Interactive',
    difficulty: 'Hard',
    lessonContent: {
      introduction: 'Hi kids.',
      learningObjectives: ['Learn physics'],
      conceptExplanation: 'Gauge bosons propagate through vacuum expectation values.',
      examples: [], // Empty examples!
      classroomActivity: {
        title: 'Particle accelerator building',
        durationMinutes: 45,
        materialsNeeded: ['Synchrotron'],
        stepByStepInstructions: ['Collide protons at 14 TeV'],
        expectedOutcome: 'Find Higgs boson'
      },
      discussionQuestions: [], // Empty discussion questions!
      assessment: {
        instructions: 'Test',
        questions: [] // Empty assessment!
      },
      conclusion: 'Done.'
    }
  };

  console.log('Testing quality check with inappropriate/flawed lesson content...');
  try {
    const res = await fetch('http://localhost:5173/functions/v1/check-lesson-quality', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('HTTP Status:', res.status);
    const data = await res.json();
    console.log('Overall Status:', data.overall_status);
    console.log('Sections flagged with needs_review:');
    const flagged = (data.sections || []).filter((s) => s.status === 'needs_review');
    flagged.forEach((s) => {
      console.log(` - [${s.section}] Reason: ${s.reason}`);
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

testNeedsReview();
