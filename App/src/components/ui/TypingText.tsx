import { useEffect, useState } from 'react';

export function TypingText({
  text,
  speed = 70,
  cursorDelay = 2500,
}: {
  text: string;
  speed?: number;
  cursorDelay?: number;
}) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    setDisplayed('');
    setShowCursor(true);
    let index = 0;
    let cursorTimeout: ReturnType<typeof setTimeout> | null = null;
    const typingInterval = setInterval(() => {
      setDisplayed(text.slice(0, index + 1));
      index += 1;
      if (index === text.length) {
        clearInterval(typingInterval);
        cursorTimeout = setTimeout(() => setShowCursor(false), cursorDelay);
      }
    }, speed);
    return () => {
      clearInterval(typingInterval);
      if (cursorTimeout) clearTimeout(cursorTimeout);
    };
  }, [text, speed, cursorDelay]);

  return (
    <span className="font-mono">
      {displayed}
      {showCursor && <span className="ml-0.5 animate-pulse">|</span>}
    </span>
  );
}
