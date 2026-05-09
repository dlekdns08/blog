"use client";

import { useEffect, useState } from "react";

export function ViewCounter({ slug }: { slug: string }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    // Increment view count
    fetch(`/api/views/${slug}`, { method: "POST" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.views != null) setViews(data.views);
      })
      .catch(() => {});
  }, [slug]);

  if (views === null) return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs text-subtle tabular-nums">
      <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
      {views.toLocaleString()}
    </span>
  );
}
