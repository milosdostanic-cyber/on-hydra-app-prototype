import type { ReactNode, RefObject } from 'react';

/**
 * Same scroll port as the document preview on SpecEditPage:
 * fills the remaining panel height so the scrollbar runs to the bottom of the section.
 */
export function SpecPanelScrollBody({
  children,
  scrollRef,
}: {
  children: ReactNode;
  scrollRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={scrollRef}
      data-spec-document-scroll=""
      style={{
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}
