import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "frensify-sidebar-collapsed";
const MOBILE_BREAKPOINT = 768;

function readCollapsedPreference(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function useSidebarState() {
  const [collapsed, setCollapsedState] = useState(readCollapsedPreference);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.innerWidth < MOBILE_BREAKPOINT
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const sync = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isMobile || !mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobile, mobileOpen]);

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed(!collapsed);
    }
  }, [collapsed, isMobile, setCollapsed]);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const isExpanded = isMobile ? mobileOpen : !collapsed;

  return {
    collapsed: isMobile ? false : collapsed,
    mobileOpen,
    isMobile,
    isExpanded,
    toggleSidebar,
    closeMobile,
  };
}
