import { useEffect, useState } from 'react';

export type SpecScrollFit = {
  /** Visible height of the shell scroll area — the cap for a sticky rail. */
  scrollportHeight?: number;
  /** Height from the measured element down to the bottom of that visible area. */
  fillHeight?: number;
};

function findScrollport(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement;
  while (parent) {
    const { overflowY } = window.getComputedStyle(parent);
    if (overflowY === 'auto' || overflowY === 'scroll') return parent;
    parent = parent.parentElement;
  }
  return null;
}

/**
 * Measures the shell scroll area around a Spec surface so a workspace can own its
 * own scrolling (sticky rails, independently scrolling regions) instead of pushing
 * the whole page. Values come from layout offsets, not from the scroll position,
 * so they stay stable while the user scrolls.
 */
export function useSpecScrollFit() {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [fit, setFit] = useState<SpecScrollFit>({});

  useEffect(() => {
    if (!element) return;
    const scrollport = findScrollport(element);
    if (!scrollport) return;

    const measure = () => {
      const paddingBottom =
        Number.parseFloat(window.getComputedStyle(scrollport).paddingBottom) || 0;
      const offsetInScrollport =
        element.getBoundingClientRect().top -
        scrollport.getBoundingClientRect().top +
        scrollport.scrollTop;
      const scrollportHeight = Math.round(scrollport.clientHeight);
      const fillHeight = Math.max(
        0,
        Math.round(scrollportHeight - offsetInScrollport - paddingBottom),
      );
      setFit((current) =>
        current.scrollportHeight === scrollportHeight && current.fillHeight === fillHeight
          ? current
          : { scrollportHeight, fillHeight },
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scrollport);
    observer.observe(element);
    // The surrounding column grows when a page header or alert above it changes
    // height, which moves this element without resizing it.
    if (element.parentElement) observer.observe(element.parentElement);
    return () => observer.disconnect();
  }, [element]);

  return [setElement, fit] as const;
}
