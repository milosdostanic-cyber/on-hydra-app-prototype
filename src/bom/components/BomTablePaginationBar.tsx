import type { ReactNode } from 'react';

import { shellLayout } from '../../theme/hydraAlias';
import { Flex, Pagination, theme } from '../../ui/antd';

type Props = {
  current: number;
  total: number;
  onChange: (page: number) => void;
  pageSize?: number;
  /** Optional left-side summary (e.g. “12 projects found”). */
  summary?: ReactNode;
};

/** Shared table footer pagination for BOM list screens (antd default pager, not `simple`). */
export function BomTablePaginationBar({
  current,
  total,
  onChange,
  pageSize = shellLayout.tablePageSizeDefault,
  summary,
}: Props) {
  const { token } = theme.useToken();

  if (total <= 0) return null;

  return (
    <Flex
      justify={summary ? 'space-between' : 'flex-end'}
      align="center"
      wrap="wrap"
      gap={token.marginSM}
      style={{
        paddingInline: token.paddingMD,
        paddingBlock: token.paddingSM,
        borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
      }}
    >
      {summary ?? null}
      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        onChange={onChange}
        showSizeChanger={false}
      />
    </Flex>
  );
}
