import { useState } from "react";

function getInitialDark(): boolean {
  try {
    const stored = localStorage.getItem("color-scheme");
    if (stored !== null) return stored === "dark";
  } catch {}
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function applyDark(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try { localStorage.setItem("color-scheme", dark ? "dark" : "light"); } catch {}
}

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const initial = getInitialDark();
    applyDark(initial);
    return initial;
  });

  function toggle() {
    const next = !dark;
    applyDark(next);
    setDark(next);
  }

  return { dark, toggle };
}
