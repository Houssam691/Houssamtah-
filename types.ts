/**
 * ===========================================================================
 * CONTENT TYPES
 * ---------------------------------------------------------------------------
 * These interfaces define the shape of every content file in
 * `src/content/en/` — chrome, home, services, work, process, pricing, about,
 * contact, faq, blog and legal.
 *
 * To edit copy, change the text in those files. No other file needs to be
 * touched. A new language means copying this folder and adding one entry to
 * `locales` in `src/i18n/index.ts`.
 * ===========================================================================
 */

export type Locale = 'en';

export interface Seo {
  /** Page title. Written as "Title — Brand" in the layout. */
  title: string;
  /** Meta description, 120–160 characters is ideal. */
  description: string;
}

export interface NavItem {
  label: string;
  /** Path without locale prefix, e.g. '/services'. */
  href: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface IconName {
  code: string;
  /** Translation key resolved to a `CodeIcon.astro` variant. */
  icon:
    | 'window'
    | 'terminal'
    | 'flow'
    | 'spark'
    | 'gauge'
    | 'server'
    | 'shield'
    | 'layers'
    | 'cursor'
    | 'nodes'
    | 'mail'
    | 'phone'
    | 'calendar'
    | 'check'
    | 'arrow';
}

export interface Service {
  slug: string;
  /** Two-digit display index, e.g. "01". */
  index: string;
  title: string;
  /** Short summary used on cards and in the home grid. */
  short: string;
  icon: IconName['icon'];
  /** Who the service is for. */
  audience: {
    title: string;
    body: string;
    points: string[];
  };
  /** What is included. */
  included: {
    title: string;
    items: string[];
  };
  /** How it works. */
  how: {
    title: string;
    steps: { title: string; body: string }[];
  };
  /** Deliverables. */
  deliverables: {
    title: string;
    items: string[];
  };
  /** Typical timeline. Marked TO CONFIRM until validated. */
  timeline: {
    label: string;
    value: string;
  };
  faq: FaqItem[];
  cta: {
    title: string;
    body: string;
  };
  /** Plain-text list used for Service JSON-LD. */
  keywords: string[];
}

export interface DemoWork {
  slug: string;
  /** Always true for now: no real client work is published yet. */
  isDemo: boolean;
  /** Which real mini-mockup to render. */
  mockup: 'business' | 'booking' | 'automation';
  title: string;
  subtitle: string;
  /** Short badge shown on cards: "Concept", "Demo". */
  badge: string;
  summary: string;
  /** The fictional brief this mockup answers. */
  brief: { title: string; body: string };
  build: { title: string; items: string[] };
  decisions: { title: string; items: string[] };
  stack: string[];
  /** Explicit "what this is / is not" note. */
  notice: { title: string; body: string };
  /** Placeholder for a future real case study. */
  timeline: { label: string; value: string };
}

export interface WorkSlot {
  title: string;
  body: string;
}

export interface PricingModel {
  id: string;
  name: string;
  tagline: string;
  priceLabel: string;
  priceNote: string;
  bestFor: string;
  includes: string[];
  cadence: string;
  featured: boolean;
}

export interface About {
  story: { title: string; body: string[] };
  values: { title: string; body: string }[];
  wayOfWorking: { title: string; body: string }[];
  standards: { title: string; body: string; items: { label: string; detail: string }[] };
  ai: { title: string; body: string[]; notice: string; review: string };
  team: { title: string; body: string; slots: { role: string; name?: string }[] };
}

export interface ContactBriefField {
  key: string;
  label: string;
  hint: string;
}

export interface Dict {
  /* --- Global chrome ------------------------------------------------- */
  brand: {
    name: string;
    a11yHome: string;
  };
  common: {
    skipToContent: string;
    loading: string;
    copy: string;
    copied: string;
    copyFailed: string;
    close: string;
    menu: string;
    openMenu: string;
    closeMenu: string;
    theme: string;
    themeDark: string;
    themeLight: string;
    toggleTheme: string;
    backToTop: string;
    demoBadge: string;
    notFoundTitle: string;
    notFoundBody: string;
    backHome: string;
    externalLink: string;
  };
  nav: {
    items: NavItem[];
    cta: string;
    ariaLabel: string;
  };
  footer: {
    tagline: string;
    navigation: string;
    services: string;
    contact: string;
    legal: string;
    location: string;
    remoteNote: string;
    rights: string;
    hosting: string;
  };
  stickyCta: {
    label: string;
    ariaLabel: string;
  };

  /* --- Page-level SEO ------------------------------------------------ */
  seo: Record<'home' | 'services' | 'service' | 'work' | 'caseStudy' | 'process' | 'pricing' | 'about' | 'contact' | 'faq' | 'blog' | 'post' | 'mentions' | 'privacy' | 'cgv' | 'notFound', Seo>;

