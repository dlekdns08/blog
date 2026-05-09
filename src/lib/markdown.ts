import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeExternalLinks from "rehype-external-links";
import rehypeStringify from "rehype-stringify";

/**
 * 사이트 표준 markdown → HTML 파이프라인.
 * GFM + math(KaTeX) + syntax highlight + 외부 링크 안전 속성.
 * 본문/번역본 모두 동일 파이프라인을 사용해 일관성 유지.
 */
export async function markdownToHtml(content: string): Promise<string> {
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex)
    .use(rehypeHighlight)
    .use(rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);
  return String(processed);
}
