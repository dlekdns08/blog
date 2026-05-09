"use client";

import { useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";

/**
 * @uiw/react-md-editor의 data-color-mode 자동 감지(prefers-color-scheme)는
 * ThemeProvider의 .dark 클래스 토글과 무관하게 OS 설정만 따라간다.
 * 이 컴포넌트는 resolvedTheme을 <html data-color-mode="..."> 속성으로 동기화해
 * 에디터/프리뷰가 우리 테마 토글과 일치하도록 만든다.
 */
export function MdEditorThemeSync() {
  const ctx = useTheme();
  const resolved = ctx?.resolvedTheme ?? "light";

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-color-mode", resolved);
    return () => {
      document.documentElement.removeAttribute("data-color-mode");
    };
  }, [resolved]);

  return null;
}
