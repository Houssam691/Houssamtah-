import type { Dict } from '~/content/types';
import { chrome } from '~/content/en/chrome';
import { home } from '~/content/en/home';
import { services } from '~/content/en/services';
import { work } from '~/content/en/work';
import { process } from '~/content/en/process';
import { pricing } from '~/content/en/pricing';
import { about } from '~/content/en/about';
import { contact } from '~/content/en/contact';
import { faq } from '~/content/en/faq';
import { blog, legal } from '~/content/en/blog';

/**
 * English dictionary — complete translation of the French reference content.
 * Section files mirror each other one to one.
 */
export const en: Dict = {
  ...chrome,
  home,
  services,
  work,
  process,
  pricing,
  about,
  contact,
  faq,
  blog,
  legal,
};