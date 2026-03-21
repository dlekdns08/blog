"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { PostMeta } from "@/lib/posts";
import { CommandPalette } from "./CommandPalette";

type Ctx = { open: () => void };
const CommandPaletteCtx = createContext<Ctx | null>(null);

export function useCommandPalette() {
  return useContext(CommandPaletteCtx);
}

export function CommandPaletteProvider({
  posts,
  children,
}: {
  posts: PostMeta[];
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const openPalette = useCallback(() => setIsOpen(true), []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <CommandPaletteCtx.Provider value={{ open: openPalette }}>
      {children}
      <CommandPalette
        posts={posts}
        open={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </CommandPaletteCtx.Provider>
  );
}
