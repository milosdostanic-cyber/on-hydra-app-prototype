import { LinkOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

import { anchorTypeLabel } from '../constants/specStatusVocabulary';
import type { SpecCitation } from '../data/types';
import { Button } from '../../ui/antd';
import { HydraTag } from '../../ui/HydraTag';

export function SpecCitationLink({
  citation,
  onOpen,
  label,
}: {
  citation: SpecCitation;
  onOpen: (citation: SpecCitation) => void;
  label?: ReactNode;
}) {
  return (
    <Button
      type="link"
      size="small"
      icon={<LinkOutlined />}
      onClick={() => onOpen(citation)}
      style={{ paddingInline: 0, height: 'auto' }}
    >
      {label ?? `Page ${citation.page}`}
      {citation.anchorType !== 'exact' ? ` · ${anchorTypeLabel[citation.anchorType]}` : ''}
    </Button>
  );
}

export function SpecCitationHighlightBanner({
  approximate,
  unavailable,
}: {
  approximate?: boolean;
  unavailable?: boolean;
}) {
  if (unavailable) {
    return <HydraTag tone="default">Location unavailable</HydraTag>;
  }
  if (approximate) {
    return <HydraTag tone="warning">Approximate location — confirm against the source</HydraTag>;
  }
  return null;
}
