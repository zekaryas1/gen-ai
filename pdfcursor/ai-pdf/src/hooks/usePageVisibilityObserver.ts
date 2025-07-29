import { RefObject, useEffect, useRef } from "react";

interface UsePageVisibilityObserverOptions {
  rootId?: string;
  thresholds?: number[];
  visibilityThreshold?: number;
  onPageVisible: () => void;
}

export function usePageVisibilityObserver(
  props: UsePageVisibilityObserverOptions,
): RefObject<HTMLDivElement | null> {
  const {
    onPageVisible,
    rootId,
    visibilityThreshold = 0.5,
    thresholds = [0, 0.25, 0.5, 0.75, 1.0],
  } = props;

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rootElement = rootId ? document.getElementById(rootId) : null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          entry.intersectionRatio >= visibilityThreshold
        ) {
          onPageVisible();
        }
      },
      {
        root: rootElement,
        threshold: thresholds,
      },
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [rootId, thresholds, visibilityThreshold, onPageVisible]);

  return ref;
}
