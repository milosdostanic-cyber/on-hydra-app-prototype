import type { SpecAiProposal, SpecCitation } from '../data/types';
import { SpecCitationLink } from './SpecCitationLink';
import { Button, Card, Flex, Typography, theme } from '../../ui/antd';
import { HydraTag } from '../../ui/HydraTag';

/**
 * G6 — AI proposal card. Accept / Reject only; working copy updates on Accept (AC-018).
 * Commercially motivated proposals show a persistent ASC suggestion tag (AC-019).
 */
export function SpecProposalCard({
  proposal,
  citations,
  canAct,
  onAccept,
  onReject,
  onOpenCitation,
}: {
  proposal: SpecAiProposal;
  citations: SpecCitation[];
  canAct: boolean;
  onAccept: (proposal: SpecAiProposal) => void;
  onReject: (proposal: SpecAiProposal) => void;
  onOpenCitation: (citation: SpecCitation) => void;
}) {
  const { token } = theme.useToken();
  const isPending = proposal.status === 'pending';
  const surface = proposal.commerciallyMotivated ? token.colorWarningBg : token.colorPrimaryBg;

  return (
    <Card
      size="small"
      styles={{
        body: {
          padding: token.paddingMD,
          background: surface,
        },
      }}
    >
      <Flex vertical gap={token.marginSM}>
        <Flex gap={token.marginXS} wrap="wrap" align="center">
          <HydraTag tone="processing">AI proposal</HydraTag>
          {proposal.commerciallyMotivated ? (
            <HydraTag tone="warning">ASC suggestion</HydraTag>
          ) : null}
          {!isPending ? (
            <HydraTag tone={proposal.status === 'accepted' ? 'success' : 'default'}>
              {proposal.status === 'accepted' ? 'Accepted' : 'Rejected'}
            </HydraTag>
          ) : null}
        </Flex>

        <div>
          <Typography.Text type="secondary">Original</Typography.Text>
          <Typography.Paragraph delete type="secondary" style={{ marginBottom: token.marginXS }}>
            {proposal.originalText}
          </Typography.Paragraph>
          <Typography.Text type="secondary">Proposed</Typography.Text>
          <Typography.Paragraph style={{ marginBottom: 0 }}>{proposal.proposedText}</Typography.Paragraph>
        </div>

        <Typography.Text type="secondary">{proposal.rationale}</Typography.Text>

        {citations.length > 0 ? (
          <Flex gap={token.marginXS} wrap="wrap">
            {citations.map((c) => (
              <SpecCitationLink key={c.id} citation={c} onOpen={onOpenCitation} />
            ))}
          </Flex>
        ) : null}

        {canAct && isPending ? (
          <Flex gap={token.marginXS}>
            <Button type="primary" size="small" onClick={() => onAccept(proposal)}>
              Accept
            </Button>
            <Button size="small" onClick={() => onReject(proposal)}>
              Reject
            </Button>
          </Flex>
        ) : null}
      </Flex>
    </Card>
  );
}
