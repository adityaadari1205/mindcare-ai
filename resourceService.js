/**
 * Resources & Helpline Service
 * Connects users to appropriate mental health support resources
 */

const HELPLINES = {
  us: [
    {
      name: '988 Suicide & Crisis Lifeline',
      phone: '988',
      textOption: 'Text 988',
      chat: 'https://988lifeline.org/chat/',
      description: 'Free, confidential crisis support for people in suicidal crisis or mental health distress',
      available: '24/7',
      languages: ['English', 'Spanish'],
      cost: 'Free'
    },
    {
      name: 'Crisis Text Line',
      phone: null,
      textOption: 'Text HOME to 741741',
      chat: 'https://www.crisistextline.org/',
      description: 'Free crisis counseling via text message',
      available: '24/7',
      languages: ['English', 'Spanish'],
      cost: 'Free'
    },
    {
      name: 'NAMI Helpline',
      phone: '1-800-950-6264',
      textOption: 'Text NAMI to 741741',
      chat: 'https://www.nami.org/help',
      description: 'National Alliance on Mental Illness — mental health info and local referrals',
      available: 'Mon-Fri 10am-10pm ET',
      languages: ['English', 'Spanish'],
      cost: 'Free'
    },
    {
      name: 'SAMHSA National Helpline',
      phone: '1-800-662-4357',
      textOption: null,
      chat: 'https://www.samhsa.gov/find-help/national-helpline',
      description: 'Substance abuse and mental health treatment referral service',
      available: '24/7',
      languages: ['English', 'Spanish'],
      cost: 'Free'
    },
    {
      name: 'Veterans Crisis Line',
      phone: '988 then press 1',
      textOption: 'Text 838255',
      chat: 'https://www.veteranscrisisline.net/get-help-now/chat/',
      description: 'Specialized crisis support for veterans and their families',
      available: '24/7',
      languages: ['English'],
      cost: 'Free'
    }
  ],
  india: [
    {
      name: 'iCall',
      phone: '9152987821',
      textOption: null,
      chat: 'https://icallhelpline.org/',
      description: 'Psycho-social helpline by TISS providing counseling and referrals',
      available: 'Mon-Sat 8am-10pm',
      languages: ['English', 'Hindi'],
      cost: 'Free'
    },
    {
      name: 'Vandrevala Foundation',
      phone: '1860-2662-345',
      textOption: null,
      chat: null,
      description: '24/7 mental health helpline for immediate support',
      available: '24/7',
      languages: ['English', 'Hindi', 'Marathi'],
      cost: 'Free'
    },
    {
      name: 'AASRA',
      phone: '9820466627',
      textOption: null,
      chat: 'http://www.aasra.info/',
      description: 'Suicide prevention organization with 24/7 helpline',
      available: '24/7',
      languages: ['English', 'Hindi'],
      cost: 'Free'
    }
  ],
  uk: [
    {
      name: 'Samaritans',
      phone: '116 123',
      textOption: null,
      chat: 'https://www.samaritans.org/how-we-can-help/contact-samaritan/',
      description: 'Confidential emotional support for anyone in distress',
      available: '24/7',
      languages: ['English', 'Welsh'],
      cost: 'Free'
    },
    {
      name: 'Mind Infoline',
      phone: '0300 123 3393',
      textOption: null,
      chat: 'https://www.mind.org.uk/information-support/helplines/',
      description: 'Mental health information and signposting service',
      available: 'Mon-Fri 9am-6pm',
      languages: ['English'],
      cost: 'Free'
    }
  ],
  australia: [
    {
      name: 'Lifeline',
      phone: '13 11 14',
      textOption: 'Text 0477 13 11 14',
      chat: 'https://www.lifeline.org.au/get-help/online-crisis-support/chat-to-a-crisis-supporter/',
      description: 'Crisis support and suicide prevention services',
      available: '24/7',
      languages: ['English'],
      cost: 'Free'
    },
    {
      name: 'Beyond Blue',
      phone: '1300 22 4636',
      textOption: null,
      chat: 'https://www.beyondblue.org.au/get-support/get-immediate-support',
      description: 'Anxiety, depression, and suicide prevention support',
      available: '24/7',
      languages: ['English'],
      cost: 'Free'
    }
  ],
  global: [
    {
      name: 'International Association for Suicide Prevention',
      phone: null,
      textOption: null,
      chat: 'https://www.iasp.info/resources/Crisis_Centres/',
      description: 'Directory of crisis centers worldwide',
      available: 'varies',
      languages: ['Multiple'],
      cost: 'Free'
    },
    {
      name: 'Befrienders Worldwide',
      phone: null,
      textOption: null,
      chat: 'https://www.befrienders.org/find-a-helpline',
      description: 'Emotional support across 32 countries',
      available: 'varies',
      languages: ['Multiple'],
      cost: 'Free'
    }
  ]
};

