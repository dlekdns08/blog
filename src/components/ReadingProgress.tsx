"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function update() {
      const scrolled = window.scrollY;
      const height =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? (scrolled / height) * 100 : 0);
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-violet-500 to-violet-400 transition-[width] duration-75 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
