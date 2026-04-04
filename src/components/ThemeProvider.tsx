"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  return useContext(ThemeContext);
}

// 클라이언트에서 현재 실제 테마를 동기적으로 읽는 헬퍼
function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("theme") as Theme | null) ?? "system";
}

function getInitialResolved(theme: Theme): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  // 인라인 스크립트가 이미 .dark 클래스를 설정했으므로 DOM에서 직접 읽음
  if (document.documentElement.classList.contains("dark")) return "dark";
  if (theme === "dark") return "dark";
  if (theme === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    getInitialResolved(getInitialTheme())
  );

  // theme 상태가 바뀔 때마다 DOM 클래스와 resolvedTheme을 동기화
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    function apply(t: Theme) {
      const isDark = t === "dark" || (t === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", isDark);
      setResolvedTheme(isDark ? "dark" : "light");
    }

    apply(theme);

    const listener = () => {
      if (theme === "system") apply("system");
    };
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [theme]);

  function setTheme(t: Theme) {
    setThemeState(t);
    if (t === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", t);
    }
  }

  function toggle() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
