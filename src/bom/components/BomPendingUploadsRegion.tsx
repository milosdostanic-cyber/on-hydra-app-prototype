import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Collapse, Flex, Typography, theme } from '../../ui/antd';
import { BOM_SHELL_FLUSH_BELOW_BREADCRUMB_ID } from '../../shell/AppShell';
import { shellContentRailStyle } from '../../shell/shellContentRail';
import type { BomImportSession } from '../bomImportProgressState';
import { hydraLargeNormal, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { BomImportProgressStrip } from './BomImportProgressStrip';

type Props = {
  sessions: BomImportSession[];
  onContinue: (session: BomImportSession) => void;
  /** Figma `5079:52504` collapsed (default) vs `5080:16558` expanded. */
  defaultExpanded?: boolean;
};

/** Full-bleed yellow surface; inner copy aligns with breadcrumb + content rail (Figma `5080:16558`). */
function BomPendingUploadsShellSlot({ children }: { children: ReactNode }) {
  const { token } = theme.useToken();
  return (
    <div
      style={{
        width: '100%',
        background: token.colorWarningBg,
        boxShadow: token.boxShadowTertiary,
      }}
    >
      <div style={{ paddingInline: token.paddingLG, boxSizing: 'border-box' }}>
        <div style={shellContentRailStyle}>{children}</div>
      </div>
    </div>
  );
}

function BomPendingUploadsBody({
  sessions,
  onContinue,
  defaultExpanded,
}: Props) {
  const { token } = theme.useToken();

  // 1 pending → single resume strip (Figma `5202:21559`). 2+ → collapsible header (Figma `5079:52504`).
  if (sessions.length === 1) {
    const session = sessions[0];
    return (
      <BomImportProgressStrip
        nested
        progress={session.progress}
        variant="resume"
        onContinue={() => onContinue(session)}
      />
    );
  }

  const count = sessions.length;

  return (
    <Collapse
      bordered={false}
      expandIconPlacement="end"
      defaultActiveKey={defaultExpanded ? ['pending-uploads'] : []}
      style={{ background: 'transparent' }}
      styles={{
        header: {
          alignItems: 'center',
          background: 'transparent',
          paddingInline: 0,
          paddingBlock: token.paddingSM,
        },
        body: {
          background: 'transparent',
          padding: 0,
        },
      }}
      items={[
        {
          key: 'pending-uploads',
          label: (
            <Typography.Text style={hydraTextStyleToReactCss(hydraLargeNormal)}>
              {count} uploads pending completion.
            </Typography.Text>
          ),
          children: (
            <Flex vertical style={{ width: '100%' }}>
              {sessions.map((session, index) => (
                <div
                  key={session.uploadId}
                  style={
                    index < sessions.length - 1
                      ? {
                          borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorWarningBorder}`,
                        }
                      : undefined
                  }
                >
                  <BomImportProgressStrip
                    nested
                    progress={session.progress}
                    variant="resume"
                    onContinue={() => onContinue(session)}
                  />
                </div>
              ))}
            </Flex>
          ),
        },
      ]}
    />
  );
}

/**
 * Workspace pending uploads — 1 strip (`5202:21559`); 2+ collapsible (`5079:52504` collapsed default).
 * Portaled into shell slot directly under breadcrumbs (not inside `Content` padding).
 */
export function BomPendingUploadsRegion({ sessions, onContinue, defaultExpanded = false }: Props) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSlot(document.getElementById(BOM_SHELL_FLUSH_BELOW_BREADCRUMB_ID));
  }, []);

  if (sessions.length === 0) return null;

  const node = (
    <BomPendingUploadsShellSlot>
      <BomPendingUploadsBody
        sessions={sessions}
        onContinue={onContinue}
        defaultExpanded={defaultExpanded}
      />
    </BomPendingUploadsShellSlot>
  );

  if (slot) return createPortal(node, slot);
  return node;
}
