/**
 * Hook for dynamically updating page metadata.
 * Sets favicon, apple-touch-icon, and page title based on game config.
 */

import { useEffect } from 'react';

interface PageMetaOptions {
  /** Page title */
  title: string;
  /** Path to favicon (SVG or PNG) */
  favicon?: string;
  /** Path to apple-touch-icon (180x180 PNG for iOS home screen) */
  appleTouchIcon?: string;
  /** Theme color for browser chrome */
  themeColor?: string;
}

/**
 * Dynamically updates page metadata (favicon, title, apple-touch-icon).
 * Restores original values on unmount.
 *
 * @example
 * ```tsx
 * usePageMeta({
 *   title: "BG3 Миллионер",
 *   favicon: "/games/bg3/favicon.svg",
 *   appleTouchIcon: "/games/bg3/apple-touch-icon.png",
 *   themeColor: "#d97706"
 * });
 * ```
 */
export function usePageMeta(options: PageMetaOptions): void {
  useEffect(() => {
    // Store original values
    const originalTitle = document.title;
    const originalFavicon = document
      .querySelector<HTMLLinkElement>('link[rel="icon"]')
      ?.href;
    const originalAppleTouchIcon = document
      .querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]')
      ?.href;
    const originalThemeColor = document
      .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.content;

    // Update title
    document.title = options.title;

    // Update favicon
    if (options.favicon) {
      let faviconLink = document
        .querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = options.favicon;
      // Set type based on extension
      if (options.favicon.endsWith('.svg')) {
        faviconLink.type = 'image/svg+xml';
      } else if (options.favicon.endsWith('.png')) {
        faviconLink.type = 'image/png';
      } else if (options.favicon.endsWith('.ico')) {
        faviconLink.type = 'image/x-icon';
      }
    }

    // Update apple-touch-icon
    if (options.appleTouchIcon) {
      let appleTouchLink = document
        .querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
      if (!appleTouchLink) {
        appleTouchLink = document.createElement('link');
        appleTouchLink.rel = 'apple-touch-icon';
        document.head.appendChild(appleTouchLink);
      }
      appleTouchLink.href = options.appleTouchIcon;
    }

    // Update theme-color
    if (options.themeColor) {
      let themeColorMeta = document
        .querySelector<HTMLMetaElement>('meta[name="theme-color"]');
      if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.name = 'theme-color';
        document.head.appendChild(themeColorMeta);
      }
      themeColorMeta.content = options.themeColor;
    }

    // Cleanup: restore original values on unmount
    return () => {
      document.title = originalTitle;

      if (originalFavicon) {
        const faviconLink = document
          .querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (faviconLink) {
          faviconLink.href = originalFavicon;
        }
      }

      if (originalAppleTouchIcon) {
        const appleTouchLink = document
          .querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
        if (appleTouchLink) {
          appleTouchLink.href = originalAppleTouchIcon;
        }
      }

      if (originalThemeColor) {
        const themeColorMeta = document
          .querySelector<HTMLMetaElement>('meta[name="theme-color"]');
        if (themeColorMeta) {
          themeColorMeta.content = originalThemeColor;
        }
      }
    };
  }, [
    options.title,
    options.favicon,
    options.appleTouchIcon,
    options.themeColor
  ]);
}
