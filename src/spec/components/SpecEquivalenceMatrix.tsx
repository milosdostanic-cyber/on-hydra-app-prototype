import type { TableColumnsType } from '../../ui/antd';
import { Flex, Table, Typography, theme } from '../../ui/antd';
import { HydraTag } from '../../ui/HydraTag';
import {
  equivalenceOutcomeLabel,
  equivalenceOutcomeTone,
} from '../constants/specStatusVocabulary';
import type { SpecEquivalenceAttribute } from '../data/types';

/**
 * PRD FR-15 — attribute-by-attribute equivalence matrix.
 * Every outcome carries a text label, never colour alone (AC-040), and a
 * `does-not-meet` row is rendered as prominently as a passing one so the
 * request cannot paper over non-compliance (AC-FR-15).
 */
export function SpecEquivalenceMatrix({
  attributes,
  onOpenCitation,
}: {
  attributes: SpecEquivalenceAttribute[];
  onOpenCitation?: (citationId: string) => void;
}) {
  const { token } = theme.useToken();

  const columns: TableColumnsType<SpecEquivalenceAttribute> = [
    {
      title: 'Attribute',
      dataIndex: 'attribute',
      key: 'attribute',
      render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
    },
    {
      title: 'Specified',
      dataIndex: 'specifiedValue',
      key: 'specifiedValue',
      render: (value: string, row) => (
        <Flex vertical gap={token.marginXXS}>
          <Typography.Text>{value}</Typography.Text>
          {row.citationId && onOpenCitation ? (
            <Typography.Link onClick={() => onOpenCitation(row.citationId!)}>
              View citation
            </Typography.Link>
          ) : null}
        </Flex>
      ),
    },
    {
      title: 'Proposed ASC equal',
      dataIndex: 'proposedValue',
      key: 'proposedValue',
    },
    {
      title: 'Outcome',
      dataIndex: 'outcome',
      key: 'outcome',
      render: (_value, row) => (
        <Flex vertical gap={token.marginXXS}>
          <HydraTag tone={equivalenceOutcomeTone(row.outcome)}>
            {equivalenceOutcomeLabel[row.outcome]}
          </HydraTag>
          {row.note ? (
            <Typography.Text
              type={row.outcome === 'does-not-meet' ? 'danger' : 'secondary'}
            >
              {row.note}
            </Typography.Text>
          ) : null}
        </Flex>
      ),
    },
  ];

  return (
    <Table<SpecEquivalenceAttribute>
      size="small"
      rowKey="id"
      columns={columns}
      dataSource={attributes}
      pagination={false}
      scroll={{ x: 'max-content' }}
    />
  );
}
