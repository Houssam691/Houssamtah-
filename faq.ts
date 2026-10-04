import type { Dict } from '~/content/types';

/** FAQ page: twelve questions, grouped by category. */
export const faq = {
  eyebrow: 'Frequently asked questions',
  title: 'Twelve questions, twelve straight answers',
  intro:
    'What we are asked most often, with concrete answers. If your question is not here, the door is open.',

  categories: [
    { id: 'scope', label: 'Scope' },
    { id: 'timeline', label: 'Timelines' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'ownership', label: 'Ownership and code' },
    { id: 'care', label: 'Maintenance and hosting' },
    { id: 'security', label: 'Security and data' },
    { id: 'languages', label: 'Languages and accessibility' },
    { id: 'communication', label: 'Communication and revisions' },
  ],

  items: [
    {
      q: 'What kind of projects do you take on?',
      a: 'Websites, business applications, automation and redesigns. We are not tied to an industry: what matters is the technical complexity and whether the project interests us.',
    },
    {
      q: 'How long does a project take?',
      a: 'It depends entirely on the scope. The timeline is set after scoping and written into the proposal, with dependencies identified. No timeline is announced before the project is understood.',
    },
    {
      q: 'How does pricing work?',
      a: 'Three models exist: fixed-price project, monthly retainer, hourly on-demand. The model is chosen with you, and the price is always written in a quote before work starts.',
    },
    {
      q: 'Do I own the code and the domain?',
      a: 'Yes, without exception. The code is delivered in your repositories, the domain is registered in your name, and access is transferred to you. You can leave with the project at any time.',
    },
    {
      q: 'What happens after launch?',
      a: 'You can entrust maintenance to us as a monthly plan, or handle it yourself: documentation, code and access are there for that. Support is optional and transparent.',
    },
    {
      q: 'Do you handle hosting?',
      a: 'Yes, if you want us to, with hosting chosen according to the project. You can also use your own host: in that case we give you everything to run it.',
    },
    {
      q: 'How do you handle security and data?',
      a: 'HTTPS by default, security headers, secrets out of the repository, backups and logging of sensitive actions. This website uses no cookie and no tracking. The framework for a client project is agreed at kick-off.',
    },
    {
      q: 'Do you offer multilingual websites?',
      a: 'Yes. We deliver multilingual sites with correct reading directions, including right-to-left. The site you are reading is an example.',
    },
    {
      q: 'How does communication work during the project?',
      a: 'One point of contact, one discussion channel per project, regular written progress updates, and a task board tracking work and decisions.',
    },
    {
      q: 'How many revisions are included?',
      a: 'The number of review rounds per stage is defined during scoping and stated in the proposal. Beyond that, each additional iteration is quoted before it is committed.',
    },
    {
      q: 'How does a project start?',
      a: 'With a discovery conversation, then a written proposal. Work only starts after your written agreement on scope, price and schedule.',
    },
    {
      q: 'What happens to my data?',
      a: 'It stays yours. We do not use personal data for tracking: this website sets no cookie and loads no third-party analytics. Exchanges happen by email, under your control.',
    },
  ],

  contactTitle: 'A question that is not listed?',
  contactBody: 'Write to us directly. An honest answer is worth more than a page of answers.',
  contactCta: 'Write to us',
} satisfies Dict['faq'];