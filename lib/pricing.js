export const plans = {
  basic: {
    id: 'basic',
    name: 'Basic',
    priceAed: 39,
    title: 'CV Rewrite',
    description: 'Improved resume rewrite with sharper bullets and a cleaner structure.',
    features: [
      'Improved professional summary',
      'Stronger achievement bullets',
      'Cleaner formatting suggestions',
      'Download improved CV text instantly',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceAed: 79,
    title: 'CV + Cover Letter',
    description: 'Best for job seekers who want a full application package.',
    features: [
      'Everything in Basic',
      'Targeted cover letter',
      'ATS keyword alignment',
      'Priority generation flow',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    priceAed: 149,
    title: 'Full Career Pack',
    description: 'The strongest offer for Gulf job seekers and career switchers.',
    features: [
      'Everything in Pro',
      'LinkedIn About section',
      'ATS improvement report',
      'Job-targeting recommendations',
    ],
  },
};

export function getPlan(planId) {
  return plans[planId] || null;
}
