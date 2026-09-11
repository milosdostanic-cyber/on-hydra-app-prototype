import { EditOutlined } from '@ant-design/icons';

import {
  requirementCategoryLabel,
  verificationLabel,
} from '../constants/specStatusVocabulary';
import type { SpecCitation, SpecRequirement } from '../data/types';
import { SpecCitationLink } from './SpecCitationLink';
import { Button, Card, Flex, Typography, theme } from '../../ui/antd';
import { HydraTag } from '../../ui/HydraTag';

export function SpecRequirementCard({
  requirement,
  citations,
  onCorrect,
  onOpenCitation,
}: {
  requirement: SpecRequirement;
  citations: SpecCitation[];
  onCorrect?: (requirement: SpecRequirement) => void;
  onOpenCitation: (citation: SpecCitation) => void;
}) {
  const { token } = theme.useToken();

  return (
    <Card size="small" styles={{ body: { padding: token.paddingMD } }}>
      <Flex vertical gap={token.marginSM}>
        <Flex justify="space-between" gap={token.marginSM} wrap="wrap" align="flex-start">
          <Flex vertical gap={token.marginXXS} style={{ minWidth: 0, flex: 1 }}>
            <HydraTag>{requirementCategoryLabel[requirement.category]}</HydraTag>
            <Typography.Text strong>{requirement.value}</Typography.Text>
            {requirement.qualifier ? (
              <Typography.Text type="secondary">{requirement.qualifier}</Typography.Text>
            ) : null}
          </Flex>
          <HydraTag tone={requirement.verification === 'human-verified' ? 'success' : 'default'}>
            {verificationLabel[requirement.verification]}
          </HydraTag>
        </Flex>

        <Flex gap={token.marginXS} wrap="wrap" align="center">
          {citations.map((c) => (
            <SpecCitationLink key={c.id} citation={c} onOpen={onOpenCitation} />
          ))}
          {onCorrect ? (
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => onCorrect(requirement)}>
              Correct
            </Button>
          ) : null}
        </Flex>
      </Flex>
    </Card>
  );
}
