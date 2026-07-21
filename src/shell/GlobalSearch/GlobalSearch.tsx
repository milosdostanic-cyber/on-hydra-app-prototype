import { SearchOutlined } from '@ant-design/icons';
import { useRef } from 'react';

import { shellLayout } from '../../theme/hydraAlias';
import { SEARCH_SCOPE_PLACEHOLDERS } from '../../search/globalSearchModel';
import { Button, Drawer, Flex, Grid, Input, theme } from '../../ui/antd';

import { GlobalSearchPanel } from './GlobalSearchPanel';
import { SearchScopeSelector } from './SearchScopeSelector';
import { useGlobalSearchController } from './useGlobalSearchController';

type Props = {
  compact?: boolean;
};

export function GlobalSearch({ compact = false }: Props) {
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const controller = useGlobalSearchController();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isCompact = compact || !screens.lg;

  const panel = (
    <GlobalSearchPanel
      scope={controller.scope}
      query={controller.query}
      results={controller.results}
      loading={controller.loading}
      error={controller.error}
      belowThreshold={controller.belowThreshold}
      selectedResultKey={controller.selectedResultKey}
      recentSearches={controller.recentSearches}
      onResultSelect={controller.selectResult}
      onResultHover={controller.setSelectedIndex}
      onRunSearch={() => controller.runFullSearch()}
      onExampleSelect={controller.applyExample}
    />
  );

  const input = (
    <Input
      allowClear
      size="large"
      aria-label="Global search"
      placeholder={SEARCH_SCOPE_PLACEHOLDERS[controller.scope]}
      value={controller.query}
      onFocus={() => controller.setIsOpen(true)}
      onChange={(event) => {
        controller.setQuery(event.target.value);
        controller.setIsOpen(true);
      }}
      onKeyDown={controller.onKeyDown}
      prefix={
        <Flex align="center" gap={token.marginXS}>
          <SearchScopeSelector
            scope={controller.scope}
            onChange={(nextScope) => {
              controller.setScope(nextScope);
              controller.setIsOpen(true);
            }}
          />
          <SearchOutlined style={{ color: token.colorTextPlaceholder }} aria-hidden />
        </Flex>
      }
      styles={{
        input: {
          minWidth: 0,
        },
      }}
      style={{
        background: token.colorBgContainer,
        borderColor: controller.isOpen ? token.colorPrimary : token.colorBorderSecondary,
        boxShadow: controller.isOpen ? `0 0 0 ${token.controlOutlineWidth}px ${token.colorPrimaryBg}` : undefined,
      }}
    />
  );

  if (isCompact) {
    return (
      <>
        <Button
          type="text"
          aria-label="Open global search"
          icon={<SearchOutlined />}
          onClick={() => controller.setIsOpen(true)}
          styles={{ icon: { color: token.colorTextLightSolid } }}
          style={{ color: token.colorTextLightSolid }}
        />
        <Drawer
          title="Search ConnectED"
          placement="top"
          height="100vh"
          open={controller.isOpen}
          onClose={() => controller.setIsOpen(false)}
          styles={{
            body: { background: token.colorBgLayout, padding: token.paddingLG },
          }}
        >
          <Flex vertical gap={token.marginSM}>
            {input}
            {panel}
          </Flex>
        </Drawer>
      </>
    );
  }

  return (
    <div
      ref={wrapperRef}
      onBlur={(event) => {
        if (!wrapperRef.current?.contains(event.relatedTarget as Node | null)) {
          controller.setIsOpen(false);
        }
      }}
      style={{
        position: 'relative',
        flex: '1 1 auto',
        minWidth: shellLayout.topBarSearchWidth,
        maxWidth: 560,
      }}
    >
      {input}
      {controller.isOpen ? (
        <div
          style={{
            position: 'absolute',
            insetInline: 0,
            top: 'calc(100% + 8px)',
            zIndex: token.zIndexPopupBase,
          }}
        >
          {panel}
        </div>
      ) : null}
    </div>
  );
}
