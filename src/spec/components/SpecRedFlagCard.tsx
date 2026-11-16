import {
  redFlagStateLabel,
  redFlagTypeLabel,
} from '../constants/specStatusVocabulary';
import type { SpecCitation, SpecRedFlag } from '../data/types';
import { SpecCitationLink } from './SpecCitationLink';
import { SpecSeverityBadge } from './SpecSeverityBadge';
import { Badge, Card, Flex, Typography, theme } from '../../ui/antd';
import { HydraTag } from '../../ui/HydraTag';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

export function SpecRedFlagCard({
  flag,
  citations,
  onOpenCitation,
  onSelect,
  selected,
}: {
  flag: SpecRedFlag;
  citations: SpecCitation[];
  onOpenCitation: (citation: SpecCitation) => void;
  onSelect?: (flag: SpecRedFlag) => void;
  selected?: boolean;
}) {
  const { token } = theme.useToken();

  return (
    <Card
      size="small"
      hoverable={Boolean(onSelect)}
      onClick={() => onSelect?.(flag)}
      styles={{ body: { padding: token.paddingMD } }}
      style={{
        borderColor: selected ? token.colorPrimary : undefined,
        background: selected ? token.colorPrimaryBg : undefined,
      }}
    >
      <Flex vertical gap={token.marginSM}>
        <Flex justify="space-between" gap={token.marginSM} wrap="wrap">
          <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{flag.title}</Typography.Text>
          <SpecSeverityBadge severity={flag.severity} />
        </Flex>
        <Flex gap={token.marginXXS} wrap="wrap">
          <HydraTag>{redFlagTypeLabel[flag.type]}</HydraTag>
          <Badge status="warning" text={redFlagStateLabel[flag.state]} />
        </Flex>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {flag.explanation}
        </Typography.Paragraph>
        <Flex gap={token.marginXS} wrap="wrap">
          {citations.map((c) => (
            <SpecCitationLink key={c.id} citation={c} onOpen={onOpenCitation} />
          ))}
        </Flex>
      </Flex>
    </Card>
  );
}
