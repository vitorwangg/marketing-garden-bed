import { useState, useEffect, useRef } from "react";

export const useCountUp = (end: number, duration = 1200, prefix = "", suffix = "") => {
  const [display, setDisplay] = useState(prefix + "0" + suffix);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * end);
      setDisplay(prefix + current.toLocaleString("pt-BR") + suffix);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration, prefix, suffix]);

  return display;
};
