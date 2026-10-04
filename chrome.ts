import type { Dict } from '~/content/types';

/** Interface chrome: brand, navigation, footer, SEO defaults. */
export const chrome = {
  brand: {
    name: 'Vitrine Studio',
    a11yHome: 'Back to home',
  },

  common: {
    skipToContent: 'Skip to main content',
    loading: 'Loading',
    copy: 'Copy',
    copied: 'Copied to clipboard',
    copyFailed: 'Copy failed — please select the text manually.',
    close: 'Close',
    menu: 'Menu',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    theme: 'Theme',
    themeDark: 'Dark',
    themeLight: 'Light',
    toggleTheme: 'Switch theme',
    backToTop: 'Back to top',
    demoBadge: 'Demonstration project',
    notFoundTitle: 'This page does not exist (any more)',
    notFoundBody: 'The link may be outdated. Here are the pages that really exist.',
    backHome: 'Back to home',
    externalLink: 'opens in a new tab',
  },

  nav: {
    items: [
      { label: 'Services', href: '/services' },
      { label: 'Work', href: '/work' },
      { label: 'Method', href: '/process' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'About', href: '/about' },
      { label: 'FAQ', href: '/faq' },
    ],
    cta: 'Start a project',
    ariaLabel: 'Main navigation',
  },

  footer: {
    tagline: 'Custom websites, applications and automation.',
    navigation: 'Navigation',
    services: 'Services',
    contact: 'Contact',
    legal: 'Legal information',
    location: 'Location',
    remoteNote: 'Remote-first studio, small team.',
    rights: 'All rights reserved.',
    hosting: 'Hosting',
  },

  stickyCta: {
    label: 'Start a project',
    ariaLabel: 'Start a project — contact',
  },

  seo: {
    home: {
      title: 'Custom websites, applications and automation',
      description:
        'A web development and automation studio: showcase sites, e-commerce, business apps, automated workflows and AI integration. The code is yours.',
    },
    services: {
      title: 'Services',
      description:
        'Six services: custom websites, business applications, process automation, AI-powered automation, redesign and performance, hosting and support.',
    },
    service: {
      title: 'Service',
      description:
        'Who it is for, what is included, how we work, deliverables, timeline and frequently asked questions.',
    },
    work: {
      title: 'Work',
      description:
        'Clearly labelled demonstration projects built in-house to illustrate our method, plus reserved slots for future real client work.',
    },
    caseStudy: {
      title: 'Case study',
      description:
        'Details of a demonstration project: context, what was built, technical decisions and limits.',
    },
    process: {
      title: 'Method',
      description:
        'From discovery to launch: seven stages, what we need from you, what you receive, and who owns the code and the domain.',
    },
    pricing: {
      title: 'Pricing and engagement',
      description:
        'Three engagement models — fixed-price project, monthly retainer, on-demand hourly — with payment terms still to be confirmed.',
    },
    about: {
      title: 'About',
      description:
        'An independent, remote-first web development studio building custom projects. Our values, our standards and our honest use of AI.',
    },
    contact: {
      title: 'Contact',
      description:
        'Describe your project in a few lines: email address, phone, booking link and a brief template you can copy.',
    },
    faq: {
      title: 'Frequently asked questions',
      description:
        'Twelve questions about scope, timelines, pricing, code ownership, maintenance, hosting, security and languages.',
    },
    blog: {
      title: 'Journal',
      description: 'Technical notes and project documentation. Section disabled by default.',
    },
    post: {
      title: 'Article',
      description: 'Technical note from the studio.',
    },
    mentions: {
      title: 'Legal notice',
      description:
        'Legal notice: publishing entity, hosting provider, publication director and registration information.',
    },
    privacy: {
      title: 'Privacy policy',
      description:
        'What this website collects: nothing automatically, and only the emails you send us.',
    },
    cgv: {
      title: 'Terms of sale',
      description: 'Structure for terms of sale, to be completed with a legal professional.',
    },
    notFound: {
      title: 'Page not found',
      description: 'The page you requested does not exist or has moved.',
    },
  },
} satisfies Pick<Dict, 'brand' | 'common' | 'nav' | 'footer' | 'stickyCta' | 'seo'>;