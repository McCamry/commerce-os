// No 'use client' here on purpose: this constant is imported by the server
// component layout AND the client ThemeProvider. Keeping it in a plain module
// ensures the server and client render the exact same string (a value imported
// from a 'use client' module is a client reference and renders empty on the
// server, causing a hydration mismatch).

export const THEME_STORAGE_KEY = 'commerce_theme';

/**
 * Inline script that applies the saved theme before first paint to avoid a
 * flash of the wrong theme. Injected in the document <head>.
 */
export const themeNoFlashScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;
