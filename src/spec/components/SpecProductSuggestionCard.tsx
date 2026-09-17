import {
  productFitLabel,
  productFitTone,
  productSuggestionStatusLabel,
} from '../constants/specStatusVocabulary';
import type { SpecProductSuggestion } from '../data/types';
import { Button, Card, Flex, Typography, theme } from '../../ui/antd';
import { HydraTag } from '../../ui/HydraTag';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

/**
 * Local product suggestion card — mirrors BOM SkuMatchCard composition without shared edits.
 */
export function SpecProductSuggestionCard({
  suggestion,
  selected,
  canAct,
  onSelect,
  onDismiss,
  onAddToSubstitution,
}: {
  suggestion: SpecProductSuggestion;
  selected?: boolean;
  canAct: boolean;
  onSelect: (suggestion: SpecProductSuggestion) => void;
  onDismiss: (suggestion: SpecProductSuggestion) => void;
  onAddToSubstitution: (suggestion: SpecProductSuggestion) => void;
}) {
  const { token } = theme.useToken();
  const isNoFit = suggestion.fit === 'no-fit';
  const actionable =
    canAct &&
    suggestion.status !== 'dismissed' &&
    suggestion.status !== 'added-to-substitution' &&
    !isNoFit;

  return (
    <Card
      size="small"
      styles={{
        body: {
          padding: token.paddingMD,
          background: token.colorBgContainer,
          borderInlineStart: suggestion.commerciallyMotivated
            ? `${token.lineWidthBold}px ${token.lineType} ${token.colorWarning}`
            : undefined,
          outline: selected ? `${token.lineWidthBold}px solid ${token.colorPrimary}` : undefined,
        },
      }}
    >
      <Flex vertical gap={token.marginSM}>
        <Flex vertical gap={token.marginXXS} style={{ minWidth: 0 }}>
          <Flex gap={token.marginXS} wrap="wrap" align="center">
            {suggestion.commerciallyMotivated ? (
              <HydraTag tone="warning">ASC suggestion</HydraTag>
            ) : (
              <HydraTag>Neutral notice</HydraTag>
            )}
            <HydraTag tone={productFitTone(suggestion.fit)}>{productFitLabel[suggestion.fit]}</HydraTag>
            <HydraTag>{productSuggestionStatusLabel[suggestion.status]}</HydraTag>
          </Flex>
          <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{suggestion.name}</Typography.Text>
          <Typography.Text type="secondary">
            {suggestion.sku}
            {suggestion.series ? ` · ${suggestion.series}` : ''}
          </Typography.Text>
        </Flex>

        <Typography.Text type="secondary">{suggestion.fitReason}</Typography.Text>

        <Flex gap={token.marginXXS} wrap="wrap">
          {suggestion.attributeTags.map((tag) => (
            <HydraTag key={tag}>{tag}</HydraTag>
          ))}
        </Flex>

        {actionable ? (
          <Flex gap={token.marginXS} wrap="wrap">
            <Button type="primary" size="small" onClick={() => onSelect(suggestion)}>
              Select
            </Button>
            <Button size="small" onClick={() => onAddToSubstitution(suggestion)}>
              Add to substitution
            </Button>
            <Button size="small" onClick={() => onDismiss(suggestion)}>
              Dismiss
            </Button>
          </Flex>
        ) : null}
      </Flex>
    </Card>
  );
}
