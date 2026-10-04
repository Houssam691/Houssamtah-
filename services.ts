import type { Dict } from '~/content/types';

/** Services index: six service pages, each fully described. */
export const services = {
  eyebrow: 'Services',
  title: 'What we build',
  intro:
    'We do not tie our services to a particular industry. The same technical tools serve a practice, a workshop, an association or a product team: only the scope changes.',

  items: [
    {
      slug: 'custom-websites',
      index: '01',
      title: 'Custom websites',
      short:
        'Showcase sites, e-commerce and landing pages designed and built for your project instead of applied from a theme.',
      icon: 'window',
      audience: {
        title: 'Who it is for',
        body: 'For you who need to exist online in a way that looks like you: a clear identity, pages that get to the point, and a website that does not look like your competitors.',
        points: [
          'You have no website, or one that no longer represents you',
          'You sell online and your store does not fit your constraints',
          'You need a landing page for one precise offer',
          'You want a fast, accessible and easy to maintain website',
        ],
      },
      included: {
        title: 'What is included',
        items: [
          'Page architecture and content plan',
          'High-fidelity interface design, validated screen by screen',
          'Responsive, mobile-first development, with content management',
          'Forms, transactional email and management screens',
          'Payment provider integration',
          'Technical SEO: structure, metadata, performance, accessibility',
        ],
      },
      how: {
        title: 'How we work',
        steps: [
          {
            title: 'Scoping workshop',
            body: 'Goals, available content, technical constraints and budget. Nothing is decided in a hurry.',
          },
          {
            title: 'Design',
            body: 'Mock-ups of the key screens, reusable components, iterations until approved.',
          },
          {
            title: 'Development',
            body: 'Integration of screens, content, forms and a back office if needed.',
          },
          {
            title: 'Testing and launch',
            body: 'Mobile and desktop testing, fixes, release, then handover.',
          },
        ],
      },
      deliverables: {
        title: 'Deliverables',
        items: [
          'High-fidelity design files',
          'Complete, versioned source code',
          'Website live on your hosting',
          'User documentation',
          'List of content to maintain',
        ],
      },
      timeline: {
        label: 'Typical timeline',
        value:
          'Agreed after scoping, depending on the number of pages and design depth.',
      },
      faq: [
        {
          q: 'Can you start from an existing theme?',
          a: 'Yes, when the project allows it. The theme is then a starting point, and we replace the structure, the design and whatever does not fit. If your project is highly specific, we write the site from scratch.',
        },
        {
          q: 'Will the website be optimised for search engines?',
          a: 'We handle technical SEO: heading structure, metadata, structured data, performance and accessibility. Content writing and link building are out of scope unless agreed explicitly.',
        },
        {
          q: 'Can you take over an existing website?',
          a: 'Yes, after a short audit that establishes what can be reused, what must be rebuilt and what should be dropped. That assessment is part of the scoping.',
        },
      ],
      cta: {
        title: 'A website that really looks like you',
        body: 'Describe your business and what the website has to do. We will tell you what is feasible and in which order.',
      },
      keywords: ['custom showcase website', 'e-commerce website', 'landing page', 'web development'],
    },

    {
      slug: 'web-apps',
      index: '02',
      title: 'Web applications and internal tools',
      short:
        'Back offices, client portals and business tools: applications that actually do the work.',
      icon: 'terminal',
      audience: {
        title: 'Who it is for',
        body: "For teams who work today with spreadsheets, email and shared files, and who have reached the limit of those tools.",
        points: [
          'You manage business data across scattered spreadsheets',
          'Your teams lose time on repetitive tasks',
          'You want a client space or a supplier portal',
          'You want a database that belongs to you',
        ],
      },
      included: {
        title: 'What is included',
        items: [
          'Analysis of the existing business process and its friction points',
          'Data model and application architecture',
          'Web interface with roles and access rights',
          'Integration with your existing tools',
          'Action logging and audit trail',
          'Documentation, source code and transfer of access',
        ],
      },
      how: {
        title: 'How we work',
        steps: [
          {
            title: 'Understanding the business',
            body: 'We speak with the people who do the work, not only with management, and we observe the process as it really is.',
          },
          {
            title: 'Prototype',
            body: 'A functional prototype of the critical screens and journeys, tested on concrete cases.',
          },
          {
            title: 'Development',
            body: 'Database, business rules, interface, security and tests on the essential journeys.',
          },
          {
            title: 'Deployment and handover',
            body: 'Production release, handover with your team, fixes and adjustments after real use.',
          },
        ],
      },
      deliverables: {
        title: 'Deliverables',
        items: [
          'Functional specification',
          'Validated prototype',
          'Live application with its database',
          'Administrator account and procedure documentation',
          'Source code and deployment scripts',
        ],
      },
      timeline: {
        label: 'Typical timeline',
        value:
          'Agreed after scoping, depending on the number of roles and business rules.',
      },
      faq: [
        {
          q: 'Can the application evolve later?',
          a: 'Yes, provided it is built properly: documented architecture, versioned database migrations and handed over code. A support phase for future changes can be planned.',
        },
        {
          q: 'Who hosts and maintains the application?',
          a: 'That is decided together: hosting and support by us, or hosting with a provider of your choice. Either way you remain the owner of the code and the data.',
        },
        {
          q: 'Do you handle sensitive data?',
          a: 'Yes, with precautions: encrypted traffic, access control, logging and backups. The right data processing setup is agreed with you before we start.',
        },
      ],
      cta: {
        title: 'A tool that does the actual work',
        body: 'Describe your current process. We will tell you what can be automated and what must stay human.',
      },
      keywords: ['business web application', 'internal tool', 'custom back office', 'client portal'],
    },

    {
      slug: 'automation',
      index: '03',
      title: 'Business process automation',
      short:
        'Your repetitive tasks turned into reliable, observable and maintainable workflows.',
      icon: 'flow',
      audience: {
        title: 'Who it is for',
        body: "For any team that moves information from one tool to another by hand, and pays for that lost time in errors and delays.",
        points: [
          'Information typed again and again between tools',
          'Reminders, follow-ups and approvals done by hand',
          'Files moving around by email',
          'Processes that stop when someone is away',
        ],
      },
      included: {
        title: 'What is included',
        items: [
          'Process mapping and list of steps that can be automated',
          'Choice of the automation architecture',
          'Workflows, quality checks and error handling',
          'Notifications, logging and alerts',
          'Workflow documentation and manual fallback procedures',
          'Training for the people who use them',
        ],
      },
      how: {
        title: 'How we work',
        steps: [
          {
            title: 'Observation',
            body: 'We describe the process as it is actually practised, including the undocumented shortcuts.',
          },
          {
            title: 'Prioritisation',
            body: 'We rank the steps by time saved and by risk reduction, and we start there.',
          },
          {
            title: 'Build',
            body: 'One workflow at a time, with a manual fallback until the solution is approved.',
          },
          {
            title: 'Adoption',
            body: 'Training, documentation, measuring the time saved, and adjustments after a few weeks of use.',
          },
        ],
      },
      deliverables: {
        title: 'Deliverables',
        items: [
          'Before and after process mapping',
          'Automation workflows in production',
          'Monitoring dashboard',
          'Documentation and manual fallback procedures',
          'Code and configurations handed over',
        ],
      },
      timeline: {
        label: 'Typical timeline',
        value:
          'Usually progressive, one workflow at a time, to limit risk.',
      },
      faq: [
        {
          q: 'Will we have to change tools?',
          a: 'Not necessarily. We first look at what can be automated with the tools you already use. A change is only proposed when the benefit is clear and quantified.',
        },
        {
          q: 'What happens when an automation fails?',
          a: 'Every workflow is designed with explicit error handling: an alert, a manual fallback task and an incident log. An automation must be able to fail cleanly.',
        },
        {
          q: 'Can we adjust the workflows ourselves?',
          a: 'Yes, if the rules are clearly documented. We provide the configuration files and training suited to your team.',
        },
      ],
      cta: {
        title: 'Stop typing the same thing three times',
        body: 'Describe a task you do every day. We will tell you whether it can be automated and what it changes.',
      },
      keywords: ['process automation', 'workflow', 'tool integration', 'scripting'],
    },

    {
      slug: 'ai-automation',
      index: '04',
      title: 'AI-powered automation',
      short:
        'Assistants, document processing and intelligence inside your workflows, with mandatory human review.',
      icon: 'spark',
      audience: {
        title: 'Who it is for',
        body: 'For teams that handle a lot of unstructured text — requests, quotes, invoices, contracts — and want to save time without losing control.',
        points: [
          'You answer requests that are similar but never identical',
          'You type information in from documents',
          'You look for an answer in your internal documentation',
          'You want an assistant built into your website or your tools',
        ],
      },
      included: {
        title: 'What is included',
        items: [
          'Definition of the use case and its success criteria',
          'Model choice and hosting model',
          'Document processing: extraction, classification, formatting',
          'Integration with existing tools through APIs',
          'Safeguards: human validation, logging, manual fallback',
          'Documentation of what the system does, and what it does not do',
        ],
      },
      how: {
        title: 'How we work',
        steps: [
          {
            title: 'Prudent scoping',
            body: 'We start with one precise, measurable use case, never with the idea of putting AI everywhere.',
          },
          {
            title: 'Evaluated prototype',
            body: 'Evaluation on a real sample of documents or requests, with written acceptance criteria.',
          },
          {
            title: 'Integration',
            body: 'Connection to the existing tools, with mandatory human validation on sensitive actions.',
          },
          {
            title: 'Monitoring',
            body: 'Measuring the gap between the system output and the expected result, then adjusting.',
          },
        ],
      },
      deliverables: {
        title: 'Deliverables',
        items: [
          'Documented use case and success criteria',
          'Prototype evaluated on real data',
          'Production integration with safeguards',
          'Usage and validation policy',
          'Code, configurations and secrets kept out of the repository',
        ],
      },
      timeline: {
        label: 'Typical timeline',
        value:
          'Depends on the level of integration and the confidentiality framework.',
      },
      faq: [
        {
          q: 'Is the data used to train a model?',
          a: "By default, no: we choose configurations that do not use submitted data for training. The exact framework depends on the provider selected and must be validated with you before launch.",
        },
        {
          q: 'Do we have to trust the output?',
          a: 'No. We design the workflows so that the output stays a proposal: a person approves before any action that involves your business. Errors are expected and handled as such.',
        },
        {
          q: 'What if AI is not the answer?',
          a: 'Then it is not the answer, and we will say so. A well-designed workflow without AI is often better than a workflow patched together with AI. We flag it when the benefit does not match the cost.',
        },
      ],
      cta: {
        title: 'Where AI genuinely helps',
        body: 'Explain a painful, repetitive task. We will tell you whether AI is the right answer, or whether a simple script is enough.',
      },
      keywords: ['AI automation', 'document processing', 'custom assistant', 'AI workflow'],
    },

    {
      slug: 'redesign-performance',
      index: '05',
      title: 'Redesign and performance',
      short:
        'Rebuild what exists and make it fast, accessible and maintainable, without breaking everything on the way.',
      icon: 'gauge',
      audience: {
        title: 'Who it is for',
        body: 'For you who have a live website that does not deliver: slow, heavy, hard to update, exhausting to maintain.',
        points: [
          'Your website is slow or does not update properly',
          'The back office has become unusable',
          'You inherited a website nobody understands',
          'You want a more modern look without rebuilding everything',
        ],
      },
      included: {
        title: 'What is included',
        items: [
          'Technical, performance and accessibility audit',
          'Diagnosis: what can be reused, what must be rebuilt',
          'Visual and technical redesign',
          'Optimisation of images, fonts, scripts and the critical path',
          'Removal of obsolete code and technical debt',
          'Planned migration, with a rollback plan',
        ],
      },
      how: {
        title: 'How we work',
        steps: [
          {
            title: 'Audit',
            body: 'Real measurements, not intentions: speed, page weight, errors, accessibility, technical debt.',
          },
          {
            title: 'Decisions',
            body: 'Three scenarios — fix, redesign, start over — with the consequences of each.',
          },
          {
            title: 'Redesign',
            body: 'Work in stages, with a staging environment so you can compare before and after.',
          },
          {
            title: 'Switchover',
            body: 'Migration plan, redirects, checks, then support after the switch.',
          },
        ],
      },
      deliverables: {
        title: 'Deliverables',
        items: [
          'Written audit with measurements',
          'Redesign plan and schedule',
          'Redesigned website, live',
          'Redirect and migration plan',
          'Maintenance documentation',
        ],
      },
      timeline: {
        label: 'Typical timeline',
        value:
          'Agreed after scoping, depending on the size of the site and the number of items to migrate.',
      },
      faq: [
        {
          q: 'Do we have to rebuild the whole website?',
          a: 'Not necessarily. The audit exists precisely to establish what can be salvaged. Fixing only what causes problems remains a legitimate option, often the cheapest one.',
        },
        {
          q: 'Does the site stay online during the redesign?',
          a: 'Yes. We develop in a separate environment and switch over on an agreed date, with a rollback plan if needed.',
        },
        {
          q: 'What exactly do you measure?',
          a: 'Page weight, load time, rendering stability, your host logs and accessibility issues. Every figure comes from a reproducible measurement.',
        },
      ],
      cta: {
        title: 'A website that delivers what it promises',
        body: 'Send us the address. You will get an honest opinion on what is blocking you and what can wait.',
      },
      keywords: ['website redesign', 'performance optimisation', 'accessibility', 'migration'],
    },

    {
      slug: 'hosting-support',
      index: '06',
      title: 'Hosting, maintenance and support',
      short: 'A website that stays online: monitored hosting, backups, updates and support.',
      icon: 'server',
      audience: {
        title: 'Who it is for',
        body: "For you who have a website that has to work all the time, without the time or the team to watch it.",
        points: [
          'Your site sits on unmonitored shared hosting',
          'You have nobody to call when a page goes down',
          'Backups exist, somewhere',
          'You want a team that knows your code',
        ],
      },
      included: {
        title: 'What is included',
        items: [
          'Hosting choice based on the project',
          'TLS certificate, server configuration and hardening',
          'Regular backups and tested restoration',
          'Security updates and monitoring',
          'Small fixes and small improvements included in the plan',
          'A periodic review with your point of contact',
        ],
      },
      how: {
        title: 'How we work',
        steps: [
          {
            title: 'Takeover',
            body: 'Audit of the existing setup, transfer of the domain and access, verification of backups.',
          },
          {
            title: 'Set-up',
            body: 'Server, certificate, backup and monitoring configuration.',
          },
          {
            title: 'Monitoring',
            body: 'Incident alerts, controlled updates, log of every intervention.',
          },
          {
            title: 'Improvements',
            body: 'Fixes and improvements within the plan, with a trace of what was done.',
          },
        ],
      },
      deliverables: {
        title: 'Deliverables',
        items: [
          'Website live on hosting configured by us',
          'Documented backup and restoration procedure',
          'Intervention log',
          'Access and documentation transferred to your account',
        ],
      },
      timeline: {
        label: 'Time to service',
        value: 'Depends on the hosting type and the migration.',
      },
      faq: [
        {
          q: 'Can you take over a website you did not build?',
          a: 'Yes, after an audit that checks the quality of the existing code, the available access and whether usable backups exist. We tell you clearly whether we can take over or whether a restart is needed.',
        },
        {
          q: 'Who owns the hosting and the domain?',
          a: 'You, always. The domain is registered in your name and the hosting sits on your account, or on an account created for you and administered by you. We never hold an account in our own name to keep hold of a project.',
        },
        {
          q: 'What does support cover?',
          a: 'Incidents, bug fixes and the small requests listed in the plan. Structural changes are quoted separately. The exact terms are defined in the contract.',
        },
      ],
      cta: {
        title: 'A website that is looked after, not abandoned',
        body: 'Tell us what you host today. We will tell you what holds up and what does not.',
      },
      keywords: ['web hosting', 'website maintenance', 'backups', 'technical support'],
    },
  ],

  ctaBand: {
    title: 'Is one of these services your project?',
    body: 'Sometimes the right answer is a mix of several. Tell us about it, we will build the scope.',
    primary: 'Start a project',
    secondary: 'See the method',
  },

  audienceTitle: 'Who it is for',
  includedTitle: 'What is included',
  howTitle: 'How we work',
  deliverablesTitle: 'Deliverables',
  timelineTitle: 'Timeline',
  faqTitle: 'Frequently asked questions',
  otherServices: 'Other services',
  relatedTitle: 'Related services',
  emptyTitle: 'This service is not available in this language yet.',
} satisfies Dict['services'];