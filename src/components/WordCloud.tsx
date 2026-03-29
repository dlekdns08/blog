"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Word = { text: string; value: number };

const COLORS = [
  "text-violet-600 dark:text-violet-400",
  "text-indigo-600 dark:text-indigo-400",
  "text-sky-500 dark:text-sky-400",
  "text-emerald-600 dark:text-emerald-400",
  "text-amber-600 dark:text-amber-400",
  "text-rose-500 dark:text-rose-400",
  "text-violet-500 dark:text-violet-300",
  "text-indigo-500 dark:text-indigo-300",
  "text-zinc-500 dark:text-zinc-400",
];

// Subtle rotations for organic look
const ROTATIONS = [-12, -6, 0, 0, 6, 12, -8, 8, -3, 3, 0, -10, 10, -4, 4, 0];

export function WordCloud() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/wordcloud")
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then((data: { words: Word[] }) => {
        setWords(data.words);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-72 text-zinc-400 dark:text-zinc-500">
        <span className="text-sm animate-pulse">단어 구름을 불러오는 중...</span>
      </div>
    );
  }

  if (error || !words.length) {
    return (
      <div className="flex items-center justify-center min-h-72 text-zinc-400 dark:text-zinc-500">
        <span className="text-sm">단어 데이터를 불러올 수 없어요.</span>
      </div>
    );
  }

  const maxVal = Math.max(...words.map((w) => w.value));
  const minVal = Math.min(...words.map((w) => w.value));
  const range = maxVal - minVal || 1;

  return (
    <div className="relative rounded-2xl border border-black/8 dark:border-white/10 bg-white dark:bg-white/5 p-8 shadow-sm">
      <div className="flex flex-wrap gap-x-4 gap-y-5 justify-center items-center">
        {words.map((word, i) => {
          const norm = (word.value - minVal) / range;
          // Font size: 0.7rem → 2.4rem
          const fontSize = 0.7 + norm * 1.7;
          const rotation = ROTATIONS[i % ROTATIONS.length];
          const color = COLORS[i % COLORS.length];
          // Opacity: 0.45 → 1.0
          const opacity = 0.45 + norm * 0.55;

          return (
            <Link
              key={word.text}
              href={`/posts?search=${encodeURIComponent(word.text)}`}
              style={{
                fontSize: `${fontSize}rem`,
                transform: `rotate(${rotation}deg)`,
                opacity,
              }}
              className={`${color} font-semibold leading-none hover:opacity-100 hover:scale-110 transition-all duration-150 cursor-pointer`}
              title={`"${word.text}" 검색 (${word.value}점)`}
            >
              {word.text}
            </Link>
          );
        })}
      </div>
      <p className="mt-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
        단어를 클릭하면 관련 글을 검색해요
      </p>
    </div>
  );
}
