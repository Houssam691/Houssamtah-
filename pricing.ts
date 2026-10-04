import type { Dict } from '~/content/types';

/** Pricing page: three engagement models, comparison, payment terms. */
export const pricing = {
  eyebrow: 'Pricing and engagement',
  title: 'Three ways to work together',
  intro:
    'We do not publish a standard price grid: a fair price depends on the scope. What follows describes three engagement models and what you get in each.',

  disclaimer:
    'No price is displayed until the scope is agreed. You receive a written quote before any commitment.',

  models: [
    {
      id: 'fixed',
      name: 'Fixed-price project',
      tagline: 'A written scope, a price, a date.',
      priceLabel: 'On quote',
      priceNote: 'Set after scoping, itemised.',
      bestFor:
        'Well-defined projects: showcase website, store, scoped internal tool, redesign.',
      includes: [
        'Scope, schedule and price agreed before work starts',
        'Design, development, testing and launch included',
        'Review rounds defined for each stage',
        'Source code and documentation delivered',
        'One point of contact for the whole duration',
      ],
      cadence: 'Payment per approved milestone.',
      featured: true,
    },
    {
      id: 'retainer',
      name: 'Monthly retainer',
      tagline: 'A volume of hours each month, with no bad surprises.',
      priceLabel: 'On quote',
      priceNote: 'Volume agreed each month, overruns handled in advance.',
      bestFor:
        'Continuous maintenance, iterative improvements, supporting an internal team.',
      includes: [
        'A volume of hours or days agreed each month',
        'Maintenance, security fixes and small improvements',
        'Joint prioritisation of your requests',
        'Periodic review and written report',
        'Monthly renewal, cancellable',
      ],
      cadence: 'Monthly invoicing, with no term commitment.',
      featured: false,
    },
    {
      id: 'hourly',
      name: 'Hourly, on demand',
      tagline: 'The right format for an occasional need.',
      priceLabel: 'On quote',
      priceNote: 'Hourly rate agreed and confirmed before each intervention.',
      bestFor: 'Emergencies, technical advice, audits, scoping or one-off work.',
      includes: [
        'Billed on time spent, agreed in advance',
        'No commitment period',
        'Priority in the schedule',
        'Written report after each intervention',
        'You can stop whenever you want',
      ],
      cadence: 'Per intervention, with no commitment.',
      featured: false,
    },
  ],

  compareTitle: 'Comparison',
  compareBody: 'The same project may fit one model or another. Scoping decides.',
  compare: [
    {
      criterion: 'Scope',
      fixed: 'Defined and frozen at the start',
      retainer: 'Evolving, prioritised together',
      hourly: 'Defined per intervention',
    },
    {
      criterion: 'Price',
      fixed: 'Global, known in advance',
      retainer: 'Monthly fee',
      hourly: 'Based on time spent',
    },
    {
      criterion: 'Adaptation',
      fixed: 'Possible, quoted beforehand',
      retainer: 'Natural',
      hourly: 'Possible, quoted beforehand',
    },
    {
      criterion: 'Code ownership',
      fixed: 'Full, on delivery',
      retainer: 'Full, at any time',
      hourly: 'Full, project by project',
    },
    {
      criterion: 'Follow-up',
      fixed: 'Progress updates',
      retainer: 'Continuous plus periodic review',
      hourly: 'Per intervention',
    },
    {
      criterion: 'For whom',
      fixed: 'A project starting out',
      retainer: 'A site already in production',
      hourly: 'An emergency or advice',
    },
  ],

  termsTitle: 'Payment terms',
  terms: [
    {
      title: 'Deposit',
      body: 'A deposit is requested at the start to reserve the production slot. The amount is stated in the contract.',
    },
    {
      title: 'Milestones',
      body: 'Payment is split into milestones matching the method stages: scoping, design, development, launch. The split is stated in the contract.',
    },
    {
      title: 'Final payment',
      body: 'The balance is due on launch, after acceptance.',
    },
    {
      title: 'Payment terms',
      body: 'Payment deadlines and any late penalties are defined in the contract.',
    },
    {
      title: 'Invoicing',
      body: 'Currency, VAT and mandatory statements are specified in the service contract.',
    },
  ],
  termsNotice:
    'This section is deliberately incomplete: payment terms must be defined with a legal professional and included in the contract before any invoice is issued.',

  faqTitle: 'Pricing questions',
  faq: [
    {
      q: 'How is the price calculated?',
      a: 'From the scope, the number of screens, the required integrations and the desired schedule. You receive a written quote, item by item, before work starts.',
    },
    {
      q: 'Can you guarantee a final price?',
      a: 'Only if the scope is frozen. As soon as a project evolves, we tell you and quote the change before committing to it.',
    },
    {
      q: 'Do you offer discounts on long projects?',
      a: 'Terms are discussed case by case, with no public grid: what matters is consistency between the budget and the scope.',
    },
    {
      q: 'Can you work without a deposit?',
      a: 'The deposit lets us reserve the schedule. Without a deposit, the project is scheduled after agreement.',
    },
  ],

  cta: {
    title: 'Price is not the first point',
    body: 'The first point is to know whether the project is feasible and how it will be built. Let us talk.',
    primary: 'Request a quote',
  },
} satisfies Dict['pricing'];