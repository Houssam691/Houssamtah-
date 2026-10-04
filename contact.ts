import type { Dict } from '~/content/types';

/** Contact page: channels, structured brief, form behaviour, FAQ. */
export const contact = {
  eyebrow: 'Contact',
  title: 'Let us talk about your project',
  intro:
    'The most efficient thing is to describe your need in a few lines. Write freely, or use the brief template below.',

  channelsTitle: 'How to reach us',
  emailLabel: 'Email',
  phoneLabel: 'Phone',
  bookingLabel: 'Book a call',

  responseTitle: 'Response time',
  responseBody:
    'We usually reply within 24 business hours. If your request is urgent, say so in the subject line.',

  briefTitle: 'Brief template',
  briefBody:
    'Copy this template, fill it in and send it by email. A free-form message works just as well: we read both the same way.',

  briefSubject: 'Your name or organisation — type of project',

  briefFields: [
    { key: 'name', label: 'Your name and organisation', hint: 'Name, organisation, role.' },
    { key: 'goal', label: 'What you want to achieve', hint: 'One or two sentences, no jargon.' },
    { key: 'context', label: 'Why now', hint: 'What changed, or what is blocking you today.' },
    { key: 'features', label: 'Expected features', hint: 'What is essential, what would be nice.' },
    { key: 'constraints', label: 'Technical constraints', hint: 'Existing hosting, tools used, confidentiality requirements, or “none”.' },
    { key: 'deadline', label: 'Desired deadline', hint: 'Target date and why.' },
    { key: 'budget', label: 'Expected budget', hint: 'A range, or “to be defined together”.' },
    { key: 'reach', label: 'How to reach you', hint: 'Email, phone, preferred hours.' },
  ],

  briefSubmit: 'Open in my email app',
  briefFallback:
    'If your email app does not open, copy the brief below and send it straight to our email address.',
  briefCopy: 'Copy the brief',
  briefCopied: 'Brief copied to clipboard',

  formTitle: 'Write directly',
  formNote:
    'This website has no server: the form prepares an email in your own mail app. Your data is neither stored nor analysed here.',
  availabilityNote:
    'The number of projects accepted is deliberately limited: every engagement is planned to stay human-sized.',

  faqTitle: 'Before you write',
  faq: [
    {
      q: 'What should I prepare?',
      a: 'Three things are enough: what you want to achieve, why now, and a deadline if you have one. The rest is built together.',
    },
    {
      q: 'Do you answer every request?',
      a: 'We read everything, but we cannot accept every project. If we are not the right studio for you, we will say so.',
    },
    {
      q: 'Can I send documents?',
      a: 'Yes, by email, stating what they contain. For sensitive information, tell us your confidentiality constraints before sending anything.',
    },
  ],
} satisfies Dict['contact'];