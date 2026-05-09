"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Message = { role: "user" | "assistant"; content: string };

type PostIndexEntry = {
  slug: string;
  title: string;
  description: string | null;
  tags: string[];
  category: string;
};

function ChatIcon() {
  return (
    <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 1.5a.75.75 0 0 1 .75.75V7.5h-1.5V2.25A.75.75 0 0 1 12 1.5ZM5.636 4.136a.75.75 0 0 1 1.06 0l2.653 2.654-1.06 1.06L5.636 5.197a.75.75 0 0 1 0-1.06Zm12.728 0a.75.75 0 0 1 0 1.06l-2.652 2.653-1.061-1.06 2.652-2.653a.75.75 0 0 1 1.06 0ZM1.5 12a.75.75 0 0 1 .75-.75H7.5v1.5H2.25A.75.75 0 0 1 1.5 12Zm14.25 0v-.75H21.75a.75.75 0 0 1 0 1.5H15.75V12ZM4.576 18.364l2.652-2.652 1.061 1.06-2.653 2.653a.75.75 0 1 1-1.06-1.061Zm14.848 0a.75.75 0 0 1-1.06 1.06l-2.653-2.652 1.06-1.061 2.653 2.653ZM12 15.75a.75.75 0 0 1 .75.75v5.25h-1.5V16.5a.75.75 0 0 1 .75-.75Z" />
    </svg>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<string | null>(null);
  const [contextTitle, setContextTitle] = useState<string | null>(null);
  const [postIndex, setPostIndex] = useState<PostIndexEntry[] | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();

  // 글 인덱스(슬러그·제목·설명) 1회 로드 — 포스트 외 페이지에서 RAG 컨텍스트로 사용
  useEffect(() => {
    fetch("/api/posts/index")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setPostIndex(data);
      })
      .catch(() => {});
  }, []);

  // 포스트 페이지라면 글 내용을 컨텍스트로 가져오기
  useEffect(() => {
    setContext(null);
    setContextTitle(null);

    const match = pathname.match(/^\/posts\/(.+)$/);
    if (!match) return;

    const slug = match[1];
    fetch(`/api/posts/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.content) {
          setContext(data.content);
          setContextTitle(data.title ?? null);
        }
      })
      .catch(() => {});
  }, [pathname]);

  // 새 메시지 도착 시 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 열릴 때 입력창 포커스
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          context: context ?? undefined,
          index: !context && postIndex ? postIndex : undefined,
        }),
      });

      if (!res.ok || !res.body) throw new Error("stream error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantContent };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {/* 채팅 패널 */}
      {open && (
        <div role="dialog" aria-modal="true" aria-label="AI 채팅" className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 flex flex-col rounded-2xl shadow-2xl border border-line bg-panel overflow-hidden" style={{ maxHeight: "min(560px, calc(100dvh - 100px))" }}>

          {/* 헤더 */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-black/6 dark:border-white/8 bg-gradient-to-r from-violet-50 to-violet-100/50 dark:from-violet-500/10 dark:to-violet-600/5 shrink-0">
            <div className="size-7 rounded-xl bg-violet-500 dark:bg-violet-600 flex items-center justify-center text-white shrink-0">
              <SparkleIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">AI 어시스턴트</p>
              {contextTitle ? (
                <p className="text-[11px] text-accent truncate leading-tight mt-0.5">
                  📄 {contextTitle}
                </p>
              ) : (
                <p className="text-[11px] text-subtle leading-tight mt-0.5">코알라 오딧세이</p>
              )}
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/8 transition-colors">
              <CloseIcon />
            </button>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">🐨</div>
                <p className="text-sm text-muted">
                  {contextTitle ? `"${contextTitle}"에 대해` : "블로그에 대해"}
                </p>
                <p className="text-sm text-muted">무엇이든 물어보세요!</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="size-6 rounded-lg bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-accent shrink-0 mr-2 mt-0.5">
                    <SparkleIcon />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  msg.role === "user"
                    ? "bg-violet-500 dark:bg-violet-600 text-white rounded-br-sm"
                    : "bg-zinc-100 dark:bg-white/8 text-body rounded-bl-sm"
                }`}>
                  {msg.content}
                  {msg.role === "assistant" && msg.content === "" && (
                    <span className="inline-flex gap-0.5">
                      <span className="size-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="size-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="size-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* 입력 영역 */}
          <div className="shrink-0 px-3 pb-3 pt-2 border-t border-black/6 dark:border-white/8">
            <div className="flex items-end gap-2 rounded-xl border border-line bg-zinc-50 dark:bg-white/5 px-3 py-2 focus-within:border-violet-400 dark:focus-within:border-violet-500/60 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력하세요..."
                rows={1}
                disabled={loading}
                className="flex-1 resize-none bg-transparent text-sm text-body placeholder-zinc-400 dark:placeholder-zinc-600 outline-none leading-relaxed max-h-28 overflow-y-auto disabled:opacity-50"
                style={{ minHeight: "1.5rem" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
                }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="shrink-0 size-7 rounded-lg bg-violet-500 hover:bg-violet-600 disabled:bg-zinc-200 dark:disabled:bg-white/10 flex items-center justify-center text-white disabled:text-zinc-400 dark:disabled:text-zinc-600 transition-colors"
              >
                <SendIcon />
              </button>
            </div>
            <p className="text-[10px] text-zinc-300 dark:text-zinc-600 text-center mt-1.5">Enter로 전송 · Shift+Enter로 줄바꿈</p>
          </div>
        </div>
      )}

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "채팅 닫기" : "AI 어시스턴트 열기"}
        className="fixed bottom-4 right-4 z-50 size-12 rounded-2xl bg-violet-500 hover:bg-violet-600 active:scale-95 shadow-lg shadow-violet-500/30 flex items-center justify-center text-white transition-all duration-150"
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>
    </>
  );
}
