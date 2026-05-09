"use client";

import { useState } from "react";
import { TableOfContents } from "@/components/TableOfContents";
import type { Heading } from "@/lib/headings";

export function CollapsibleTOC({ headings }: { headings: Heading[] }) {
  const [open, setOpen] = useState(false);

  if (headings.length < 2) return null;

  return (
    <div className="xl:hidden mb-8 rounded-xl border border-line overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <svg className="size-4 text-subtle" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          목차
          <span className="text-xs font-normal text-subtle">({headings.length})</span>
        </span>
        <svg
          className={`size-4 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-3 pb-3 pt-2 border-t border-line bg-zinc-50/50 dark:bg-white/2">
          <TableOfContents headings={headings} />
        </div>
      )}
    </div>
  );
}
