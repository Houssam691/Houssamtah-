/**
 * ===========================================================================
 * SITE BEHAVIOUR — one small vanilla module, no framework, no library.
 * ---------------------------------------------------------------------------
 * Everything here is progressive enhancement: with JavaScript disabled the
 * navigation, the theme and the contact e-mail address all keep working.
 *
 *   - sticky header state
 *   - mobile menu
 *   - theme switch (persisted in localStorage, no cookie)
 *   - scroll reveals
 *   - magnetic buttons
 *   - accessible tabs
 *   - copy to clipboard + toasts
 *   - back to top
 *   - contact brief → mailto
 * ===========================================================================
 */

const THEME_KEY = 'vitrine:theme';

/**
 * Every listener goes through `listen()`, so re-running `init()` — which
 * happens on `pageshow` after a bfcache restore — replaces the previous set
 * instead of stacking a second one on top. Without it a single click on the
 * theme switch ran its handler twice and cancelled itself out.
 */
let bindings = new AbortController();

function listen<E extends Event>(
  target: EventTarget,
  type: string,
  handler: (event: E) => void,
  options: AddEventListenerOptions = {},
): void {
  target.addEventListener(type, handler as EventListener, {
    ...options,
    signal: bindings.signal,
  });
}

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==========================================================================
   THEME
   ========================================================================== */

/**
 * Reflects the current theme on every switch, for `aria-pressed`.
 * Single source of truth so the two switches (desktop, mobile) never disagree.
 */
function syncThemeSwitch(): void {
  const isDark = document.documentElement.dataset.theme !== 'light';
  document
    .querySelectorAll<HTMLElement>('[data-theme-switch]')
    .forEach((toggle) => toggle.setAttribute('aria-pressed', String(isDark)));
}

function initTheme(): void {
  /* `theme-boot.js` already picked the theme before first paint: adopt it. */
  syncThemeSwitch();

  document.querySelectorAll<HTMLElement>('[data-theme-switch]').forEach((toggle) => {
    listen<MouseEvent>(toggle, 'click', () => {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* storage unavailable: the choice simply is not remembered */
      }
    });
  });
}

/** Single place that writes the theme, so the attribute and the tokens agree. */
function applyTheme(theme: 'light' | 'dark'): void {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle('scheme-dark', theme === 'dark');
  root.classList.toggle('scheme-light', theme === 'light');
  root.style.colorScheme = theme;

  syncThemeSwitch();

  /* The browser UI tint follows the choice instead of the OS preference. */
  const background = getComputedStyle(root).getPropertyValue('--bg').trim();
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta && background) meta.content = background;
}

/* ==========================================================================
   HEADER + MOBILE MENU
   ========================================================================== */

function initHeader(): void {
  const header = document.querySelector<HTMLElement>('#site-header');
  if (!header) return;

  const sync = () => {
    header.dataset.scrolled = String(window.scrollY > 12);
  };

  sync();
  listen<Event>(window, 'scroll', sync, { passive: true });
}

