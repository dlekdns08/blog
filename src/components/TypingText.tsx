"use client";

import { useEffect, useState } from "react";

type Props = {
  texts: string[];      // rotate through these
  speed?: number;       // ms per character
  pause?: number;       // ms to pause at full text
  className?: string;
};

export function TypingText({ texts, speed = 60, pause = 2200, className }: Props) {
  const [display, setDisplay] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "erasing">("typing");
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    const current = texts[textIdx];

    if (phase === "typing") {
      if (charIdx < current.length) {
        const t = setTimeout(() => {
          setDisplay(current.slice(0, charIdx + 1));
          setCharIdx((c) => c + 1);
        }, speed);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase("pausing"), pause);
        return () => clearTimeout(t);
      }
    }

    if (phase === "pausing") {
      setPhase("erasing");
    }

    if (phase === "erasing") {
      if (charIdx > 0) {
        const t = setTimeout(() => {
          setDisplay(current.slice(0, charIdx - 1));
          setCharIdx((c) => c - 1);
        }, speed * 0.5);
        return () => clearTimeout(t);
      } else {
        setTextIdx((i) => (i + 1) % texts.length);
        setPhase("typing");
      }
    }
  }, [phase, charIdx, textIdx, texts, speed, pause]);

  return (
    <span className={className}>
      {display}
      <span className="animate-pulse">|</span>
    </span>
  );
}
