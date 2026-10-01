// Scratch test for check-lesson-quality edge function
import dns from 'node:dns';
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

async function testQuality() {
  const payload = {
    subject: 'Biology',
    topic: 'Photosynthesis & Cellular Respiration',
    classLevel: 'Grade 8',
    duration: '45 min',
    learningObjective: 'Students will differentiate between the chemical processes of photosynthesis and cellular respiration in plant cells.',
    teachingStyle: 'Interactive',
    difficulty: 'Medium',
    lessonContent: {
      introduction: 'Have you ever wondered how green plants create their own food from mere sunlight, water, and air? In this lesson, we explore nature’s solar engine.',
      learningObjectives: [
        'Define the chemical formula of photosynthesis',
        'Identify the role of chlorophyll and chloroplasts',
        'Compare inputs and outputs of cellular respiration'
      ],
      conceptExplanation: 'Photosynthesis takes place in chloroplasts where chlorophyll captures solar energy to convert carbon dioxide and water into glucose and oxygen. Cellular respiration conversely breaks down glucose to produce ATP.',
      examples: [
        {
          id: 'ex-1',
          title: 'Forest Canopy Gas Exchange',
          scenario: 'A dense forest during midday',
          explanation: 'Trees consume CO2 and release huge amounts of oxygen into the atmosphere.'
        }
      ],
      classroomActivity: {
        title: 'Elodea Leaf & Sunlight Lab',
        durationMinutes: 15,
        materialsNeeded: ['Elodea sprig', 'Beaker with water', 'Desk lamp', 'Stopwatch'],
        stepByStepInstructions: ['Submerge Elodea in water', 'Position lamp 10cm away', 'Count oxygen bubbles per minute'],
        expectedOutcome: 'Students directly observe bubble emission as proof of oxygen release.'
      },
      discussionQuestions: [
        {
          id: 'dq-1',
          question: 'What happens to a plant kept in total darkness for 7 days?',
          facilitatorGuidance: 'Guide students to consider stored starch consumption and cessation of glucose synthesis.'
        }
      ],
      assessment: {
        instructions: 'Answer the following diagnostic questions.',
        questions: [
          {
            id: 'q-1',
            type: 'MCQ',
            question: 'Which organelle is the primary site of photosynthesis in eukaryotic plant cells?',
            options: ['Chloroplast', 'Mitochondria', 'Ribosome', 'Golgi Apparatus'],
            correctAnswer: 'Chloroplast',
            explanation: 'Chloroplasts contain chlorophyll pigments that absorb light wavelengths for photosynthetic light reactions.'
          }
        ]
      },
      conclusion: 'Photosynthesis and cellular respiration are complementary biological cycles maintaining Earth’s oxygen and carbon equilibrium.'
    }
  };

  console.log('Sending request to http://localhost:5173/functions/v1/check-lesson-quality ...');
  try {
    const res = await fetch('http://localhost:5173/functions/v1/check-lesson-quality', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('HTTP Status:', res.status);
    const data = await res.json();
    console.log('Response JSON:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Test error:', err);
  }
}

testQuality();
