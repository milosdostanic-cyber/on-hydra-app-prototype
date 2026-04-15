import { CheckCircleOutlined, CheckOutlined, CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { suggestedAscPartForRow, isWorkspaceRowConfirmed } from '../bomWorkspaceHelpers';
import { useBomWorkspaceRows } from '../../context/BomWorkspaceContext';
import { BomPageHeader } from '../layout/BomPageHeader';
import {
  Button,
  Card,
  Divider,
  Flex,
  InputNumber,
  Progress,
  Space,
  Tag,
  Typography,
  message,
  theme,
} from '../../ui/antd';
import type { AscCatalogPart, BomItem } from '../data/types';

function confidenceColor(conf: number) {
  return conf >= 90 ? 'success' : conf >= 75 ? 'warning' : 'error';
}
function riskColor(risk: string) {
  return risk === 'low' ? 'success' : risk === 'medium' ? 'warning' : 'error';
}

function FieldRow({ label, value }: { label: string; value: string | number | undefined }) {
  const { token } = theme.useToken();
  return (
    <div>
      <Typography.Text
        style={{
          color: token.colorTextTertiary,
          fontSize: token.fontSizeSM,
          display: 'block',
          marginBottom: token.marginXXS,
        }}
      >
        {label}
      </Typography.Text>
      <Typography.Text strong>{value ?? '—'}</Typography.Text>
    </div>
  );
}

export function BomTranslatePage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const { rows, setRows } = useBomWorkspaceRows(bomProjectId);

  const translateQueue = useMemo(() => rows.filter((r) => !isWorkspaceRowConfirmed(r)), [rows]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (translateQueue.length === 0) {
      message.info('All items are already confirmed.');
      navigate(`/bom/projects/${bomProjectId}/workspace`, { replace: true });
    }
  }, [translateQueue.length, bomProjectId, navigate]);

  const total = translateQueue.length;
  const currentItem: BomItem | undefined = translateQueue[currentIndex];
  const currentAscPart: AscCatalogPart | undefined = currentItem ? suggestedAscPartForRow(currentItem) : undefined;
  const isItemConfirmed = currentItem ? confirmed.has(currentItem.id) : false;
  const isSkipped = currentItem ? skipped.has(currentItem.id) : false;
  const processedCount = confirmed.size + skipped.size;
  const allDone = total > 0 && processedCount === total;

  useEffect(() => {
    if (currentItem && quantities[currentItem.id] === undefined) {
      setQuantities((q) => ({ ...q, [currentItem.id]: currentItem.quantity }));
    }
  }, [currentItem, quantities]);

  function exit() {
    navigate(`/bom/projects/${bomProjectId}/workspace`);
  }

  function goNext() {
    if (currentIndex < total - 1) setCurrentIndex((i) => i + 1);
  }

  function goPrev() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  function handleConfirm() {
    if (!currentItem || !currentAscPart) return;
    const qty = quantities[currentItem.id] ?? currentItem.quantity;
    setRows((prev) =>
      prev.map((r) =>
        r.id === currentItem.id
          ? {
              ...r,
              status: 'confirmed' as const,
              confidence: r.confidence === 'low' ? 'medium' : 'high',
              originalInput: currentAscPart.partNumber,
              parsedDescription: currentAscPart.description,
              quantity: qty,
            }
          : r,
      ),
    );
    setConfirmed((prev) => new Set(prev).add(currentItem.id));
    message.success(`Confirmed: ${currentAscPart.partNumber}`);
    if (currentIndex < total - 1) setCurrentIndex((i) => i + 1);
  }

  function handleSkip() {
    if (!currentItem) return;
    setSkipped((prev) => new Set(prev).add(currentItem.id));
    if (currentIndex < total - 1) setCurrentIndex((i) => i + 1);
  }

  const panelStyle = {
    flex: 1,
    minWidth: 0,
    borderRadius: token.borderRadiusLG,
    padding: token.paddingMD,
  };

  if (translateQueue.length === 0) {
    return null;
  }

  if (allDone) {
    return (
      <Flex
        vertical
        align="center"
        justify="center"
        gap={token.marginLG}
        style={{ minHeight: 400, width: '100%' }}
      >
        <CheckCircleOutlined style={{ fontSize: token.fontSizeHeading1, color: token.colorSuccess }} />
        <Flex vertical align="center" gap={token.marginXS}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Translation complete
          </Typography.Title>
          <Typography.Text type="secondary">
            {confirmed.size} confirmed · {skipped.size} skipped
          </Typography.Text>
        </Flex>
        <Flex gap={token.marginSM}>
          <Button
            onClick={() => {
              setCurrentIndex(0);
              setConfirmed(new Set());
              setSkipped(new Set());
            }}
          >
            Start over
          </Button>
          <Button type="primary" size="large" onClick={exit}>
            Return to workspace
          </Button>
        </Flex>
      </Flex>
    );
  }

  if (!currentItem) return null;

  return (
    <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
      <BomPageHeader
        title="Translate BOM lines"
        description="Confirm or skip each unresolved line before returning to the workspace."
        actions={
          <Button size="large" icon={<CloseOutlined />} onClick={exit}>
            Exit
          </Button>
        }
      />
      <Card styles={{ body: { padding: `${token.paddingSM}px ${token.paddingMD}px` } }}>
        <Flex align="center" gap={token.marginMD}>
          <Flex vertical gap={token.marginXXS} style={{ flexShrink: 0 }}>
            <Typography.Text strong style={{ fontSize: token.fontSizeSM, lineHeight: 1 }}>
              {currentIndex + 1}{' '}
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                / {total}
              </Typography.Text>
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {processedCount} reviewed
            </Typography.Text>
          </Flex>
          <Progress
            percent={Math.round((processedCount / total) * 100)}
            showInfo={false}
            strokeColor={token.colorPrimary}
            style={{ flex: 1, margin: 0 }}
          />
          <Flex gap={token.marginXXS} style={{ flexShrink: 0 }}>
            <Tag color="success" style={{ margin: 0 }}>
              {confirmed.size} confirmed
            </Tag>
            <Tag color="default" style={{ margin: 0 }}>
              {skipped.size} skipped
            </Tag>
          </Flex>
        </Flex>
      </Card>

      <Card styles={{ body: { padding: 0 } }}>
        <Flex
          align="center"
          justify="space-between"
          style={{
            paddingInline: token.paddingMD,
            paddingBlock: token.paddingSM,
            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          }}
        >
          <Flex align="center" gap={token.marginSM}>
            <Typography.Text strong>Item {currentIndex + 1}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {currentItem.parsedDescription}
            </Typography.Text>
          </Flex>
          {isItemConfirmed ? (
            <Tag color="success" style={{ margin: 0 }}>
              Confirmed
            </Tag>
          ) : null}
          {isSkipped ? (
            <Tag color="default" style={{ margin: 0 }}>
              Skipped
            </Tag>
          ) : null}
        </Flex>

        {currentAscPart ? (
          <Flex
            gap={token.marginSM}
            align="center"
            wrap="wrap"
            style={{
              paddingInline: token.paddingMD,
              paddingBlock: token.paddingXS,
              background: token.colorFillAlter,
              borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            }}
          >
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              Match confidence:
            </Typography.Text>
            <Tag color={confidenceColor(currentAscPart.matchConfidence)} style={{ margin: 0 }}>
              {currentAscPart.matchConfidence}%
            </Tag>
            <Divider type="vertical" style={{ margin: 0 }} />
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              Substitution risk:
            </Typography.Text>
            <Tag color={riskColor(currentAscPart.substitutionRisk)} style={{ margin: 0, textTransform: 'capitalize' }}>
              {currentAscPart.substitutionRisk}
            </Tag>
            <Divider type="vertical" style={{ margin: 0 }} />
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              Rule: {currentAscPart.conversionRule}
            </Typography.Text>
          </Flex>
        ) : null}

        <Flex gap={token.marginMD} align="stretch" style={{ padding: token.paddingMD }}>
          <div
            style={{
              ...panelStyle,
              background: token.colorFillAlter,
              border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            }}
          >
            <Typography.Text
              strong
              style={{
                display: 'block',
                marginBottom: token.marginSM,
                fontSize: token.fontSizeSM,
                color: token.colorTextSecondary,
              }}
            >
              ORIGINAL PART
            </Typography.Text>
            <Divider style={{ marginBlock: token.marginXS }} />
            <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
              <FieldRow label="Description" value={currentItem.parsedDescription} />
              <FieldRow label="Figure Number" value={currentItem.originalInput} />
              <FieldRow label="Size" value={currentItem.size} />
              <FieldRow label="Qty" value={currentItem.quantity} />
            </Space>
          </div>

          <Flex align="center" justify="center" style={{ flexShrink: 0 }}>
            <Flex
              align="center"
              justify="center"
              style={{
                width: token.controlHeight,
                height: token.controlHeight,
                borderRadius: '50%',
                background: currentAscPart ? token.colorPrimaryBg : token.colorFillSecondary,
                border: `${token.lineWidth}px ${token.lineType} ${currentAscPart ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
              }}
            >
              <RightOutlined
                style={{
                  color: currentAscPart ? token.colorPrimary : token.colorTextTertiary,
                  fontSize: token.fontSizeSM,
                }}
              />
            </Flex>
          </Flex>

          <div
            style={{
              ...panelStyle,
              background: currentAscPart ? token.colorPrimaryBg : token.colorFillQuaternary,
              border: `${token.lineWidth}px ${token.lineType} ${currentAscPart ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
            }}
          >
            <Typography.Text
              strong
              style={{
                display: 'block',
                marginBottom: token.marginSM,
                fontSize: token.fontSizeSM,
                color: currentAscPart ? token.colorPrimary : token.colorTextTertiary,
              }}
            >
              ASC PART
            </Typography.Text>
            <Divider style={{ marginBlock: token.marginXS }} />
            {currentAscPart ? (
              <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
                <FieldRow label="Description" value={currentAscPart.description} />
                <FieldRow label="Brand" value={currentAscPart.productFamily} />
                <FieldRow label="Part Number" value={currentAscPart.partNumber} />
                <FieldRow label="Dimensions" value={currentAscPart.dimensions} />
                <div>
                  <Typography.Text
                    style={{
                      color: token.colorTextTertiary,
                      fontSize: token.fontSizeSM,
                      display: 'block',
                      marginBottom: token.marginXS,
                    }}
                  >
                    Qty
                  </Typography.Text>
                  <InputNumber
                    min={1}
                    value={quantities[currentItem.id] ?? currentItem.quantity}
                    onChange={(v) =>
                      setQuantities((q) => ({
                        ...q,
                        [currentItem.id]: typeof v === 'number' ? v : currentItem.quantity,
                      }))
                    }
                    size="large"
                    style={{ width: token.controlHeight * 3 }}
                  />
                </div>
              </Space>
            ) : (
              <Flex align="center" justify="center" style={{ minHeight: token.controlHeight * 4 }}>
                <Typography.Text type="secondary">No ASC match found</Typography.Text>
              </Flex>
            )}
          </div>
        </Flex>

        <Flex
          align="center"
          justify="space-between"
          style={{
            paddingInline: token.paddingMD,
            paddingBlock: token.paddingSM,
            borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          }}
        >
          <Button icon={<LeftOutlined />} onClick={goPrev} disabled={currentIndex === 0}>
            Previous
          </Button>

          <Flex gap={token.marginSM}>
            <Button onClick={handleSkip}>Skip</Button>
            <Button
              onClick={() =>
                navigate(`/bom/projects/${bomProjectId}/asc-products`, {
                  state: { swapRowId: currentItem.id, swapSource: { partNumber: currentItem.originalInput, description: currentItem.parsedDescription, size: currentItem.size, category: currentItem.category } },
                })
              }
            >
              Not the right part
            </Button>
            {currentAscPart ? (
              <Button type="primary" icon={<CheckOutlined />} onClick={handleConfirm}>
                Confirm match
              </Button>
            ) : (
              <Button onClick={handleSkip}>No match — continue</Button>
            )}
          </Flex>

          <Button icon={<RightOutlined />} iconPosition="end" onClick={goNext} disabled={currentIndex === total - 1}>
            Next
          </Button>
        </Flex>
      </Card>
    </Space>
  );
}
