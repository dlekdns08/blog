import type { Attachment } from "@/lib/posts";

function fileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return (
    <svg className="size-4 shrink-0 text-red-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 18H17V16H7v2zm10-8H7v2h10v-2zm-3-2l-4-4H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10h-4V8zm2 0V6.5l3.5 3.5H16V8z" />
    </svg>
  );
  if (["zip", "tar", "gz", "rar"].includes(ext ?? "")) return (
    <svg className="size-4 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 6h-2.18c.07-.28.18-.54.18-.83C18 3.44 16.56 2 14.83 2c-.96 0-1.7.35-2.37.92L12 3.39l-.46-.48C10.87 2.35 10.13 2 9.17 2 7.44 2 6 3.44 6 5.17c0 .29.11.55.18.83H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2.5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-3 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM20 19H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" />
    </svg>
  );
  if (["ppt", "pptx", "key"].includes(ext ?? "")) return (
    <svg className="size-4 shrink-0 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  );
  if (["ipynb", "py", "js", "ts", "cpp", "java"].includes(ext ?? "")) return (
    <svg className="size-4 shrink-0 text-violet-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
    </svg>
  );
  // 기본 파일 아이콘
  return (
    <svg className="size-4 shrink-0 text-zinc-400" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  );
}

export function PostAttachments({ attachments }: { attachments: Attachment[] }) {
  if (attachments.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        첨부 파일
      </h2>
      <ul className="space-y-2">
        {attachments.map((a) => {
          const href = a.file.startsWith("/") ? a.file : `/${a.file}`;
          const filename = a.file.split("/").pop() ?? a.file;
          return (
            <li key={a.file}>
              <a
                href={href}
                download
                className="group flex items-center justify-between gap-3 rounded-xl border border-black/8 bg-white px-4 py-3 text-sm hover:border-violet-300 hover:shadow-sm transition-all dark:border-white/10 dark:bg-white/5 dark:hover:border-violet-500/40"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  {fileIcon(filename)}
                  <span className="truncate font-medium text-zinc-800 group-hover:text-violet-700 dark:text-zinc-200 dark:group-hover:text-violet-300 transition-colors">
                    {a.name}
                  </span>
                  <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                    {filename}
                  </span>
                </span>
                <svg
                  className="size-4 shrink-0 text-zinc-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 15V3m0 12-4-4m4 4 4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" />
                </svg>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
