/**
 * Mental Health Knowledge Base for RAG System
 * Contains curated resources, coping strategies, crisis information
 */

const KNOWLEDGE_BASE = [
  // ─── Crisis Resources ───────────────────────────────────────────────────
  {
    id: 'crisis_001',
    category: 'crisis',
    title: 'National Suicide Prevention Lifeline',
    content: 'If you or someone you know is in crisis, call or text 988 (Suicide & Crisis Lifeline in the US). Available 24/7. Chat option at 988lifeline.org. For immediate danger, call 911.',
    tags: ['suicide', 'crisis', 'helpline', 'emergency'],
    risk_level: 'high'
  },
  {
    id: 'crisis_002',
    category: 'crisis',
    title: 'Crisis Text Line',
    content: 'Text HOME to 741741 to reach the Crisis Text Line. Free, 24/7 support via text message with trained crisis counselors.',
    tags: ['crisis', 'text', 'helpline', 'counselor'],
    risk_level: 'high'
  },
  {
    id: 'crisis_003',
    category: 'crisis',
    title: 'International Crisis Hotlines',
    content: 'International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/. India: iCall 9152987821, Vandrevala Foundation 1860-2662-345. UK: Samaritans 116 123. Australia: Lifeline 13 11 14.',
    tags: ['international', 'crisis', 'helpline', 'global'],
    risk_level: 'high'
  },
  // ─── Depression ──────────────────────────────────────────────────────────
  {
    id: 'dep_001',
    category: 'depression',
    title: 'Understanding Depression',
    content: 'Depression is a common but serious mood disorder causing persistent feelings of sadness, hopelessness, and loss of interest. It affects how you feel, think, and handle daily activities. Depression is NOT a sign of weakness — it is a medical condition that responds to treatment.',
    tags: ['depression', 'awareness', 'education', 'mood disorder'],
    risk_level: 'medium'
  },
  {
    id: 'dep_002',
    category: 'depression',
    title: 'Signs of Depression',
    content: 'Common signs include: persistent sadness or empty mood, feelings of hopelessness, loss of interest in activities, sleep disturbances, fatigue, difficulty concentrating, changes in appetite, physical aches, thoughts of death or suicide. If experiencing 5+ symptoms for 2+ weeks, please seek professional help.',
    tags: ['depression', 'symptoms', 'warning signs'],
    risk_level: 'medium'
  },
  {
    id: 'dep_003',
    category: 'depression',
    title: 'Coping with Depression',
    content: 'Evidence-based coping strategies: 1) Regular exercise (30 min/day can reduce symptoms), 2) Maintain social connections even when it feels hard, 3) Establish sleep routines, 4) Limit alcohol, 5) Break tasks into small steps, 6) Practice self-compassion, 7) Seek professional therapy (CBT is highly effective), 8) Consider medication if recommended by a doctor.',
    tags: ['depression', 'coping', 'strategies', 'CBT'],
    risk_level: 'low'
  },
  // ─── Anxiety ─────────────────────────────────────────────────────────────
  {
    id: 'anx_001',
    category: 'anxiety',
    title: 'Understanding Anxiety',
    content: 'Anxiety disorders are the most common mental health conditions globally, affecting 284 million people. Anxiety involves excessive worry, fear, or nervousness that interferes with daily life. Types include: GAD, panic disorder, social anxiety, and phobias.',
    tags: ['anxiety', 'awareness', 'education'],
    risk_level: 'medium'
  },
  {
    id: 'anx_002',
    category: 'anxiety',
    title: '4-7-8 Breathing Technique',
    content: 'A powerful breathing exercise to calm anxiety: 1) Exhale completely through your mouth. 2) Inhale quietly through your nose for 4 counts. 3) Hold breath for 7 counts. 4) Exhale through mouth for 8 counts. This is one cycle. Repeat 3-4 times. This activates the parasympathetic nervous system.',
    tags: ['anxiety', 'breathing', 'technique', 'immediate relief'],
    risk_level: 'low'
  },
  {
    id: 'anx_003',
    category: 'anxiety',
    title: '5-4-3-2-1 Grounding Technique',
    content: 'Grounding technique to manage anxiety and panic: Identify 5 things you can SEE, 4 things you can TOUCH, 3 things you can HEAR, 2 things you can SMELL, 1 thing you can TASTE. This brings you back to the present moment and interrupts the anxiety cycle.',
    tags: ['anxiety', 'grounding', 'technique', 'mindfulness'],
    risk_level: 'low'
  },
  // ─── Mindfulness & Self-Care ─────────────────────────────────────────────
  {
    id: 'mind_001',
    category: 'mindfulness',
    title: 'Introduction to Mindfulness',
    content: 'Mindfulness is the practice of paying attention to the present moment without judgment. Research shows it reduces stress, anxiety, and depression. Even 5-10 minutes daily can create measurable changes in the brain. Apps like Headspace, Calm, and Insight Timer offer guided meditations.',
    tags: ['mindfulness', 'meditation', 'self-care', 'stress'],
    risk_level: 'low'
  },
  {
    id: 'mind_002',
    category: 'mindfulness',
    title: 'Body Scan Meditation',
    content: 'A relaxation practice: Lie down comfortably. Close your eyes. Starting from your feet, slowly move attention up through your body. Notice sensations without judgment. Spend 20-30 seconds on each body part. Helps release physical tension held from stress and anxiety.',
    tags: ['mindfulness', 'body scan', 'relaxation', 'meditation'],
    risk_level: 'low'
  },
  {
    id: 'mind_003',
    category: 'self-care',
    title: 'Self-Care Fundamentals',
    content: 'Pillars of mental health self-care: 1) Sleep 7-9 hours, 2) Exercise regularly, 3) Eat nutritious foods, 4) Stay hydrated, 5) Limit social media, 6) Maintain social connections, 7) Practice hobbies, 8) Set healthy boundaries, 9) Spend time in nature, 10) Practice gratitude journaling.',
    tags: ['self-care', 'wellness', 'lifestyle', 'prevention'],
    risk_level: 'low'
  },
  // ─── Stress Management ───────────────────────────────────────────────────
  {
    id: 'stress_001',
    category: 'stress',
    title: 'Understanding Stress',
    content: 'Stress is a normal physiological response to challenges. Chronic stress however can lead to anxiety, depression, and physical health problems. Key stress hormones: cortisol and adrenaline. Recognizing your stress triggers is the first step to management.',
    tags: ['stress', 'awareness', 'cortisol', 'triggers'],
    risk_level: 'low'
  },
  {
    id: 'stress_002',
    category: 'stress',
    title: 'Progressive Muscle Relaxation',
    content: 'PMR technique: Tense each muscle group for 5 seconds, then release for 30 seconds. Start with feet, move to calves, thighs, abdomen, chest, arms, hands, neck, and face. This reduces physical tension from stress and teaches body awareness.',
    tags: ['stress', 'PMR', 'relaxation', 'technique'],
    risk_level: 'low'
  },
  // ─── Professional Help ───────────────────────────────────────────────────
  {
    id: 'prof_001',
    category: 'professional_help',
    title: 'When to Seek Professional Help',
    content: 'Seek professional help when: symptoms last more than 2 weeks, daily functioning is impaired, you have thoughts of self-harm or suicide, substance use is increasing, relationships are significantly affected, or you simply feel unable to cope. Therapy and medication together are highly effective.',
    tags: ['professional help', 'therapy', 'psychiatrist', 'counselor'],
    risk_level: 'medium'
  },
  {
    id: 'prof_002',
    category: 'professional_help',
    title: 'Types of Mental Health Professionals',
    content: 'Psychiatrist: Medical doctor who can prescribe medication. Psychologist: Provides therapy and psychological testing. Licensed Counselor/Therapist: Provides talk therapy. Social Worker: Provides therapy and connects to community resources. Primary Care Doctor: First point of contact, can refer to specialists.',
    tags: ['professionals', 'psychiatrist', 'psychologist', 'therapy'],
    risk_level: 'low'
  },
  {
    id: 'prof_003',
    category: 'professional_help',
    title: 'Online Therapy Platforms',
    content: 'Accessible online mental health support: BetterHelp (betterhelp.com), Talkspace (talkspace.com), 7 Cups (7cups.com - free peer support), Open Path Collective (affordable therapy), NAMI Helpline: 1-800-950-6264.',
    tags: ['online therapy', 'teletherapy', 'accessible', 'affordable'],
    risk_level: 'low'
  },
  // ─── Suicide Prevention ──────────────────────────────────────────────────
  {
    id: 'sui_001',
    category: 'suicide_prevention',
    title: 'Warning Signs of Suicidal Ideation',
    content: 'Warning signs: Talking about wanting to die, looking for ways to kill oneself, talking about being a burden, increased substance use, withdrawing from activities, extreme mood swings, giving away possessions, saying goodbyes. If you notice these in someone, take it seriously and ask directly.',
    tags: ['suicide', 'warning signs', 'prevention', 'awareness'],
    risk_level: 'high'
  },
  {
    id: 'sui_002',
    category: 'suicide_prevention',
    title: 'How to Help Someone at Risk',
    content: 'If someone may be suicidal: 1) Ask directly "Are you thinking about suicide?" - this does NOT increase risk, 2) Listen without judgment, 3) Do not leave them alone, 4) Remove access to lethal means, 5) Help connect to professional help, 6) Follow up after crisis. QPR Training (Question, Persuade, Refer) is available free online.',
    tags: ['suicide', 'intervention', 'help others', 'QPR'],
    risk_level: 'high'
  },
  {
    id: 'sui_003',
    category: 'suicide_prevention',
    title: 'Safety Planning',
    content: 'A safety plan is a prioritized list of coping strategies. Include: Warning signs to watch for, internal coping strategies, social contacts who can distract, people to ask for help, professionals to contact, making environment safe. The Stanley-Brown Safety Planning Intervention is evidence-based and effective.',
    tags: ['suicide', 'safety plan', 'coping', 'prevention'],
    risk_level: 'high'
  }
];