function initMenu(): void {
  const toggle = document.querySelector<HTMLElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('#mobile-menu');
  if (!toggle || !menu) return;

  const labelOpen = toggle.getAttribute('aria-label') ?? '';
  const labelClose = menu.dataset.labelClose ?? labelOpen;

  const icons = toggle.querySelectorAll<SVGElement>('[data-icon]');
  const setOpen = (open: boolean) => {
    menu.dataset.open = String(open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? labelClose : labelOpen);
    icons.forEach((icon) => {
      icon.classList.toggle('hidden', icon.dataset.icon !== (open ? 'close' : 'open'));
    });
    document.documentElement.style.overflow = open ? 'hidden' : '';
  };

  setOpen(false);

  listen<MouseEvent>(toggle, 'click', () => {
    setOpen(menu.dataset.open !== 'true');
  });

  listen<MouseEvent>(menu, 'click', (event) => {
    if ((event.target as HTMLElement).closest('a')) setOpen(false);
  });

  listen<KeyboardEvent>(document, 'keydown', (event) => {
    if (event.key === 'Escape' && menu.dataset.open === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  listen<UIEvent>(window, 'resize', () => {
    if (window.innerWidth >= 1024) setOpen(false);
  });
}

/* ==========================================================================
   SCROLL REVEALS
   ========================================================================== */

function initReveals(): void {
  const items = document.querySelectorAll<HTMLElement>('.reveal:not([data-revealed="true"])');
  if (!items.length) return;

  if (reducedMotion() || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.setAttribute('data-revealed', 'true'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute('data-revealed', 'true');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
  );

  revealObservers.push(observer);
  items.forEach((item) => observer.observe(item));
}

const revealObservers: IntersectionObserver[] = [];

function releaseObservers(): void {
  while (revealObservers.length) revealObservers.pop()?.disconnect();
}

/* ==========================================================================
   MAGNETIC BUTTONS
   ========================================================================== */

function initMagnetic(): void {
  if (reducedMotion() || window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll<HTMLElement>('.magnetic').forEach((element) => {
    let frame = 0;

    const move = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.18;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.28;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        element.style.setProperty('--mx', `${x.toFixed(2)}px`);
        element.style.setProperty('--my', `${y.toFixed(2)}px`);
      });
    };

    const reset = () => {
      element.dataset.magnetic = 'false';
      element.style.setProperty('--mx', '0px');
      element.style.setProperty('--my', '0px');
    };

    element.dataset.magnetic = 'active';
    listen<PointerEvent>(element, 'pointermove', move);
    listen<PointerEvent>(element, 'pointerleave', reset);
    listen<FocusEvent>(element, 'blur', reset);
  });
}

/* ==========================================================================
   TABS  (WAI-ARIA authoring practices: arrows, Home/End)
   ========================================================================== */

function initTabs(): void {
  document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((root) => {
    const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const panels = Array.from(root.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
    if (!tabs.length) return;

    const select = (index: number) => {
      tabs.forEach((tab, position) => {
        const active = position === index;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel, position) => {
        panel.hidden = position !== index;
      });
    };

    tabs.forEach((tab, index) => {
      listen<MouseEvent>(tab, 'click', () => select(index));
      listen<KeyboardEvent>(tab, 'keydown', (event) => {
        const last = tabs.length - 1;
        let next = index;
        switch (event.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            next = index === last ? 0 : index + 1;
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            next = index === 0 ? last : index - 1;
            break;
          case 'Home':
            next = 0;
            break;
          case 'End':
            next = last;
            break;
          default:
            return;
        }
        event.preventDefault();
        select(next);
        tabs[next]?.focus();
      });
    });

    select(Math.max(0, tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true')));
  });
}

/* ==========================================================================
   TOASTS
   ========================================================================== */

type ToastTone = 'default' | 'error';

function showToast(message: string, tone: ToastTone = 'default'): void {
  let region = document.querySelector<HTMLElement>('[data-toast-region]');
  if (!region) {
    region = document.createElement('div');
    region.dataset.toastRegion = '';
    region.className =
      'pointer-events-none fixed inset-block-end-6 inset-inline-6 z-[60] flex flex-col items-center gap-2';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    document.body.append(region);
  }

  const toast = document.createElement('p');
  toast.className = [
    'pointer-events-auto rounded-full border px-4 py-2 text-sm shadow-lg backdrop-blur',
    tone === 'error'
      ? 'border-accent/40 bg-surface text-fg'
      : 'border-line bg-surface/95 text-fg',
  ].join(' ');
  toast.textContent = message;
  region.append(toast);

  window.setTimeout(() => {
    toast.style.transition = 'opacity 300ms ease, transform 300ms ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    window.setTimeout(() => toast.remove(), 320);
  }, 3200);
}

/* ==========================================================================
   COPY TO CLIPBOARD
   ========================================================================== */

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }

  /*
   * `execCommand` is deprecated but still the only option in an insecure
   * context (a plain http:// origin) and in older browsers. It stays as a
   * fallback so the copy buttons never silently do nothing.
   */
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

/**
 * Reads the text to copy. A `<template>` holds its markup in a document
 * fragment with no layout, so `innerText` would return an empty string: its
 * `content` has to be read explicitly.
 */
function textToCopy(element: Element): string {
  if (element instanceof HTMLTemplateElement) {
    return (element.content.textContent ?? '').trim();
  }
  return ((element as HTMLElement).innerText ?? element.textContent ?? '').trim();
}

function initCopy(): void {
  listen<MouseEvent>(document, 'click', async (event) => {
    const button = (event.target as HTMLElement).closest<HTMLElement>('[data-copy]');
    if (!button) return;

    const target = button.getAttribute('data-copy-target');
    const source = target ? document.querySelector(target) : null;
    const value = source ? textToCopy(source) : button.getAttribute('data-copy');

    if (!value) return;

    const ok = await copyText(value);
    const okMessage = button.dataset.copyOk ?? 'Copié';
    const koMessage = button.dataset.copyError ?? 'Copie impossible';

    button.dataset.copied = String(ok);
    showToast(ok ? okMessage : koMessage, ok ? 'default' : 'error');
  });
}

/* ==========================================================================
   BACK TO TOP
   ========================================================================== */

function initBackToTop(): void {
  const button = document.querySelector<HTMLElement>('[data-back-to-top]');
  if (!button) return;

  const sync = () => {
    button.classList.toggle('opacity-0', window.scrollY < 600);
    button.classList.toggle('pointer-events-none', window.scrollY < 600);
  };

  sync();
  listen<Event>(window, 'scroll', sync, { passive: true });

  listen<MouseEvent>(button, 'click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
  });
}

/* ==========================================================================
   CONTACT BRIEF → mailto (no backend, no third party)
   ========================================================================== */

function initContact(): void {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;

  const email = form.dataset.email ?? '';
  const subject = form.dataset.subject ?? '';
  const okMessage = form.dataset.ok ?? '';
  const fallback = form.querySelector<HTMLElement>('[data-mailto-fallback]');

  listen<SubmitEvent>(form, 'submit', (event) => {
    event.preventDefault();

    const fields = new FormData(form);
    const labelOf = (name: string) =>
      form.querySelector<HTMLElement>(`[data-label-for="${name}"]`)?.textContent?.trim() ?? name;

    const body: string[] = [];
    for (const [name, raw] of fields.entries()) {
      const value = String(raw).trim();
      if (!value) continue;
      body.push(`${labelOf(name)}: ${value}`);
    }

    const href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.join('\n\n'))}`;
    window.location.href = href;

    if (okMessage) showToast(okMessage);
    if (fallback) fallback.classList.remove('hidden');
  });
}

/* ==========================================================================
   BOOT
   ========================================================================== */

function init(): void {
  /* Idempotent: a `pageshow` after a bfcache restore replaces the previous
     listeners instead of doubling every handler on the live elements. */
  bindings.abort();
  bindings = new AbortController();
  releaseObservers();

  initTheme();
  initHeader();
  initMenu();
  initReveals();
  initMagnetic();
  initTabs();
  initCopy();
  initBackToTop();
  initContact();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}

/* Cross-document view transitions + bfcache: re-bind after a restore. */
window.addEventListener('pageshow', init);

/* Nothing observes a page that is being frozen: let it go before the bfcache
   snapshot, and rebuild the theme state when the page comes back. */
window.addEventListener('pagehide', () => {
  bindings.abort();
  releaseObservers();
});

/** Exposed for inline scripts that need to report something to the visitor. */
(window as unknown as { showToast: typeof showToast }).showToast = showToast;