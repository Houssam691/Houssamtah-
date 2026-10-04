import type { Dict } from '~/content/types';

/**
 * Portfolio.
 *
 * There is no real client work yet: every entry in `demos` is a demonstration
 * project and must keep its `isDemo: true` flag and its notice.
 */
export const work = {
  eyebrow: 'Work',
  title: 'Work and demonstration projects',
  intro:
    'We only publish what is true. At this point we have no completed client project to present: the three projects below are demonstrations built in-house to show how we work.',

  disclaimerTitle: 'Please read this before browsing the demos',
  disclaimerBody:
    'These projects are not real engagements. The companies, products and screens are fictional. No commercial result, sales figure or testimonial is presented as real.',

  slotsTitle: 'Reserved slots',
  slotsBody:
    'These slots will hold future real projects, with your agreement. No client is named before the contract is signed.',

  demos: [
    {
      slug: 'sample-business-site',
      isDemo: true,
      mockup: 'business',
      title: 'Business website and store',
      subtitle: 'Editorial showcase and purchase journey, for a fictional independent shop',
      badge: 'Concept',
      summary:
        'A showcase for a fictional independent producer: editorial home page, product page, cart and checkout, to show how a page can convince and sell at once.',
      brief: {
        title: 'The need',
        body: 'An independent producer wants a website that tells the story of the products and allows direct orders, without going through a marketplace. Imaginary constraint: everything must work on a slow phone, with simple publishing for the person selling.',
      },
      build: {
        title: 'What was built',
        items: [
          'Editorial home page with a product selection',
          'Category page with filters',
          'Product page with variants and stock',
          'Side cart and three-step checkout',
          'Order management screens',
          'English and Arabic versions with correct reading directions',
        ],
      },
      decisions: {
        title: 'Technical decisions',
        items: [
          'Static rendering for speed, content from a single versioned file',
          'Styles written as utilities, no external stylesheet',
          'Dependency-free forms: the flow works without a third-party service',
          'Images optimised to AVIF and WebP, lazy loaded',
        ],
      },
      stack: ['TypeScript', 'Astro', 'Tailwind CSS', 'AVIF / WebP', 'WCAG 2.2 AA'],
      notice: {
        title: 'What this project is not',
        body: 'The name, the shop and the products are fictional. No sales figure, conversion rate or client result is shown: this project never served a real business.',
      },
      timeline: {
        label: 'Project duration',
        value: 'Demonstration built over one to two weeks.',
      },
    },
    {
      slug: 'sample-booking-flow',
      isDemo: true,
      mockup: 'booking',
      title: 'Booking flow',
      subtitle: 'Online appointment booking, for a fictional service provider',
      badge: 'Concept',
      summary:
        'A complete booking journey: choosing the service, the day and the time slot, then confirmation. It shows how we remove steps when the goal is to get in touch.',
      brief: {
        title: 'The need',
        body: 'A service provider receives many appointment requests by phone and message, with incomplete information. The journey has to collect the essentials in under a minute.',
      },
      build: {
        title: 'What was built',
        items: [
          'Service and duration selection',
          'Availability calendar with computed slots',
          'Short form: contact details, preferences, notes',
          'Summary confirmation page',
          'Appointment reminder',
          'Keyboard navigation and screen reader announcements',
        ],
      },
      decisions: {
        title: 'Technical decisions',
        items: [
          'No sign-up: the whole journey fits on one page',
          'Fields limited to the strict minimum, with explicit labels',
          'Visible focus states and verified contrast',
          'Submission works fully without JavaScript',
        ],
      },
      stack: ['TypeScript', 'Astro', 'Tailwind CSS', 'HTML forms', 'ARIA'],
      notice: {
        title: 'What this project is not',
        body: 'No real provider uses this journey. The availability slots are generated for the demonstration and match no diary.',
      },
      timeline: {
        label: 'Project duration',
        value: 'Demonstration built over a few days.',
      },
    },
    {
      slug: 'sample-automation-dashboard',
      isDemo: true,
      mockup: 'automation',
      title: 'Automation dashboard',
      subtitle: 'Workflow monitoring for a fictional operations team',
      badge: 'Concept',
      summary:
        'An internal interface for tracking automated workflows: states, failures, queue and manual recovery, to show how an automation stays observable.',
      brief: {
        title: 'The need',
        body: 'An operations team wants to automate part of its processing but refuses a black box. It needs to see what ran, what failed and what is waiting for a human.',
      },
      build: {
        title: 'What was built',
        items: [
          'Overview per workflow: volume, failure rate, duration',
          'Queue of items waiting for manual recovery',
          'Detailed log with error code and timestamp',
          'Filtering by period and by state',
          'Log export',
          'Empty, error and loading states',
        ],
      },
      decisions: {
        title: 'Technical decisions',
        items: [
          'Demonstration data generated locally, no external service',
          'Tables readable by keyboard, with associated headers',
          'Status colours always paired with a text label',
          'Right-to-left interface tested',
        ],
      },
      stack: ['TypeScript', 'Astro', 'Tailwind CSS', 'Local data', 'RTL i18n'],
      notice: {
        title: 'What this project is not',
        body: 'The figures shown are made up for the demonstration. No client sees their data in this tool, and no real authentication is implemented.',
      },
      timeline: {
        label: 'Project duration',
        value: 'Demonstration built over a few days.',
      },
    },
  ],

  slots: [
    {
      title: 'First client mission',
      body: 'Slot reserved for a first real project: sector, problem, delivered scope and client feedback — with their written agreement.',
    },
    {
      title: 'Redesign or optimisation',
      body: 'Slot reserved for a redesign or performance project, with before and after measurements.',
    },
    {
      title: 'Automation',
      body: 'Slot reserved for an automation project, once publication authorisations are obtained.',
    },
  ],

  demoNoticeTitle: 'Demonstration project / concept',
  demoNoticeBody:
    'This project was built by the studio for demonstration purposes. It does not correspond to any client and does not claim to represent any result.',

  indexTitle: 'Index',
  demoBannerTitle: 'Nothing here is a client',
  demoBannerBody:
    'The three projects below are internal concepts, clearly labelled. The remaining slots are reserved for future real projects.',
  overview: 'In short',
  brief: 'The need',
  build: 'What was built',
  decisions: 'Technical decisions',
  stack: 'Stack',
  noticeTitle: 'What this project is not',
  timelineLabel: 'Project duration',
  visitLabel: 'Open the demonstration project',
  backLabel: 'Back to work',
  relatedTitle: 'Other demonstrations',
  ctaTitle: 'Want the same level of care for your project?',
  ctaBody: 'These demonstrations show a method. A real project starts with a conversation about your context.',
  ctaPrimary: 'Start a project',
} satisfies Dict['work'];