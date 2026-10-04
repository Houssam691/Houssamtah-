import type { Dict } from '~/content/types';

/** Process page: the seven stages, expectations, deliverables, ownership. */
export const process = {
  eyebrow: 'Method',
  title: 'How a project runs',
  intro:
    'Seven stages, from the first conversation to launch and support. This page describes what we do, what we need from you and what you receive at the end.',

  stagesTitle: 'The seven stages',
  stages: [
    {
      index: '01',
      title: 'Discovery',
      body: 'One or more interviews with the people involved. We work to understand the business, the users, the real constraints and what is missing today.',
      duration: '[TIMELINE TO CONFIRM]',
      client: 'Your involvement: one or two interviews',
      outputs: ['Discovery report', 'List of constraints', 'Measurable objectives'],
    },
    {
      index: '02',
      title: 'Proposal',
      body: 'We write a scope: what is included, what is not, the schedule, the price and the assumptions. Nothing starts before your written agreement.',
      duration: '[TIMELINE TO CONFIRM]',
      client: 'Your involvement: review and approval',
      outputs: ['Detailed proposal', 'Quote', 'Proposed schedule'],
    },
    {
      index: '03',
      title: 'Design',
      body: 'Page architecture first, then high-fidelity mock-ups of the key screens. We iterate until the interface feels like yours.',
      duration: '[TIMELINE TO CONFIRM]',
      client: 'Your involvement: feedback on mock-ups',
      outputs: ['Approved mock-ups', 'Component system', 'Interface design'],
    },
    {
      index: '04',
      title: 'Development',
      body: 'Coding in short cycles, with regular checkpoints. Technical decisions are documented as we go.',
      duration: '[TIMELINE TO CONFIRM]',
      client: 'Your involvement: availability for decisions',
      outputs: ['Versioned code', 'Staging environment', 'Technical documentation'],
    },
    {
      index: '05',
      title: 'Testing',
      body: 'Functional, cross-browser, cross-device, accessibility and performance testing. Fixes are part of the scope.',
      duration: '[TIMELINE TO CONFIRM]',
      client: 'Your involvement: functional acceptance',
      outputs: ['Test report', 'Issues resolved', 'Fixes applied'],
    },
    {
      index: '06',
      title: 'Launch',
      body: 'Deployment, redirects, verification of forms and payment methods, then handover with your team.',
      duration: '[TIMELINE TO CONFIRM]',
      client: 'Your involvement: final approval',
      outputs: ['Website live', 'Handover plan', 'Transferred access'],
    },
    {
      index: '07',
      title: 'Support',
      body: 'After launch: fixes, questions and improvements if the contract includes them. Support is optional and never hidden in the price.',
      duration: '[TIMELINE TO CONFIRM]',
      client: 'Your involvement: feedback from real use',
      outputs: ['Fixes', 'Periodic review', 'Improvement proposals'],
    },
  ],

  clientNeeds: {
    title: 'What we need from you',
    body: 'A project also moves thanks to the client. Here is what lets us hold the announced schedule.',
    items: [
      'One identified point of contact, available for decisions',
      'Prompt feedback on mock-ups and submitted items',
      'Content (text, images, data) by the agreed date',
      'The access we need: hosting, domain name, third-party tools',
      'Written approval of each milestone',
    ],
  },

  clientReceives: {
    title: 'What you receive at the end',
    body: 'None of these items is an extra: they are part of the project.',
    items: [
      'The website or application, live at your address',
      'The complete versioned source code, in your repository',
      'Administration access, transferred to your account',
      'Documentation: handover, technical notes, procedures',
      'Design files and source assets',
      'A handover point if you want to continue with us, or with someone else',
    ],
  },

  ownership: {
    title: 'Ownership of the code and the domain',
    body: 'It is a legitimate question, and the answer is simple: it is yours.',
    items: [
      'The domain is registered in your name, with whichever registrar you choose',
      'The source code is transferred to a repository you own',
      'Credentials are handed over through a shared password manager [TO CONFIRM]',
      'Third-party licences are documented, and flagged when they commit you',
      'If we stop working together, the transition is documented and unconditional',
    ],
  },

  cadence: {
    title: 'Communication and rhythm',
    body: 'The rhythm is agreed during scoping and can be adjusted later. Nothing should surprise you.',
    items: [
      'A progress update at a fixed frequency, short and written [TO CONFIRM]',
      'One discussion channel per project',
      'A visible task board with tasks, decisions and approvals',
      'A single point of contact, with no hand-over mid-project [TO CONFIRM]',
    ],
  },

  revisions: {
    title: 'Revision policy',
    body: 'The number of review rounds included in each stage is defined during scoping and stated in the proposal. Beyond that, each additional iteration is charged at the current rate [TO CONFIRM]. We prefer saying it early rather than discovering it on an invoice.',
  },

  faqTitle: 'Questions about the method',
  faq: [
    {
      q: 'Can you work with our internal team?',
      a: 'Yes. We combine our work with yours or with a contractor, and we document enough so that nobody is blocked [TO CONFIRM depending on the project].',
    },
    {
      q: 'What happens if the project changes along the way?',
      a: 'That is normal. Changes are quoted and prioritised against what was planned. We never commit a change without your agreement.',
    },
    {
      q: 'Who stays available after delivery?',
      a: 'Support is an option: a monthly plan or on-demand work. You can also take the project to someone else, since you have the whole codebase.',
    },
    {
      q: 'Do you work with clients outside your country?',
      a: 'Yes. The studio works remotely: everything is written, which limits misunderstandings and time zone friction [TO CONFIRM depending on the client time zone].',
    },
  ],

  cta: {
    title: 'Every project starts with a conversation',
    body: 'Tell us what you want to build. We will tell you honestly whether it is within our scope.',
    primary: 'Start a project',
  },
} satisfies Dict['process'];