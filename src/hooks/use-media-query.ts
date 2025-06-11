import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      // Set the initial value
      setMatches(media.matches);

      // Define a callback function to handle changes
      const listener = () => {
        setMatches(media.matches);
      };

      // Add the listener
      media.addEventListener('change', listener);

      // Clean up
      return () => {
        media.removeEventListener('change', listener);
      };
    }
  }, [query]);

  return matches;
}
