"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;

const LANG_LABELS: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  js: "JavaScript",
  ts: "TypeScript",
  jsx: "JSX",
  tsx: "TSX",
  python: "Python",
  py: "Python",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  zsh: "Zsh",
  css: "CSS",
  html: "HTML",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  markdown: "Markdown",
  md: "Markdown",
  sql: "SQL",
  rust: "Rust",
  go: "Go",
  java: "Java",
  kotlin: "Kotlin",
  swift: "Swift",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  ruby: "Ruby",
  php: "PHP",
  dockerfile: "Dockerfile",
  toml: "TOML",
  xml: "XML",
};

function highlightTextNodes(root: HTMLElement, query: string) {
  if (!query.trim()) return;
  const q = query.toLowerCase();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const toReplace: [Text, string][] = [];
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    if (node.textContent?.toLowerCase().includes(q)) {
      toReplace.push([node, node.textContent!]);
    }
  }
  for (const [textNode, text] of toReplace) {
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      if (part.toLowerCase() === q) {
        const mark = document.createElement("mark");
        mark.className = "search-highlight";
        mark.textContent = part;
        frag.appendChild(mark);
      } else {
        frag.appendChild(document.createTextNode(part));
      }
    }
    textNode.parentNode?.replaceChild(frag, textNode);
  }
}

export function PostContent({ html }: { html: string }) {
  const ref = useRef<HTMLElement>(null);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  const themeCtx = useTheme();
  const resolvedTheme = themeCtx?.resolvedTheme ?? "light";

  useEffect(() => {
    if (!ref.current) return;
    const blocks = ref.current.querySelectorAll("pre");

    blocks.forEach((pre) => {
      if (pre.querySelector(".copy-btn")) return;

      // ── 언어 배지 ──
      const code = pre.querySelector("code");
      const langClass = Array.from(code?.classList ?? []).find((c) =>
        c.startsWith("language-")
      );
      if (langClass) {
        const lang = langClass.replace("language-", "");
        const label = LANG_LABELS[lang] ?? lang;
        const badge = document.createElement("span");
        badge.className = "lang-badge";
        badge.textContent = label;
        pre.appendChild(badge);
      }

      // ── 복사 버튼 ──
      const btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.setAttribute("aria-label", "코드 복사");
      btn.innerHTML = COPY_ICON;

      btn.addEventListener("click", async () => {
        const text =
          pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
        try {
          await navigator.clipboard.writeText(text);
          btn.innerHTML = CHECK_ICON;
          btn.classList.add("copied");
          setTimeout(() => {
            btn.innerHTML = COPY_ICON;
            btn.classList.remove("copied");
          }, 2000);
        } catch {
          // clipboard API 미지원 시 무시
        }
      });

      pre.appendChild(btn);
    });
  }, [html]);

  // Highlight search terms from ?q= param
  useEffect(() => {
    if (!ref.current || !searchQuery) return;
    // Wait for content to render fully
    const id = requestAnimationFrame(() => {
      if (ref.current) highlightTextNodes(ref.current, searchQuery);
    });
    return () => cancelAnimationFrame(id);
  }, [html, searchQuery]);

  // Mermaid 다이어그램 렌더링 (lazy + 테마 토글 시 재렌더)
  useEffect(() => {
    if (!ref.current) return;

    // 첫 렌더(pre code.language-mermaid) + 이미 렌더된(.mermaid-rendered[data-source]) 둘 다 수집
    const sources: { el: Element; src: string }[] = [];
    ref.current
      .querySelectorAll<HTMLElement>("pre code.language-mermaid")
      .forEach((code) => {
        const pre = code.closest("pre");
        if (pre) sources.push({ el: pre, src: code.textContent ?? "" });
      });
    ref.current
      .querySelectorAll<HTMLElement>(".mermaid-rendered[data-source]")
      .forEach((div) => {
        const src = div.getAttribute("data-source") ?? "";
        if (src) sources.push({ el: div, src });
      });

    if (sources.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const m = await import("mermaid");
        if (cancelled) return;
        const mermaid = m.default;
        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === "dark" ? "dark" : "default",
          securityLevel: "loose",
        });
        for (let i = 0; i < sources.length; i++) {
          const { el, src } = sources[i];
          const id = `mermaid-${Date.now()}-${i}`;
          try {
            const { svg } = await mermaid.render(id, src);
            if (cancelled) return;
            const wrapper = document.createElement("div");
            wrapper.className =
              "mermaid-rendered my-4 flex justify-center overflow-x-auto";
            wrapper.setAttribute("data-source", src);
            wrapper.innerHTML = svg;
            el.replaceWith(wrapper);
          } catch (err) {
            console.error("mermaid render failed:", err);
          }
        }
      } catch (err) {
        console.error("mermaid load failed:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [html, resolvedTheme]);

  return (
    <article
      ref={ref}
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
