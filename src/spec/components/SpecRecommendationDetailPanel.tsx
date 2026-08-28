import { CloseOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { useEffect, useState, type ReactNode } from 'react';

import {
  hydraBaseNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading5,
} from '../../theme/hydraTypography';
import {
  Button,
  Card,
  Empty,
  Flex,
  Input,
  Typography,
  theme,
} from '../../ui/antd';
import type { SpecRecommendation, SpecRecommendationDecision } from '../data/types';
import { SpecPanelScrollBody } from '../layout/SpecPanelScrollBody';
import { SpecRecommendationTags } from './SpecRecommendationTags';

function DiffPanel({
  label,
  variant,
  children,
}: {
  label: string;
  variant: 'current' | 'proposed';
  children: ReactNode;
}) {
  const { token } = theme.useToken();
  const isCurrent = variant === 'current';

  return (
    <Flex
      vertical
      gap={token.marginXXS}
      style={{
        minWidth: 0,
        padding: token.paddingSM,
        borderRadius: token.borderRadius,
        background: isCurrent ? token.colorErrorBg : token.colorSuccessBg,
        border: `${token.lineWidth}px ${token.lineType} ${
          isCurrent ? token.colorErrorBorder : token.colorSuccessBorder
        }`,
      }}
    >
      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
        {label}
      </Typography.Text>
      {children}
    </Flex>
  );
}

function EmbeddedRecommendationTags({
  recommendation,
}: {
  recommendation: SpecRecommendation;
}) {
  return <SpecRecommendationTags recommendation={recommendation} />;
}

function RecommendationNavButtons({
  position,
  total,
  onPrevious,
  onNext,
}: {
  position: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const { token } = theme.useToken();

  return (
    <Flex gap={token.marginXXS}>
      <Button
        type="text"
        size="small"
        icon={<UpOutlined />}
        disabled={position <= 1}
        onClick={onPrevious}
        aria-label="Previous recommendation"
      />
      <Button
        type="text"
        size="small"
        icon={<DownOutlined />}
        disabled={position >= total}
        onClick={onNext}
        aria-label="Next recommendation"
      />
    </Flex>
  );
}

export function SpecRecommendationDetailPanel({
  recommendation,
  position,
  total,
  embedded,
  readOnly,
  saving,
  onPrevious,
  onNext,
  onClose,
  onOpenSource,
  onSaveProposal,
  onDecision,
}: {
  recommendation?: SpecRecommendation;
  position: number;
  total: number;
  /** Review & Edit rail — Figma `5:19173` detail layout. */
  embedded?: boolean;
  readOnly?: boolean;
  saving?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onClose?: () => void;
  onOpenSource: () => void;
  onSaveProposal?: (proposedText: string) => void | Promise<void>;
  onDecision: (
    decision: Exclude<SpecRecommendationDecision, 'not-reviewed'>,
    options?: { proposedText?: string },
  ) => void;
}) {
  const { token } = theme.useToken();
  const [proposalDraft, setProposalDraft] = useState('');

  useEffect(() => {
    if (!recommendation) return;
    setProposalDraft(recommendation.proposedText);
  }, [recommendation?.id, recommendation?.proposedText]);

  if (!recommendation) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No recommendation selected." />;
  }

  const whyCopy =
    recommendation.reason.trim() ||
    'No additional rationale was recorded for this recommendation.';
  const alreadyDecided = recommendation.decision !== 'not-reviewed';
  const canEditProposal =
    recommendation.decision === 'not-reviewed' && !readOnly && Boolean(onSaveProposal);

  const accept = () => {
    const finalProposal = proposalDraft.trim() || recommendation.proposedText;
    if (canEditProposal && finalProposal !== recommendation.proposedText) {
      void Promise.resolve(onSaveProposal?.(finalProposal)).then(() =>
        onDecision('accepted', { proposedText: finalProposal }),
      );
      return;
    }
    onDecision('accepted', { proposedText: finalProposal });
  };

  if (embedded) {
    const bodyText = hydraTextStyleToReactCss(hydraBaseNormal);
    const labelText = {
      ...bodyText,
      color: token.colorTextDescription,
    };
    const panelBorder = `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`;
    const panelChrome = {
      background: token.colorBgContainer,
      borderRadius: token.borderRadiusLG,
      boxShadow: token.boxShadowTertiary,
      border: panelBorder,
    } as const;

    return (
      <Flex
        vertical
        style={{
          height: '100%',
          minHeight: 0,
          width: '100%',
          overflow: 'hidden',
          ...panelChrome,
        }}
      >
        <Flex
          justify="space-between"
          align="center"
          gap={token.marginXS}
          style={{
            flexShrink: 0,
            width: '100%',
            padding: token.padding,
          }}
        >
          <Typography.Title
            level={5}
            style={{
              margin: 0,
              minWidth: 0,
              flex: 1,
              ...hydraTextStyleToReactCss(hydraTitleHeading5),
            }}
          >
            {`Recommendation ${position} of ${total}`}
          </Typography.Title>
          <Flex align="center" gap={token.marginXXS} style={{ flexShrink: 0 }}>
            <RecommendationNavButtons
              position={position}
              total={total}
              onPrevious={onPrevious}
              onNext={onNext}
            />
            {onClose ? (
              <Button
                type="text"
                icon={<CloseOutlined />}
                aria-label="Close recommendation detail"
                onClick={onClose}
              />
            ) : null}
          </Flex>
        </Flex>

        <SpecPanelScrollBody>
          <Flex
            vertical
            gap={token.marginSM}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              paddingInline: token.padding,
              paddingBlockEnd: token.padding,
            }}
          >
            <EmbeddedRecommendationTags recommendation={recommendation} />

            <Flex vertical gap={token.padding}>
              <Flex vertical gap={token.marginXXS}>
                <Typography.Text style={labelText}>Current text</Typography.Text>
                <Typography.Paragraph style={{ marginBottom: 0, color: token.colorText, ...bodyText }}>
                  {recommendation.existingText}
                </Typography.Paragraph>
              </Flex>

              <Flex vertical gap={token.marginXXS}>
                <Typography.Text style={labelText}>Suggested text</Typography.Text>
                {canEditProposal ? (
                  <Input.TextArea
                    autoSize={{ minRows: 4, maxRows: 8 }}
                    value={proposalDraft}
                    onChange={(event) => setProposalDraft(event.target.value)}
                    style={{
                      ...bodyText,
                      background: token.colorBgContainer,
                      borderColor: token.colorSuccessBorder,
                    }}
                  />
                ) : (
                  <Typography.Paragraph style={{ marginBottom: 0, ...bodyText }}>
                    {recommendation.proposedText}
                  </Typography.Paragraph>
                )}
              </Flex>
            </Flex>

            <Flex
              vertical
              gap={token.marginXXS}
              style={{
                padding: token.paddingSM,
                borderRadius: token.borderRadiusLG,
                border: `${token.lineWidth}px ${token.lineType} ${token.colorInfoBorder}`,
                background: token.colorInfoBg,
              }}
            >
              <Typography.Text style={labelText}>Why this is recommended?</Typography.Text>
              <Typography.Paragraph style={{ marginBottom: 0, ...bodyText }}>
                {whyCopy}
              </Typography.Paragraph>
            </Flex>
          </Flex>
        </SpecPanelScrollBody>

        <Flex
          gap={token.marginXS}
          style={{ flexShrink: 0, width: '100%', padding: token.padding }}
        >
          <Button
            disabled={readOnly || alreadyDecided}
            loading={saving}
            onClick={() => onDecision('denied')}
            style={{ flex: 1 }}
          >
            Decline
          </Button>
          <Button
            disabled={readOnly || alreadyDecided}
            loading={saving}
            onClick={() => onDecision('later')}
            style={{ flex: 1 }}
          >
            Review later
          </Button>
          <Button
            type="primary"
            disabled={readOnly || alreadyDecided}
            loading={saving}
            onClick={accept}
            style={{ flex: 1 }}
          >
            Accept fix
          </Button>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex vertical gap={token.marginMD}>
      <Flex justify="space-between" align="center" gap={token.marginXS} wrap="wrap">
        <Typography.Title level={5} style={{ margin: 0 }}>
          Recommended action{' '}
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {position} of {total}
          </Typography.Text>
        </Typography.Title>
        <RecommendationNavButtons
          position={position}
          total={total}
          onPrevious={onPrevious}
          onNext={onNext}
        />
      </Flex>

      <Flex gap={token.marginXS}>
        <Button
          size="large"
          disabled={readOnly || alreadyDecided}
          loading={saving}
          onClick={() => onDecision('denied')}
          style={{ flex: 1 }}
        >
          Decline
        </Button>
        <Button
          type="primary"
          size="large"
          disabled={readOnly || alreadyDecided}
          loading={saving}
          onClick={accept}
          style={{ flex: 1 }}
        >
          Accept fix
        </Button>
      </Flex>
      {alreadyDecided ? null : (
        <Button
          type="link"
          size="small"
          disabled={readOnly}
          onClick={() => onDecision('later')}
          style={{ alignSelf: 'flex-start', paddingInline: 0 }}
        >
          Review later
        </Button>
      )}

      <EmbeddedRecommendationTags recommendation={recommendation} />

      <Flex vertical gap={token.marginXXS}>
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          Section {recommendation.sectionNumber} · Paragraph {recommendation.paragraphLabel}
        </Typography.Text>
        <Typography.Text strong>{recommendation.title}</Typography.Text>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {whyCopy}
        </Typography.Paragraph>
      </Flex>

      <Flex vertical gap={token.marginSM}>
        <DiffPanel label="Current text" variant="current">
          <Typography.Paragraph style={{ marginBottom: 0, color: token.colorText }}>
            {recommendation.existingText}
          </Typography.Paragraph>
        </DiffPanel>
        <DiffPanel label="Suggested text" variant="proposed">
          {canEditProposal ? (
            <Flex vertical gap={token.marginXS}>
              <Input.TextArea
                autoSize={{ minRows: 3, maxRows: 8 }}
                value={proposalDraft}
                onChange={(event) => setProposalDraft(event.target.value)}
                style={{ background: token.colorBgContainer }}
              />
              <Button
                size="small"
                disabled={!proposalDraft.trim() || proposalDraft.trim() === recommendation.proposedText}
                loading={saving}
                onClick={() => onSaveProposal?.(proposalDraft.trim())}
                style={{ alignSelf: 'flex-start' }}
              >
                Save proposal
              </Button>
            </Flex>
          ) : (
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              {recommendation.proposedText}
            </Typography.Paragraph>
          )}
        </DiffPanel>
      </Flex>

      {recommendation.productEvidence.length > 0 ? (
        <Flex vertical gap={token.marginXS}>
          <Typography.Text strong>Catalog products</Typography.Text>
          {recommendation.productEvidence.map((product) => (
            <Card
              key={product.suggestionId}
              size="small"
              style={{ background: token.colorPrimaryBg, borderColor: token.colorPrimaryBorder }}
            >
              <Flex vertical gap={token.marginXXS}>
                <Typography.Text strong>
                  {product.sku} · {product.name}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                  {product.fitReason}
                </Typography.Text>
              </Flex>
            </Card>
          ))}
        </Flex>
      ) : null}

      <Card size="small" style={{ background: token.colorInfoBg, borderColor: token.colorInfoBorder }}>
        <Typography.Text type="secondary">{recommendation.outcome}</Typography.Text>
      </Card>

      <Button type="link" size="small" onClick={onOpenSource} style={{ alignSelf: 'flex-start', paddingInline: 0 }}>
        Show in document
      </Button>
    </Flex>
  );
}
