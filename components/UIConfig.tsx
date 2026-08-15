'use client';

import { useEffect } from 'react';

export function UIConfig() {
  useEffect(() => {
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalLog = console.log;

    const filters = [
      'follow-redirects',
      'debug',
      'Module not found',
      'Caching failed',
      'webpack.cache',
      'EACCES',
      'permission denied',
      'Watchpack Error',
      'supports-color',
      'ESM packages',
      'import-esm-externals',
      'url.parse',
      'DEP0169',
      'DeprecationWarning',
      'Invalid next.config.js',
      'SWC as replacement',
      'Babel configuration',
      'custom Babel config',
      'security vulnerability',
    ];

    console.warn = function(...args) {
      const msg = args.join(' ');
      for (const filter of filters) {
        if (msg?.includes?.(filter)) {
          return;
        }
      }
      originalWarn.apply(console, args);
    };

    console.error = function(...args) {
      const msg = args.join(' ');
      for (const filter of filters) {
        if (msg?.includes?.(filter)) {
          return;
        }
      }
      originalError.apply(console, args);
    };

    console.log = function(...args) {
      const msg = args.join(' ');
      const ignore = ['○ Compiling', '✓ Compiled', 'Ready in', 'Local:'];
      for (const filter of ignore) {
        if (msg?.includes?.(filter)) {
          return;
        }
      }
      originalLog.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
      console.error = originalError;
      console.log = originalLog;
    };
  }, []);

  return null;
}
