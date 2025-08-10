'use client';
import { useEffect } from 'react';

export default function CalendarsTest() {
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/google/calendars', { cache: 'no-store' });
      const data = await res.json();
      console.log('Calendars:', data); // shows in browser DevTools
    })();
  }, []);

  return <div>Open DevTools → Console to see calendars</div>;
}
