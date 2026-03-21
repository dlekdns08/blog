export type Heading = { id: string; text: string; level: 2 | 3 };

function slugify(text: string): string {
  return (
    text
      .replace(/<[^>]+>/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^\w가-힣\s]/g, "")
      .replace(/\s+/g, "-") || "heading"
  );
}

/**
 * HTML 문자열에서 h2/h3 헤딩을 추출하고 id 속성을 주입해 반환합니다.
 * post page(서버)에서 호출하면 PostContent와 TableOfContents가 동일한 ID를 공유합니다.
 */
export function injectHeadingIds(html: string): {
  html: string;
  headings: Heading[];
} {
  const headings: Heading[] = [];
  const idCount: Record<string, number> = {};

  const processed = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_, lvl, attrs, inner) => {
      const text = inner.replace(/<[^>]+>/g, "").trim();
      const base = slugify(text);
      idCount[base] = (idCount[base] ?? 0) + 1;
      const id = idCount[base] > 1 ? `${base}-${idCount[base]}` : base;
      headings.push({ id, text, level: Number(lvl) as 2 | 3 });
      return `<h${lvl}${attrs} id="${id}">${inner}</h${lvl}>`;
    }
  );

  return { html: processed, headings };
}
