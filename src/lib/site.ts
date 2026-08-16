export const SITE = {
  name: 'Fletcher Davis',
  title: 'Making complex systems a little less complex',
  description:
    'Field notes from the intersection of security, engineering, design, and research.',
  email: 'fletcher@arklink.io',
} as const;

export const PROFILE = {
  tagline: 'Co-Founder & CEO @ ArkLink',
  links: {
    x: 'https://x.com/gymR4T',
    linkedin: 'https://www.linkedin.com/in/fletcher-davis',
    arklink: 'https://arklink.io',
    beyondTrust: 'https://www.beyondtrust.com/',
    btPhantomLabs: 'https://www.linkedin.com/company/beyondtrust-phantom-labs',
    crowdStrike: 'https://www.crowdstrike.com/',
    mandiant: 'https://cloud.google.com/security/mandiant',
  },
} as const;

export function withBase(path = '') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return `${base}/${cleanPath}` || '/';
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