  /* --- Home ----------------------------------------------------------- */
  home: {
    hero: {
      eyebrow: string;
      title: string;
      titleAccent: string;
      subtitle: string;
      primaryCta: string;
      secondaryCta: string;
      note: string;
      scrollHint: string;
    };
    valueProp: string;
    services: {
      eyebrow: string;
      title: string;
      body: string;
      cta: string;
    };
    howWeWork: {
      eyebrow: string;
      title: string;
      body: string;
      steps: { title: string; body: string }[];
      cta: string;
    };
    selectedWork: {
      eyebrow: string;
      title: string;
      body: string;
      cta: string;
      notice: string;
    };
    stack: {
      eyebrow: string;
      title: string;
      body: string;
    };
    whyUs: {
      eyebrow: string;
      title: string;
      body: string;
      points: { title: string; body: string }[];
    };
    faqTeaser: {
      eyebrow: string;
      title: string;
      body: string;
      cta: string;
    };
    ctaBand: {
      title: string;
      body: string;
      primary: string;
      secondary: string;
    };
  };

  /* --- Services ------------------------------------------------------- */
  services: {
    eyebrow: string;
    title: string;
    intro: string;
    items: Service[];
    ctaBand: { title: string; body: string; primary: string; secondary: string };
    audienceTitle: string;
    includedTitle: string;
    howTitle: string;
    deliverablesTitle: string;
    timelineTitle: string;
    faqTitle: string;
    otherServices: string;
    relatedTitle: string;
    emptyTitle: string;
  };

  /* --- Work ----------------------------------------------------------- */
  work: {
    eyebrow: string;
    title: string;
    intro: string;
    disclaimerTitle: string;
    disclaimerBody: string;
    slotsTitle: string;
    slotsBody: string;
    /**
     * Demonstration projects. There is no real client work yet: every entry
     * must keep `isDemo: true` and keep its demo notice.
     * A real case study is added by copying an entry, setting `isDemo: false`
     * (and removing the notice) — see README.md.
     */
    demos: DemoWork[];
    /** Reserved slots for future real client work. */
    slots: WorkSlot[];
    demoNoticeTitle: string;
    demoNoticeBody: string;
    indexTitle: string;
    demoBannerTitle: string;
    demoBannerBody: string;
    overview: string;
    brief: string;
    build: string;
    decisions: string;
    stack: string;
    noticeTitle: string;
    timelineLabel: string;
    visitLabel: string;
    backLabel: string;
    relatedTitle: string;
    ctaTitle: string;
    ctaBody: string;
    ctaPrimary: string;
  };

  /* --- Process -------------------------------------------------------- */
  process: {
    eyebrow: string;
    title: string;
    intro: string;
    stagesTitle: string;
    stages: { index: string; title: string; body: string; duration: string; client: string; outputs: string[] }[];
    clientNeeds: { title: string; body: string; items: string[] };
    clientReceives: { title: string; body: string; items: string[] };
    ownership: { title: string; body: string; items: string[] };
    cadence: { title: string; body: string; items: string[] };
    revisions: { title: string; body: string };
    faqTitle: string;
    faq: FaqItem[];
    cta: { title: string; body: string; primary: string };
  };

  /* --- Pricing -------------------------------------------------------- */
  pricing: {
    eyebrow: string;
    title: string;
    intro: string;
    disclaimer: string;
    models: PricingModel[];
    compareTitle: string;
    compareBody: string;
    compare: { criterion: string; fixed: string; retainer: string; hourly: string }[];
    termsTitle: string;
    terms: { title: string; body: string }[];
    termsNotice: string;
    faqTitle: string;
    faq: FaqItem[];
    cta: { title: string; body: string; primary: string };
  };

  /* --- About ---------------------------------------------------------- */
  about: {
    eyebrow: string;
    title: string;
    intro: string;
    story: About['story'];
    valuesTitle: string;
    values: About['values'];
    workingTitle: string;
    working: About['wayOfWorking'];
    standards: About['standards'];
    ai: About['ai'];
    team: About['team'];
    cta: { title: string; body: string; primary: string };
  };

  /* --- Contact -------------------------------------------------------- */
  contact: {
    eyebrow: string;
    title: string;
    intro: string;
    channelsTitle: string;
    emailLabel: string;
    phoneLabel: string;
    bookingLabel: string;
    responseTitle: string;
    responseBody: string;
    briefTitle: string;
    briefBody: string;
    briefSubject: string;
    briefFields: ContactBriefField[];
    briefSubmit: string;
    briefFallback: string;
    briefCopy: string;
    briefCopied: string;
    formTitle: string;
    formNote: string;
    availabilityNote: string;
    faqTitle: string;
    faq: FaqItem[];
  };

  /* --- FAQ ------------------------------------------------------------ */
  faq: {
    eyebrow: string;
    title: string;
    intro: string;
    categories: { id: string; label: string }[];
    items: FaqItem[];
    contactTitle: string;
    contactBody: string;
    contactCta: string;
  };

  /* --- Blog (optional, off by default) -------------------------------- */
  blog: {
    eyebrow: string;
    title: string;
    intro: string;
    offNotice: string;
    postsTitle: string;
    posts: { slug: string; title: string; date: string; excerpt: string; status: string }[];
    readMore: string;
  };

  /* --- Legal ---------------------------------------------------------- */
  legal: {
    updated: string;
    mentions: { title: string; intro: string; sections: { h: string; p?: string; list?: string[] }[] };
    privacy: { title: string; intro: string; sections: { h: string; p?: string; list?: string[] }[] };
    cgv: { title: string; intro: string; notice: string; sections: { h: string; p?: string; list?: string[] }[] };
  };
}