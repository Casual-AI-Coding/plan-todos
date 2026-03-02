import { useState, useRef, useCallback, useEffect } from "react";

export function useScrollIndicators() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showTopIndicator, setShowTopIndicator] = useState(false);
  const [showBottomIndicator, setShowBottomIndicator] = useState(false);

  const checkScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    setShowTopIndicator(scrollTop > 20);
    setShowBottomIndicator(scrollTop + clientHeight < scrollHeight - 20);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      checkScroll();
      return () => container.removeEventListener("scroll", checkScroll);
    }
  }, [checkScroll]);

  return {
    containerRef,
    showTopIndicator,
    showBottomIndicator,
    checkScroll,
  };
}