const ONLINE_THERAPY = [
  {
    name: 'BetterHelp',
    url: 'https://www.betterhelp.com',
    description: 'Largest online therapy platform with licensed therapists',
    costRange: '$60-$100/week',
    type: 'Professional Therapy'
  },
  {
    name: 'Talkspace',
    url: 'https://www.talkspace.com',
    description: 'Text, audio, and video therapy with licensed therapists',
    costRange: '$65-$100/week',
    type: 'Professional Therapy'
  },
  {
    name: '7 Cups',
    url: 'https://www.7cups.com',
    description: 'Free peer support with trained listeners; also has therapists',
    costRange: 'Free (peer) / Paid (therapy)',
    type: 'Peer Support + Therapy'
  },
  {
    name: 'Open Path Collective',
    url: 'https://openpathcollective.org',
    description: 'Affordable in-person and online therapy',
    costRange: '$30-$80/session',
    type: 'Professional Therapy'
  },
  {
    name: 'NAMI Find a Support Group',
    url: 'https://www.nami.org/Support-Education/Support-Groups',
    description: 'Free peer support groups nationwide',
    costRange: 'Free',
    type: 'Peer Support'
  }
];

const MINDFULNESS_APPS = [
  { name: 'Headspace', url: 'https://www.headspace.com', cost: 'Free trial / Paid', focus: 'Meditation & Mindfulness' },
  { name: 'Calm', url: 'https://www.calm.com', cost: 'Free trial / Paid', focus: 'Sleep, Anxiety, Meditation' },
  { name: 'Insight Timer', url: 'https://insighttimer.com', cost: 'Free (most content)', focus: 'Guided Meditation' },
  { name: 'Woebot', url: 'https://woebothealth.com', cost: 'Free', focus: 'CBT-based mental health support' },
  { name: 'Wysa', url: 'https://www.wysa.io', cost: 'Free / Paid', focus: 'AI mental health support' },
  { name: 'MoodKit', url: 'https://www.thriveport.com/products/moodkit/', cost: 'Paid', focus: 'CBT mood improvement' }
];

/**
 * Get helplines by country/region
 */
function getHelplines(country = 'us') {
  const key = country.toLowerCase();
  return HELPLINES[key] || HELPLINES.global;
}

/**
 * Get crisis helplines (always immediate)
 */
function getCrisisHelplines() {
  return {
    international: HELPLINES.global,
    us: HELPLINES.us.slice(0, 2),
    india: HELPLINES.india.slice(0, 2),
    uk: HELPLINES.uk.slice(0, 1),
    australia: HELPLINES.australia.slice(0, 1)
  };
}

/**
 * Get all online therapy options
 */
function getOnlineTherapyOptions() {
  return ONLINE_THERAPY;
}

/**
 * Get mindfulness apps
 */
function getMindfulnessApps() {
  return MINDFULNESS_APPS;
}

/**
 * Smart resource recommendation based on risk level and user needs
 */
function getSmartRecommendations(riskLevel, needs = []) {
  const recommendations = { immediate: [], therapy: [], selfHelp: [] };

  if (riskLevel === 'critical' || riskLevel === 'high') {
    recommendations.immediate = [
      { type: 'crisis_hotline', resource: HELPLINES.us[0] },
      { type: 'crisis_text', resource: HELPLINES.us[1] }
    ];
  }

  if (riskLevel !== 'none') {
    recommendations.therapy = ONLINE_THERAPY.slice(0, 3);
  }

  recommendations.selfHelp = MINDFULNESS_APPS.filter(app => app.cost.includes('Free')).slice(0, 3);

  return recommendations;
}

module.exports = {
  getHelplines,
  getCrisisHelplines,
  getOnlineTherapyOptions,
  getMindfulnessApps,
  getSmartRecommendations,
  HELPLINES,
  ONLINE_THERAPY,
  MINDFULNESS_APPS
};
