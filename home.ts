import type { Dict } from '~/content/types';

/** Home page copy. */
export const home = {
  hero: {
    eyebrow: 'Web development and automation studio',
    title: 'Websites and applications',
    titleAccent: 'built to your requirements.',
    subtitle:
      'We design and build custom websites, business applications and automation solutions. Whatever the project, we build it to your requirements: no imposed template, no unnecessary jargon.',
    primaryCta: 'Start a project',
    secondaryCta: 'See our services',
    note: 'First conversation, no commitment. Response time: within 24 business hours.',
    scrollHint: 'Scroll',
  },

  valueProp:
    'One point of contact from brief to launch, a schedule agreed before we start, and code that stays yours.',

  services: {
    eyebrow: 'What we do',
    title: 'Six services, one requirement: custom work.',
    body: 'We do not apply a single recipe. Every project starts with your constraints, and the rest follows.',
    cta: 'See the service details',
  },

  howWeWork: {
    eyebrow: 'How we work',
    title: 'Four steps, always the same ones.',
    body: 'The method does not change, even when the project does. It keeps you informed without drowning you in detail.',
    steps: [
      {
        title: 'Discovery',
        body: "One or more conversations to understand your business, your users and what is in the way today. No quote based on a hunch.",
      },
      {
        title: 'Scoping',
        body: 'We write a scope: what is included, what is not, the schedule and the price. You approve it before any code is written.',
      },
      {
        title: 'Delivery',
        body: 'Design then development, in short cycles. You see the progress and you decide when it matters.',
      },
      {
        title: 'Launch and support',
        body: 'Testing, release, handover. Then maintenance, fixes and improvements, if you want them.',
      },
    ],
    cta: 'See the full method',
  },

  selectedWork: {
    eyebrow: 'Work',
    title: 'Demonstrations, not invented clients.',
    body: "We have no real client work to show yet. Instead of inventing a portfolio, we built three demonstration projects to show concretely how we work.",
    cta: 'See the demonstration projects',
    notice:
      'Everything below is an internal concept. No client, brand or commercial result is represented.',
  },

  stack: {
    eyebrow: 'Tooling',
    title: 'The tech stack, spelled out.',
    body: 'We choose the technology based on the project, never the other way around. Here is what we use most often, without claiming exclusivity or certification.',
  },

  whyUs: {
    eyebrow: 'Why work with us',
    title: 'Five points, all verifiable.',
    body: 'No impossible promises. Here is what we actually commit to.',
    points: [
      {
        title: 'Custom, not off the shelf',
        body: 'We do not start from an existing theme: we write what your project needs, including when nothing equivalent exists.',
      },
      {
        title: 'Clear communication',
        body: 'One point of contact, regular written progress updates, and explanations in your own language.',
      },
      {
        title: 'Schedules that hold',
        body: 'The schedule is agreed during scoping, with dependencies identified. If a feature has to be dropped, we say so beforehand.',
      },
      {
        title: 'A transparent process',
        body: 'You know where the project stands, which decisions were made and what is still waiting for you.',
      },
      {
        title: 'The code and the domain stay yours',
        body: 'Delivery in your repositories, on your accounts, with the domain registered in your name. You can walk away with everything.',
      },
    ],
  },

  faqTeaser: {
    eyebrow: 'Frequently asked questions',
    title: 'The questions we are asked most.',
    body: 'Twelve straight answers about timelines, prices, code ownership and maintenance. If yours is not there, write to us.',
    cta: 'See the 12 questions',
  },

  ctaBand: {
    title: 'Let us talk about your project.',
    body: 'Tell us what you want to build and what is blocking you. You will get a first honest opinion, with no commitment.',
    primary: 'Start a project',
    secondary: 'Send an email',
  },
} satisfies Dict['home'];