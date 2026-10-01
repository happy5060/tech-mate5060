import { Lesson } from '../types/lesson';

export const INITIAL_MOCK_LESSONS: Lesson[] = [
  {
    id: 'lesson-bio-01',
    title: 'Photosynthesis & Solar Energy Conversion',
    subject: 'Biology',
    topic: 'Photosynthesis & Light-Dependent Reactions',
    classLevel: 'Grade 9',
    duration: '45 min',
    learningObjective:
      'Students will understand how chlorophyll captures light energy to convert carbon dioxide and water into glucose and oxygen, and evaluate the environmental factors affecting the rate of photosynthesis.',
    teachingStyle: 'Interactive',
    difficulty: 'Medium',
    language: 'English',
    createdAt: '2026-09-28T10:30:00.000Z',
    updatedAt: '2026-09-30T14:15:00.000Z',
    alignments: [
      {
        sectionKey: 'introduction',
        sectionTitle: 'Introduction',
        status: 'aligned',
        note: 'Hooks students with real-world energy balance and connects directly to the core objective.'
      },
      {
        sectionKey: 'learningObjectives',
        sectionTitle: 'Learning Objectives',
        status: 'aligned',
        note: 'Clearly framed with Bloom’s taxonomy verbs (understand, evaluate, calculate).'
      },
      {
        sectionKey: 'conceptExplanation',
        sectionTitle: 'Concept Explanation',
        status: 'aligned',
        note: 'Thorough chemical breakdown including chloroplast anatomy, ATP synthesis, and the Calvin cycle.'
      },
      {
        sectionKey: 'examples',
        sectionTitle: 'Examples',
        status: 'aligned',
        note: 'Relatable aquatic Elodea and desert succulent adaptations (CAM pathway).'
      },
      {
        sectionKey: 'classroomActivity',
        sectionTitle: 'Classroom Activity',
        status: 'aligned',
        note: '15-minute hands-on leaf disk flotation experiment testing light intensity variation.'
      },
      {
        sectionKey: 'discussionQuestions',
        sectionTitle: 'Discussion Questions',
        status: 'aligned',
        note: 'Probes ecological implications of deforestation and global carbon sequestration.'
      },
      {
        sectionKey: 'assessment',
        sectionTitle: 'Assessment',
        status: 'aligned',
        note: 'Contains balanced coverage of MCQ, Short Answer, True/False, and Application items.'
      },
      {
        sectionKey: 'conclusion',
        sectionTitle: 'Conclusion',
        status: 'aligned',
        note: 'Summarizes key concepts and bridges into next week’s Cellular Respiration topic.'
      }
    ],
    content: {
      introduction:
        'Imagine a solar-powered biochemical factory so small that hundreds fit inside a single raindrop on a leaf. Every breath of oxygen we inhale and nearly every calorie consumed across the food web traces back to this singular, elegant mechanism: Photosynthesis. Today, we delve into how plants transform electromagnetic radiation into stable chemical bonds.',
      learningObjectives: [
        'Identify the key structural features of the chloroplast (thylakoids, stroma, and chlorophyll pigments).',
        'Write and balance the overall chemical equation for oxygenic photosynthesis.',
        'Distinguish between the light-dependent reactions and the light-independent Calvin cycle.',
        'Analyze how light intensity, temperature, and CO2 concentration act as limiting factors.'
      ],
      conceptExplanation:
        'Photosynthesis operates in two tightly coordinated stages:\n\n1. Light-Dependent Reactions (Thylakoid Membrane):\nPhotons strike chlorophyll molecules within Photosystems II and I. This excitation splits water molecules (photolysis), liberating gaseous O2 as a byproduct, while pumping protons across the thylakoid membrane to drive ATP Synthase and generate NADPH.\n\n2. Light-Independent Reactions / Calvin Cycle (Stroma):\nUsing the chemical currency generated in stage one (ATP and NADPH), the enzyme RuBisCO fixes atmospheric carbon dioxide into 3-PGA, which is enzymatically reduced to form glyceraldehyde-3-phosphate (G3P) and subsequently glucose (C6H12O6).\n\nOverall Stoichiometry: 6CO₂ + 6H₂O + Photons → C₆H₁₂O₆ + 6O₂.',
      examples: [
        {
          id: 'ex-1',
          title: 'Aquatic Elodea Bubble Count Experiment',
          scenario: 'Submerging Elodea in a sodium bicarbonate solution under varying lamp distances (10 cm vs 50 cm).',
          explanation: 'As lamp proximity decreases, radiant energy per unit area increases, triggering higher oxygen bubble generation per minute until chloroplast saturation.'
        },
        {
          id: 'ex-2',
          title: 'Desert Saguaro Cactus (CAM Adaptation)',
          scenario: 'Plants surviving in arid Sonoran climates with daytime temperatures above 40°C.',
          explanation: 'Stomata open exclusively at night to absorb CO2 and store it as malate, minimizing daytime evapotranspiration before running the Calvin cycle under sunlight.'
        }
      ],
      classroomActivity: {
        title: 'Floating Spinach Disk Photosynthesis Lab',
        durationMinutes: 15,
        materialsNeeded: [
          'Fresh baby spinach leaves',
          'Single-hole paper punch',
          '10 mL plastic syringes (without needle)',
          'Sodium bicarbonate solution (0.2%)',
          'Desk lamps / LED torches'
        ],
        stepByStepInstructions: [
          'Punch 10 uniform disks from fresh spinach leaves avoiding major veins.',
          'Place disks into the syringe barrel, reinsert plunger, and draw up 5 mL of bicarbonate solution.',
          'Invert syringe, expel excess air, and create a vacuum with your thumb to infiltrate spongy mesophyll air spaces until disks sink.',
          'Pour infiltrated sunken disks into a clear cup positioned 15 cm beneath the lamp.',
          'Record the time required for 50% (ET50) of the leaf disks to float back to the surface as photosynthetic oxygen accumulates.'
        ],
        expectedOutcome:
          'Students visually correlate light exposure with oxygen bubble formation and calculate the effective rate of photosynthetic conversion.'
      },
      discussionQuestions: [
        {
          id: 'dq-1',
          question: 'If global deforestation reduces total terrestrial leaf surface area by 30%, why might ocean phytoplankton become our most critical oxygen safety net?',
          facilitatorGuidance:
            'Steer dialogue toward marine microalgae producing over 50% of Earth’s atmospheric oxygen and discuss oceanic acid-base equilibrium.'
        },
        {
          id: 'dq-2',
          question: 'Why would illuminating a plant solely with pure green wavelength light drastically impede its biomass accumulation?',
          facilitatorGuidance:
            'Review chlorophyll absorption spectra; green light (500–550 nm) is largely reflected rather than absorbed by chlorophyll a and b.'
        }
      ],
      assessment: {
        instructions:
          'Administer this 10-minute diagnostic check to assess both foundational recall and higher-order application.',
        questions: [
          {
            id: 'q-1',
            type: 'MCQ',
            question: 'During photolysis in the thylakoid lumen, the splitting of water molecules directly yields which gas?',
            options: ['Carbon Dioxide (CO2)', 'Oxygen (O2)', 'Nitrogen (N2)', 'Methane (CH4)'],
            correctAnswer: 'Oxygen (O2)',
            explanation: 'Water oxidation in Photosystem II extracts electrons and releases molecular O2 as a crucial byproduct.'
          },
          {
            id: 'q-2',
            type: 'Short Answer',
            question: 'State the primary catalytic role played by the enzyme RuBisCO in the stroma of the chloroplast.',
            correctAnswer: 'RuBisCO catalyzes the fixation of atmospheric carbon dioxide onto ribulose-1,5-bisphosphate (RuBP).',
            rubric: 'Full credit requires mentioning CO2 fixation or bonding with RuBP. Half credit for general "carbon fixing".'
          },
          {
            id: 'q-3',
            type: 'True / False',
            question: 'Light-independent reactions (Calvin cycle) can operate continuously for days in complete darkness inside an active plant.',
            options: ['True', 'False'],
            correctAnswer: 'False',
            explanation: 'Although not directly requiring photons, the Calvin cycle relies on ATP and NADPH continuously supplied by the light reactions; in sustained dark, these coenzymes deplete rapidly.'
          },
          {
            id: 'q-4',
            type: 'Application Based',
            question: 'A commercial greenhouse owner notices crop yield stagnates even when providing 24-hour high-intensity LED lighting. Diagnose the likely limiting factors and propose two environmental adjustments.',
            correctAnswer: 'At high light intensity, the rate of photosynthesis is limited by carbon dioxide concentration or ambient temperature. The grower should supplement CO2 levels to 1000–1200 ppm and ensure temperatures remain in the enzymatic optimum range (20–28°C).',
            rubric: 'Look for recognition of Law of Limiting Factors (Blackman), identification of CO2 or temperature, and actionable remedies.'
          }
        ]
      },
      conclusion:
        'Photosynthesis is not merely an isolated botany chapter; it is the energetic foundation of planetary life and modern sustainable biofuels. As we conclude today’s session, remember how electromagnetic energy is woven into food and fuel. Next week, we reverse this pathway to investigate Cellular Respiration—how mitochondria liberate that stored energy.'
    }
  },
  {
    id: 'lesson-phy-02',
    title: 'Newton’s Laws of Motion & Momentum Conservation',
    subject: 'Physics',
    topic: 'Kinematics and Force Dynamics',
    classLevel: 'Grade 10',
    duration: '60 min',
    learningObjective:
      'Students will analyze and apply Newton’s Three Laws of Motion to predict the movement of bodies, calculate net forces, and explain everyday inertial and momentum conservation scenarios.',
    teachingStyle: 'Activity-based',
    difficulty: 'Medium',
    language: 'English',
    createdAt: '2026-09-29T11:00:00.000Z',
    updatedAt: '2026-09-29T16:45:00.000Z',
    alignments: [
      {
        sectionKey: 'introduction',
        sectionTitle: 'Introduction',
        status: 'aligned',
        note: 'Engaging roller coaster and vehicular safety frame.'
      },
      {
        sectionKey: 'learningObjectives',
        sectionTitle: 'Learning Objectives',
        status: 'aligned',
        note: 'Quantitatively and conceptually targeted.'
      },
      {
        sectionKey: 'conceptExplanation',
        sectionTitle: 'Concept Explanation',
        status: 'aligned',
        note: 'Clear derivation of F=ma and action-reaction pairs with free body diagrams.'
      },
      {
        sectionKey: 'examples',
        sectionTitle: 'Examples',
        status: 'aligned',
        note: 'Rocket propulsion and automotive seatbelt physics.'
      },
      {
        sectionKey: 'classroomActivity',
        sectionTitle: 'Classroom Activity',
        status: 'aligned',
        note: 'Low-friction balloon rocket momentum track competition.'
      },
      {
        sectionKey: 'discussionQuestions',
        sectionTitle: 'Discussion Questions',
        status: 'needs_review',
        note: 'Consider adding a question explicitly probing rotational equilibrium or friction coefficients.'
      },
      {
        sectionKey: 'assessment',
        sectionTitle: 'Assessment',
        status: 'aligned',
        note: 'Multi-tiered question styles including free-body diagram calculation.'
      },
      {
        sectionKey: 'conclusion',
        sectionTitle: 'Conclusion',
        status: 'aligned',
        note: 'Bridges Newtonian mechanics into orbital mechanics.'
      }
    ],
    content: {
      introduction:
        'Why does your coffee cup slide forward across the car dashboard when braking suddenly? Why does a rocket accelerate upward into a vacuum where there is no air to push against? Isaac Newton answered these questions in 1687 with three mathematical principles that govern everything from baseball pitches to planetary orbits.',
      learningObjectives: [
        'Formulate Newton’s First Law as the principle of inertia.',
        'Calculate acceleration and net force using F_net = m * a.',
        'Identify simultaneous equal and opposite action-reaction force pairs in disparate systems.',
        'Demonstrate how impulse (F * Δt) explains automotive crumple zones.'
      ],
      conceptExplanation:
        '1. Law of Inertia (1st Law): A body remains at rest or moves with constant velocity unless acted upon by a non-zero resultant net external force.\n\n2. Law of Acceleration (2nd Law): Acceleration is directly proportional to net force and inversely proportional to inertial mass (F_net = m · a).\n\n3. Law of Interaction (3rd Law): When Body A exerts a force on Body B, Body B simultaneously exerts an equal and opposite force on Body A (F_AB = -F_BA). Crucially, these forces act on different bodies and therefore never cancel each other out.',
      examples: [
        {
          id: 'ex-phy-1',
          title: 'Automotive Seatbelts & Inertia',
          scenario: 'A car traveling at 60 km/h stops abruptly during emergency braking.',
          explanation: 'The passenger’s body continues forward at 60 km/h due to inertia until the restraint belt applies an unbalanced backward force.'
        },
        {
          id: 'ex-phy-2',
          title: 'Space Shuttle Rocket Thrust',
          scenario: 'Rocket engines igniting in the vacuum of deep space.',
          explanation: 'The rocket forces superheated exhaust gases downward at high velocity; the expelled gas exerts an equal and opposite upward force propelling the rocket.'
        }
      ],
      classroomActivity: {
        title: 'Balloon Rocket String Track Investigation',
        durationMinutes: 20,
        materialsNeeded: [
          'Fishing line or smooth twine (5 meters)',
          'Drinking straws',
          'Latex balloons',
          'Masking tape',
          'Stopwatches and meter sticks'
        ],
        stepByStepInstructions: [
          'Thread the fishing line through a drinking straw and pull it taut horizontally across the room.',
          'Inflate a balloon without tying the nozzle, clamping it shut with fingers.',
          'Tape the balloon securely beneath the straw carriage.',
          'Release the nozzle and record the transit time and distance traveled.',
          'Vary balloon volume and tape small coin masses to test F=ma.'
        ],
        expectedOutcome:
          'Students quantify how increasing payload mass reduces acceleration when force is kept constant.'
      },
      discussionQuestions: [
        {
          id: 'dq-phy-1',
          question: 'If the Earth exerts a gravitational pull on an apple, does the apple exert an identical gravitational force on the Earth? Why do we only see the apple move?',
          facilitatorGuidance:
            'Affirm Newton’s 3rd Law: forces are identical in magnitude, but due to Earth’s massive inertia (m_Earth), its acceleration is imperceptibly tiny.'
        },
        {
          id: 'dq-phy-2',
          question: 'How do airbags save lives using the physics of impulse and momentum transfer?',
          facilitatorGuidance:
            'Highlight that impulse Δp = F · Δt. The cushion extends impact duration (Δt), dramatically lowering peak impact force (F).'
        }
      ],
      assessment: {
        instructions: 'Test comprehension across basic laws, algebraic calculation, and practical engineering designs.',
        questions: [
          {
            id: 'qp-1',
            type: 'MCQ',
            question: 'A 1,200 kg vehicle accelerates uniformly from rest to 20 m/s in 4 seconds. What is the net horizontal force applied to the car?',
            options: ['3,000 N', '6,000 N', '12,000 N', '24,000 N'],
            correctAnswer: '6,000 N',
            explanation: 'Acceleration a = (20 - 0) / 4 = 5 m/s². Net force F = m · a = 1,200 kg · 5 m/s² = 6,000 N.'
          },
          {
            id: 'qp-2',
            type: 'True / False',
            question: 'Action and reaction forces in Newton’s third law always cancel each other out because they are equal and opposite.',
            options: ['True', 'False'],
            correctAnswer: 'False',
            explanation: 'Action-reaction pairs act on different objects (e.g. foot on ball vs ball on foot), so they never cancel within a single object free-body diagram.'
          },
          {
            id: 'qp-3',
            type: 'Short Answer',
            question: 'Define "inertia" and identify the physical property of an object that directly determines its inertia.',
            correctAnswer: 'Inertia is the resistance of an object to any change in its velocity. It is solely determined by its mass.',
            rubric: '1 mark for resistance to state change; 1 mark for identifying mass.'
          },
          {
            id: 'qp-4',
            type: 'Application Based',
            question: 'Explain why modern highway crash barriers are engineered to crumple rather than remain rigidly unyielding upon vehicular impact.',
            correctAnswer: 'By crumpling, the barrier lengthens the collision time duration (Δt). According to the impulse-momentum theorem (F = Δp / Δt), extending the deceleration period substantially decreases the peak impact force transmitted to the vehicle occupants.',
            rubric: 'Award full marks for explicit reference to extending collision time and reducing impact force.'
          }
        ]
      },
      conclusion:
        'From keeping us secure in speeding automobiles to charting course trajectories for Mars rovers, Newton’s Laws form the cornerstone of mechanical reality. In our next session, we will combine these principles with work and gravitational potential energy.'
    }
  },
  {
    id: 'lesson-hist-03',
    title: 'The Industrial Revolution & Urban Social Transformation',
    subject: 'History',
    topic: 'Technological Innovations & Social Shifts (1760–1840)',
    classLevel: 'Grade 8',
    duration: '45 min',
    learningObjective:
      'Students will examine how steam power, textile mechanization, and the factory system altered rural-to-urban migration patterns and changed daily working conditions in 19th-century Britain.',
    teachingStyle: 'Discussion',
    difficulty: 'Easy',
    language: 'English',
    createdAt: '2026-09-30T09:00:00.000Z',
    updatedAt: '2026-09-30T10:20:00.000Z',
    alignments: [
      {
        sectionKey: 'introduction',
        sectionTitle: 'Introduction',
        status: 'aligned',
        note: 'Rich evocative description of Victorian Manchester skyline and artisanal transition.'
      },
      {
        sectionKey: 'learningObjectives',
        sectionTitle: 'Learning Objectives',
        status: 'aligned',
        note: 'Clear historical cause-and-effect structure.'
      },
      {
        sectionKey: 'conceptExplanation',
        sectionTitle: 'Concept Explanation',
        status: 'aligned',
        note: 'Contrasts domestic cottage industry with mechanized steam-driven factory floors.'
      },
      {
        sectionKey: 'examples',
        sectionTitle: 'Examples',
        status: 'aligned',
        note: 'Case studies on Watt’s steam engine and child labor in textile mills.'
      },
      {
        sectionKey: 'classroomActivity',
        sectionTitle: 'Classroom Activity',
        status: 'aligned',
        note: 'Primary source document analysis comparing Parliamentary Factory Acts.'
      },
      {
        sectionKey: 'discussionQuestions',
        sectionTitle: 'Discussion Questions',
        status: 'aligned',
        note: 'Connects 19th-century automation fears to contemporary AI workforce discussions.'
      },
      {
        sectionKey: 'assessment',
        sectionTitle: 'Assessment',
        status: 'aligned',
        note: 'Thoughtful mix of historical evidence analysis and conceptual checks.'
      },
      {
        sectionKey: 'conclusion',
        sectionTitle: 'Conclusion',
        status: 'aligned',
        note: 'Synthesizes long-term living standard debates.'
      }
    ],
    content: {
      introduction:
        'Within two generations between 1760 and 1840, quiet rural hamlets with hand-powered looms transformed into towering brick mill cities lit by gaslight and shrouded in coal smoke. This was the Industrial Revolution—a turning point that restructured human society, labor contracts, and the global economy.',
      learningObjectives: [
        'Identify key technological catalysts including the spinning jenny and Watt’s rotary steam engine.',
        'Analyze the demographic transition from agrarian cottage systems to concentrated urban centers.',
        'Evaluate the social consequences of factory life on women and child workers.',
        'Explain the emergence of labor unions and early regulatory legislation (Factory Acts).'
      ],
      conceptExplanation:
        'Prior to the mid-18th century, production occurred in homes under the "putting-out system". The confluence of abundant British coal and iron reserves, access to colonial raw cotton, and mechanized breakthroughs like Arkwright’s water frame centralized workers into mechanized factories. This sparked unprecedented urbanization: Manchester grew from a market town of 25,000 in 1770 to over 300,000 by 1850, outpacing municipal sanitation and housing infrastructure.',
      examples: [
        {
          id: 'ex-hist-1',
          title: 'James Watt’s Separate Condenser Steam Engine (1776)',
          scenario: 'Transition from watermill river dependencies to coal-fired urban steam engines.',
          explanation: 'Freed factories from riverbanks, allowing industrial complexes to be constructed directly beside deepwater ports and coal mines.'
        },
        {
          id: 'ex-hist-2',
          title: 'The Sad Reality of Factory Apprentices',
          scenario: 'Orphaned children working 14-hour shifts cleaning spinning mules in cotton mills.',
          explanation: 'Demonstrates the unregulated early industrial market that prompted Lord Shaftesbury to campaign for the Factory Act of 1833.'
        }
      ],
      classroomActivity: {
        title: 'Parliamentary Witness Testimony Roleplay',
        durationMinutes: 15,
        materialsNeeded: [
          'Excerpts from the 1832 Sadler Committee Report',
          'Role assignment cards (Mill Owner, 12-year-old Piecer, Town Physician, Parliamentarian)'
        ],
        stepByStepInstructions: [
          'Divide students into 4-person testimony panels representing differing social stakes.',
          'Examine the historical primary source extract on working hours and factory injuries.',
          'Conduct a 5-minute simulated Parliamentary interrogation on whether to limit child labor to 10 hours daily.',
          'Reconvene and compare arguments with the actual 1833 Factory Act provisions.'
        ],
        expectedOutcome:
          'Students understand multiple economic viewpoints and appreciate how legislation evolved in response to public outcry.'
      },
      discussionQuestions: [
        {
          id: 'dq-hist-1',
          question: 'The Luddites smashed mechanical weaving frames because they feared machines would destroy their livelihoods. How does this compare with contemporary concerns about Generative AI in the workplace?',
          facilitatorGuidance:
            'Encourage parallels between technological disruption, productivity leaps, and the need for worker reskilling.'
        },
        {
          id: 'dq-hist-2',
          question: 'Did the Industrial Revolution improve or degrade the standard of living for working-class families between 1780 and 1830?',
          facilitatorGuidance:
            'Explore the classic "standard of living debate": higher nominal consumer goods vs terrible urban sanitation and shorter life expectancy.'
        }
      ],
      assessment: {
        instructions: 'Evaluate student command of technological sequence and socio-economic consequences.',
        questions: [
          {
            id: 'qh-1',
            type: 'MCQ',
            question: 'Which invention enabled factories to operate inland away from running rivers?',
            options: ['Flying shuttle', 'Watt steam engine', 'Water frame', 'Hand loom'],
            correctAnswer: 'Watt steam engine',
            explanation: 'James Watt’s improved steam engine used coal rather than flowing water, liberating factory locations.'
          },
          {
            id: 'qh-2',
            type: 'True / False',
            question: 'The 1833 Factory Act immediately banned all forms of employment for teenagers under the age of 18.',
            options: ['True', 'False'],
            correctAnswer: 'False',
            explanation: 'The 1833 Act prohibited work for children under nine and limited hours for older children, but did not ban teen employment.'
          },
          {
            id: 'qh-3',
            type: 'Short Answer',
            question: 'Explain how the shift from the "cottage industry" to the "factory system" affected family working units.',
            correctAnswer: 'In cottage industries, families worked cooperatively inside their homes at their own pace; the factory system separated parents and children into regimented clock-driven workplaces.',
            rubric: 'Look for the distinction between flexible home work and rigid factory shifts.'
          },
          {
            id: 'qh-4',
            type: 'Application Based',
            question: 'Analyze two major municipal consequences that arose in rapidly expanding British industrial towns that lacked public health planning.',
            correctAnswer: 'Consequences included severe overcrowding in tenements, outbreaks of waterborne cholera and typhus due to contaminated cesspools, and lack of clean water systems.',
            rubric: 'Award points for mentioning disease/sanitation, inadequate sewage, or dangerous tenement density.'
          }
        ]
      },
      conclusion:
        'The smoke and iron of the Industrial Revolution shaped modern workplace standards, labor laws, and urban infrastructure. As we look at today’s digital automation, we see echoes of the very questions first asked in 19th-century Manchester.'
    }
  }
];
