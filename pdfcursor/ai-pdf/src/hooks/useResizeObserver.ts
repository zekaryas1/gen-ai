import { useEffect, useState } from "react";

function debounce<T extends (...args: never[]) => void>(
  fn: T,
  delay: number,
): T {
  let timer: ReturnType<typeof setTimeout>;
  return function (...args: never[]) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  } as T;
}

export function useResizeObserver(
  ref: React.RefObject<HTMLElement | null>,
  delay = 200,
) {
  const [size, setSize] = useState(0);

  const handleResize = debounce((entry: ResizeObserverEntry) => {
    const { width } = entry.contentRect;
    setSize(width);
  }, delay);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      handleResize(entry);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [handleResize, ref]);

  return size;
}
