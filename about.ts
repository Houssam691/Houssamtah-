import type { Dict } from '~/content/types';

/** About page: story, values, way of working, standards, AI, team. */
export const about = {
  eyebrow: 'About',
  title: 'A studio, not a website factory',
  intro:
    'Vitrine Studio is an independent web development studio building custom projects for clients whose needs do not fit a standard model.',

  story: {
    title: 'Our story',
    body: [
      'The studio started from a simple observation: too many projects are built on standard solutions that do not match the real need. A website has to be right first, then fast and polished. Not the other way round.',
      'We work small and remotely, which lets us focus on the project rather than on structure. There is no intermediary layer between you and the person writing the code.',
      'We prefer saying what we do not do over promising more widely. If a project is outside our scope, we point you to someone more useful.',
    ],
  },

  valuesTitle: 'Our values',
  values: [
    {
      title: 'Custom work as a principle',
      body: 'If a solution already exists as a product, we will tell you. But when your project has no equivalent, it has no shortcut.',
    },
    {
      title: 'Telling the truth about timelines',
      body: 'We prefer announcing a realistic schedule and dropping a feature over turning down a project. Bad news costs more than good news.',
    },
    {
      title: 'Technical transparency',
      body: 'The code is readable, documented and versioned. If you have a technical team, they should be able to take over. That is a goal, not a magic promise.',
    },
    {
      title: 'The client owns everything',
      body: 'The domain, the code and the data belong to you. We never use that position to create a dependency.',
    },
  ],

  workingTitle: 'How we work',
  working: [
    {
      title: 'Written before anything else',
      body: 'A written scope is worth more than a verbal agreement. Every structural decision goes through a document you keep.',
    },
    {
      title: 'Short cycles',
      body: 'We work in short cycles with regular checkpoints, rather than one long phase with no visibility.',
    },
    {
      title: 'Quality is measured',
      body: 'Performance, accessibility and security are not options: they are part of the acceptance criteria.',
    },
    {
      title: 'Documentation is a deliverable',
      body: 'A project without documentation is a project that costs you more six months later.',
    },
  ],

  standards: {
    title: 'Our technical standards',
    body: 'Whatever the project, these are the requirements we set ourselves. They are verifiable, not rhetorical.',
    items: [
      {
        label: 'Performance',
        detail:
          'Page weight and image budget, monitored navigation metrics, optimised images, self-hosted fonts.',
      },
      {
        label: 'Accessibility',
        detail:
          'Verified contrast, visible focus, full keyboard navigation, semantic landmarks, WCAG 2.2 AA.',
      },
      {
        label: 'Security',
        detail:
          'HTTPS, security headers, secrets kept out of the repository, maintained dependencies, backups and logging.',
      },
      {
        label: 'Maintainability',
        detail:
          'TypeScript, documented code, readable commits, tests on critical journeys, transferable code.',
      },
    ],
  },

  ai: {
    title: 'AI in our method, not in our place',
    body: [
      "We use AI tools to save time on what does not require judgement: exploring options, writing repetitive code, reviewing an implementation, structuring a document. The gain is real, and we own it.",
      "What we do not do is let an AI output decide for you. The specification, the architecture, the design choices and the final review are human decisions, taken and signed by us.",
      'We tell you when and how AI is involved in a project, because that changes how the result should be read: fast text is not validated text.',
    ],
    notice:
      "No AI output is published without a human review. When an AI tool is involved in a project, we state it in the proposal before starting.",
    review:
      'Anything produced with an AI tool is reviewed, tested and corrected before delivery. No output is published as is.',
  },

  team: {
    title: 'The team',
    body: 'The studio is deliberately small and works remotely. The number of people involved depends on the project; we publish neither headcount nor years of experience.',
    slots: [{ role: 'Founder, direction and main point of contact', name: '' }],
  },

  cta: {
    title: 'Shall we talk?',
    body: 'If the project sounds like you, the simplest thing is to write to us. A twenty-minute conversation is often enough to know whether we are the right studio.',
    primary: 'Write to us',
  },
} satisfies Dict['about'];