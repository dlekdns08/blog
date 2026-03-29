import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";

const STOP_WORDS = new Set([
  // ── English: 관사·전치사·접속사·대명사·조동사 ───────────────
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "shall", "can", "not", "no", "nor",
  "so", "yet", "both", "either", "neither", "this", "that", "these",
  "those", "it", "its", "as", "if", "when", "where", "which", "who",
  "what", "how", "why", "all", "each", "every", "any", "some", "about",
  "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "then", "once", "here",
  "there", "up", "down", "also", "just", "more", "than", "such",
  "other", "their", "our", "i", "we", "you", "he", "she", "they",
  "my", "your", "his", "her", "via", "based",
  // ── English: 동사 ──────────────────────────────────────────
  "use", "used", "using", "uses",
  "make", "makes", "made", "making",
  "get", "gets", "got", "getting",
  "set", "sets", "setting",
  "run", "runs", "running", "ran",
  "build", "builds", "built", "building",
  "create", "creates", "created", "creating",
  "update", "updates", "updated", "updating",
  "add", "adds", "added", "adding",
  "remove", "removes", "removed", "removing",
  "find", "finds", "found", "finding",
  "show", "shows", "showed", "showing",
  "apply", "applies", "applied", "applying",
  "start", "starts", "started", "starting",
  "stop", "stops", "stopped", "stopping",
  "learn", "learns", "learned", "learning",
  "understand", "understands", "understood",
  "implement", "implements", "implemented", "implementing",
  "introduce", "introduces", "introduced",
  "explain", "explains", "explained",
  "define", "defines", "defined", "defining",
  "describe", "describes", "described",
  "train", "trains", "trained", "training",
  "generate", "generates", "generated", "generating",
  "load", "loads", "loaded", "loading",
  "call", "calls", "called", "calling",
  "work", "works", "worked", "working",
  "give", "gives", "gave", "given",
  "take", "takes", "took", "taken",
  "know", "knows", "knew", "known",
  "think", "thinks", "thought",
  "need", "needs", "needed",
  "want", "wants", "wanted",
  "see", "sees", "saw", "seen",
  "look", "looks", "looked",
  "let", "allow", "allows", "allowed",
  "compare", "compares", "compared",
  "improve", "improves", "improved",
  "enable", "enables", "enabled",
  "support", "supports", "supported",
  "provide", "provides", "provided",
  "handle", "handles", "handled",
  "compute", "computes", "computed",
  "optimize", "optimizes", "optimized",
  "store", "stores", "stored",
  "return", "returns", "returned",
  "convert", "converts", "converted",
  "extract", "extracts", "extracted",
  "reduce", "reduces", "reduced",
  "process", "processes", "processed",
  "perform", "performs", "performed",
  "predict", "predicts", "predicted",
  "encode", "encodes", "encoded",
  "decode", "decodes", "decoded",
  "deploy", "deploys", "deployed",
  "test", "tests", "tested", "testing",
  // ── Korean: 조사·접속사·기능어 ──────────────────────────────
  "의", "가", "이", "은", "는", "을", "를", "에", "와", "과", "로", "으로",
  "에서", "까지", "부터", "에게", "같은", "등", "대한", "위한",
  "통해", "위해", "때", "수", "때문", "통한", "및", "또한", "하지만",
  "대해", "기반", "방법",
  // ── Korean: 동사 어간/자주 나오는 동사형 ──────────────────────
  "하다", "한다", "했다", "하고", "하여", "하는", "하면", "하기", "하지",
  "되다", "된다", "됐다", "되고", "되어", "되는", "되면",
  "있다", "없다", "있는", "없는", "있고", "없고",
  "이다", "아니다",
  "만들다", "만든다", "만들고", "만들어", "만드는",
  "사용하다", "사용한다", "사용하고", "사용하여", "사용하는",
  "이용하다", "이용한다", "이용하고", "이용하여",
  "활용하다", "활용한다", "활용하고", "활용하여", "활용",
  "이용", "사용",
  "구현하다", "구현한다", "구현하고", "구현하여",
  "학습하다", "학습한다", "학습하고", "학습하여",
  "설명하다", "설명한다", "설명하고",
  "분석하다", "분석한다", "분석하고",
  "적용하다", "적용한다", "적용하고",
  "알다", "안다", "알고", "알아", "알아보다",
  "보다", "본다", "보고", "봐",
  "정의하다", "정의한다",
  "이해하다", "이해한다", "이해하고",
  "배우다", "배운다", "배우고",
  "찾다", "찾는다", "찾고",
  "나타내다", "나타낸다",
  "수행하다", "수행한다", "수행하고",
  "처리하다", "처리한다", "처리하고",
  "생성하다", "생성한다", "생성하고",
  "제공하다", "제공한다", "제공하고",
  "그", "저", "것", "들", "도", "만",
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
