"use client";

import React from "react";

// This script prevents the flash of the wrong theme on page load
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              // Get stored theme from localStorage
              const storedTheme = localStorage.getItem('remotechakri-theme');
              
              if (storedTheme === 'dark') {
                document.documentElement.classList.add('dark');
              } else if (storedTheme === 'light') {
                document.documentElement.classList.add('light');
              } else {
                // If no theme is stored or it's set to "system", check system preference
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                document.documentElement.classList.add(systemTheme);
              }
            } catch (e) {
              // If localStorage is not available, do nothing
              console.error('Theme script error:', e);
            }
          })();
        `,
      }}
    />
  );
}