// Distress signal keywords mapped to risk levels
const DISTRESS_SIGNALS = {
  critical: [
    'want to die', 'kill myself', 'end my life', 'suicide', 'suicidal',
    'not worth living', 'better off dead', 'no reason to live', 'goodbye forever',
    'hurt myself', 'self harm', 'self-harm', 'cutting myself', 'overdose'
  ],
  high: [
    'hopeless', 'no hope', 'cant go on', "can't go on", 'give up',
    'worthless', 'burden to everyone', 'nobody cares', 'trapped', 'no way out',
    'nothing matters', 'disappear', 'wish i was dead', 'tired of living'
  ],
  medium: [
    'depressed', 'depression', 'anxious', 'anxiety', 'panic attack',
    'cant sleep', "can't sleep", 'crying all the time', 'empty inside',
    'exhausted', 'overwhelmed', 'falling apart', 'breaking down', 'struggling'
  ],
  low: [
    'stressed', 'sad', 'lonely', 'worried', 'nervous', 'upset',
    'frustrated', 'angry', 'tired', 'down', 'blue', 'unhappy'
  ]
};

// Empathetic response starters by context
const EMPATHY_STARTERS = {
  critical: [
    "I'm deeply concerned about what you've shared, and I want you to know you're not alone.",
    "Thank you for trusting me with this. What you're feeling matters, and I'm here with you.",
    "I hear you, and I'm so glad you're talking about this right now."
  ],
  high: [
    "That sounds incredibly painful, and I want you to know your feelings are completely valid.",
    "I hear how much you're struggling, and I'm here to support you through this.",
    "What you're going through sounds really difficult. You don't have to face this alone."
  ],
  medium: [
    "It sounds like you're going through a really tough time right now.",
    "I can hear that things feel really heavy right now. Thank you for sharing with me.",
    "That sounds really challenging. Let's work through this together."
  ],
  low: [
    "I hear you. It's okay to feel this way.",
    "Thank you for sharing that with me.",
    "I'm here to listen and support you."
  ]
};

module.exports = { KNOWLEDGE_BASE, DISTRESS_SIGNALS, EMPATHY_STARTERS };
