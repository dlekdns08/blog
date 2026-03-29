import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";

const STOP_WORDS = new Set([
  // English
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "shall", "can", "not", "no", "nor",
  "so", "yet", "both", "either", "neither", "this", "that", "these",
  "those", "it", "its", "as", "if", "when", "where", "which", "who",
  "what", "how", "why", "all", "each", "every", "any", "some", "about",
  "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "then", "once", "here",
  "there", "up", "down", "use", "using", "used", "also", "just", "more",
  "than", "such", "new", "other", "their", "our", "i", "we", "you",
  "he", "she", "they", "my", "your", "his", "her", "via", "based",
  // Korean particles and common function words
  "의", "가", "이", "은", "는", "을", "를", "에", "와", "과", "로", "으로",
  "에서", "까지", "부터", "에게", "한", "하는", "하여", "이다", "있다", "없다",
  "그", "저", "것", "들", "도", "만", "같은", "등", "대한", "위한",
  "통해", "위해", "때", "수", "때문", "통한", "및", "또한", "하지만",
  "대해", "기반", "방법", "활용", "이용",
]);

function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s\-_.,!?:;()\[\]{}"'\/\\|<>@#$%^&*=+~`]+/)
    .filter((word) => {
      if (!word || word.length < 2) return false;
      if (STOP_WORDS.has(word)) return false;
      if (/^\d+$/.test(word)) return false;
      return true;
    });
}

export async function GET() {
  const posts = await getAllPosts();
  const freq: Record<string, number> = {};

  for (const post of posts) {
    // Title words: weight 3
    for (const word of extractWords(post.title)) {
      freq[word] = (freq[word] ?? 0) + 3;
    }
    // Description words: weight 2
    if (post.description) {
      for (const word of extractWords(post.description)) {
        freq[word] = (freq[word] ?? 0) + 2;
      }
    }
    // Tags: weight 4 (most specific keywords)
    if (post.tags) {
      for (const tag of post.tags) {
        const tagLower = tag.toLowerCase();
        if (tagLower.length >= 2 && !STOP_WORDS.has(tagLower)) {
          freq[tagLower] = (freq[tagLower] ?? 0) + 4;
        }
      }
    }
  }

  const words = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 80)
    .map(([text, value]) => ({ text, value }));

  return NextResponse.json({ words });
}
