import {
  processingBadgeStatus,
  processingStateLabel,
  reviewStateLabel,
} from '../constants/specStatusVocabulary';
import type { ReactNode } from 'react';

import type { SpecDocument } from '../data/types';
import { Badge, Flex, Tabs, Typography, theme } from '../../ui/antd';
import type { TabsProps } from '../../ui/antd';
import { BomPageHeader } from '../../bom/layout/BomPageHeader';
import { HydraTag } from '../../ui/HydraTag';

export function SpecWorkspaceHeader({
  document,
  projectName,
  tabItems,
  activeTab,
  onTabChange,
  actions,
}: {
  document: SpecDocument;
  projectName?: string;
  tabItems?: TabsProps['items'];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  actions?: ReactNode;
}) {
  const { token } = theme.useToken();

  return (
    <Flex vertical gap={token.marginMD} style={{ width: '100%' }}>
      <BomPageHeader
        title={document.title}
        description={
          <Flex gap={token.marginSM} wrap="wrap" align="center">
            {projectName ? <Typography.Text type="secondary">{projectName}</Typography.Text> : null}
            <HydraTag>{document.versionLabel}</HydraTag>
            <Badge
              status={processingBadgeStatus(document.processingState)}
              text={processingStateLabel[document.processingState]}
            />
            <Typography.Text type="secondary">{reviewStateLabel[document.reviewState]}</Typography.Text>
            <Typography.Text type="secondary">
              Updated {new Date(document.updatedAt).toLocaleString()}
            </Typography.Text>
          </Flex>
        }
        actions={actions}
      />
      {tabItems && tabItems.length > 0 ? (
        <Tabs activeKey={activeTab} items={tabItems} onChange={onTabChange} />
      ) : null}
    </Flex>
  );
}
