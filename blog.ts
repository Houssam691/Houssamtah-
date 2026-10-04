import type { Dict } from '~/content/types';
import { site } from '~/config/site';

/** Blog section: structure only, off by default. */
export const blog = {
  eyebrow: 'Journal',
  title: 'Technical notes',
  intro:
    'A space meant to document our methods and technical decisions. The section is disabled by default: nothing is published yet.',

  offNotice:
    'This section is disabled. The structure and files are ready, but no article is published.',

  postsTitle: 'Articles',
  posts: [
    {
      slug: 'placeholder-post',
      title: 'Demonstration article',
      date: '2026-01-15',
      excerpt:
        'A demonstration article showing how the blog is structured. Real content will be written and reviewed before publication.',
      status: 'Draft — not published',
    },
  ],

  readMore: 'Read the article',
} satisfies Dict['blog'];

/** Legal pages: legal notice, privacy policy, terms of sale. */
export const legal = {
  updated: 'Last updated: January 2026',

  mentions: {
    title: 'Legal notice',
    intro:
      'This website is published by Vitrine Studio, registered as a self-employed business (auto-entrepreneur).',
    sections: [
      {
        h: 'Website publisher',
        list: [
          `Trading name: ${site.legalName}`,
          `Legal form: ${site.legalForm}`,
          `Registered address: ${[site.address.street, site.address.postalCode, site.address.city, site.address.country].filter(Boolean).join(', ')}`,
          `Registration number: ${site.registrationNumber}`,
          `Publication director: ${site.publicationDirector}`,
          `Contact: ${site.email} — ${site.phone}`,
        ],
      },
      {
        h: 'Hosting provider',
        list: [
          `Company: ${site.host.provider}`,
          `Address: ${site.host.address}`,
          `Contact: ${site.host.contact}`,
        ],
      },
      {
        h: 'Intellectual property',
        p: 'All content on this website (texts, graphic elements, demonstration code) is protected. Any reproduction without prior written authorisation is prohibited.',
      },
      {
        h: 'Liability',
        p: 'The studio takes care to provide accurate information. Demonstration projects are explicitly fictional and do not constitute a contractual or commercial reference.',
      },
      {
        h: 'Reporting content',
        p: `To report an error or content you consider unlawful, write to ${site.email}. Your request will be examined.`,
      },
    ],
  },

  privacy: {
    title: 'Privacy policy',
    intro:
      'This website is built to collect nothing. This page explains exactly what happens when you write to us.',
    sections: [
      {
        h: 'No automatic collection',
        p: 'This website sets no cookie, loads no analytics tool and uses no third-party tracking service. No personal data is therefore collected when you visit.',
      },
      {
        h: 'What we receive',
        p: 'When you write to us, we only receive what you choose to send: your email address, your name if you provide it, and the content of your message.',
      },
      {
        h: 'How information is used',
        list: [
          'Answering your request',
          'Preparing a quote or proposal if the project moves forward',
          'Keeping the history of the commercial relationship',
        ],
      },
      {
        h: 'Retention',
        p: 'Correspondence is kept for the duration of the commercial relationship, then archived for the statutory retention period of business documents.',
      },
      {
        h: 'Your rights',
        p: `Under applicable regulations, you have the right to access, rectify and delete your data. Send your request to ${site.email}.`,
      },
      {
        h: 'Cookies and trackers',
        p: "This website sets no cookie. The only thing stored in your browser is your theme and language choice: it stays on your device and is never sent to a server.",
      },
      {
        h: 'Hosting outside the European Union',
        p: 'This website is hosted outside the European Union. Anything you send us by e-mail passes through your own mail provider: how long it is kept depends on that provider and on your own policy.',
      },
    ],
  },

  cgv: {
    title: 'Terms of sale',
    intro:
      'Structure for terms of sale, to be completed with a legal professional before any sale.',
    notice:
      'This document is a working structure. It is not an enforceable legal document and must be reviewed by a legal professional before any commercial use.',
    sections: [
      { h: 'Purpose and scope' },
      { h: 'Services' },
      { h: 'Quotes, prices and payment terms' },
      { h: 'Delivery deadlines' },
      { h: 'Client obligations' },
      { h: 'Intellectual property and assignment of rights' },
      { h: 'Warranties' },
      { h: 'Liability' },
      { h: 'Acceptance and sign-off' },
      { h: 'Support and maintenance' },
      { h: 'Termination' },
      { h: 'Personal data' },
      { h: 'Governing law and disputes' },
      { h: 'Consumer mediation' },
    ],
  },
} satisfies Dict['legal'];