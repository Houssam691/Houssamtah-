/**
 * Applies the saved theme before the first paint.
 *
 * Loaded as a classic (render-blocking) script from the head, which is why it
 * lives in its own file: an inline script would force `'unsafe-inline'` into
 * `script-src` and weaken the Content-Security-Policy for the whole site.
 *
 * Kept deliberately tiny and dependency-free — it runs before anything else.
 */
(function () {
  var DARK = '#0a0b0d';
  var LIGHT = '#f7f5f0';
  var root = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');

  try {
    var stored = localStorage.getItem('vitrine:theme');
    var theme =
      stored === 'light' || stored === 'dark'
        ? stored
        : window.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark';
    root.dataset.theme = theme;
    root.classList.toggle('scheme-dark', theme === 'dark');
    root.classList.toggle('scheme-light', theme === 'light');
    if (meta) meta.content = theme === 'light' ? LIGHT : DARK;
  } catch (error) {
    /* private mode: the dark default in the markup applies */
  }
})();