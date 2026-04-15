import { LeftOutlined, RightOutlined, WarningOutlined } from '@ant-design/icons';
import { useState } from 'react';

import {
  Alert,
  Button,
  Divider,
  Flex,
  Input,
  InputNumber,
  Modal,
  Progress,
  Space,
  Tag,
  Typography,
  message,
  theme,
} from '../../ui/antd';
import type { BomItem, AscCatalogPart } from '../data/types';

interface PartTranslationModalProps {
  open: boolean;
  items: BomItem[];
  ascParts: (AscCatalogPart | undefined)[];
  startIndex?: number;
  onClose: () => void;
  onConfirm?: (itemId: string, ascPart: AscCatalogPart) => void;
  onSkip?: (itemId: string) => void;
}

export function PartTranslationModal({
  open,
  items,
  ascParts,
  startIndex = 0,
  onClose,
  onConfirm,
  onSkip,
}: PartTranslationModalProps) {
  const { token } = theme.useToken();
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const total = items.length;
  const currentItem = items[currentIndex];
  const currentAscPart = ascParts[currentIndex];

  const handleConfirm = () => {
    if (currentAscPart) {
      onConfirm?.(currentItem.id, currentAscPart);
      message.success(`Part confirmed: ${currentAscPart.partNumber}`);
    }
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setShowNoteInput(false);
      setNote('');
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onSkip?.(currentItem.id);
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setShowNoteInput(false);
      setNote('');
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setShowNoteInput(false);
      setNote('');
    }
  };

  if (!currentItem) return null;

  const confidenceColor = (conf: number) =>
    conf >= 90 ? 'success' : conf >= 75 ? 'warning' : 'error';
  const riskColor = (risk: string) =>
    risk === 'low' ? 'success' : risk === 'medium' ? 'warning' : 'error';

  const panelBase = {
    borderRadius: token.borderRadiusLG,
    padding: token.paddingMD,
    flex: 1,
    minWidth: 0,
  };

  const fieldBlock = (label: string, value: string | number | undefined) => (
    <div>
      <Typography.Text
        style={{ color: token.colorTextTertiary, fontSize: token.fontSizeSM, display: 'block' }}
      >
        {label}
      </Typography.Text>
      <Typography.Text strong>{value ?? '—'}</Typography.Text>
    </div>
  );

  return (
    <Modal open={open} onCancel={onClose} width={780} footer={null} title="Part Translation">
      <Space direction="vertical" size={token.marginMD} style={{ width: '100%' }}>

        {/* Progress indicator */}
        <Flex align="center" gap={token.marginSM}>
          <Progress
            percent={Math.round(((currentIndex + 1) / total) * 100)}
            showInfo={false}
            style={{ flex: 1, margin: 0 }}
            strokeColor={token.colorPrimary}
          />
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM, flexShrink: 0 }}
          >
            {currentIndex + 1} of {total}
          </Typography.Text>
        </Flex>

        {/* Match confidence strip */}
        {currentAscPart && (
          <Flex
            gap={token.marginSM}
            align="center"
            wrap="wrap"
            style={{
              background: token.colorFillAlter,
              border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadius,
              paddingInline: token.paddingMD,
              paddingBlock: token.paddingXS,
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
            <Tag
              color={riskColor(currentAscPart.substitutionRisk)}
              style={{ margin: 0, textTransform: 'capitalize' }}
            >
              {currentAscPart.substitutionRisk}
            </Tag>
            <Divider type="vertical" style={{ margin: 0 }} />
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              Rule:{' '}
              <Typography.Text style={{ fontSize: token.fontSizeSM }}>
                {currentAscPart.conversionRule}
              </Typography.Text>
            </Typography.Text>
          </Flex>
        )}

        {/* Two-panel comparison */}
        <Flex gap={token.marginMD} align="stretch">
          {/* Left: Pre-Translation */}
          <div
            style={{
              ...panelBase,
              background: token.colorFillAlter,
              border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            }}
          >
            <Typography.Text
              strong
              style={{
                display: 'block',
                marginBottom: token.marginSM,
                color: token.colorTextSecondary,
                fontSize: token.fontSizeSM,
              }}
            >
              PRE-TRANSLATION PART
            </Typography.Text>
            <Divider style={{ marginBlock: token.marginXS }} />
            <Space direction="vertical" size={token.marginSM} style={{ width: '100%' }}>
              {fieldBlock('Description', currentItem.parsedDescription)}
              {fieldBlock('Brand', 'Various / Generic')}
              {fieldBlock('Figure Number', currentItem.originalInput)}
              {fieldBlock('Size', currentItem.size)}
              {fieldBlock('Reorder', 'N/A')}
            </Space>
          </div>

          {/* Arrow */}
          <Flex align="center" justify="center" style={{ flexShrink: 0 }}>
            <RightOutlined
              style={{
                fontSize: token.fontSizeLG,
                color: token.colorPrimary,
                background: token.colorPrimaryBg,
                padding: token.paddingSM,
                borderRadius: '50%',
              }}
            />
          </Flex>

          {/* Right: ASC Part */}
          <div
            style={{
              ...panelBase,
              background: token.colorPrimaryBg,
              border: `${token.lineWidth}px ${token.lineType} ${token.colorPrimaryBorder}`,
            }}
          >
            <Typography.Text
              strong
              style={{
                display: 'block',
                marginBottom: token.marginSM,
                color: token.colorPrimary,
                fontSize: token.fontSizeSM,
              }}
            >
              ASC PART
            </Typography.Text>
            <Divider style={{ marginBlock: token.marginXS }} />
            {currentAscPart ? (
              <Space direction="vertical" size={token.marginSM} style={{ width: '100%' }}>
                {fieldBlock('Description', currentAscPart.description)}
                {fieldBlock('Brand', currentAscPart.productFamily)}
                {fieldBlock('Figure Number', currentAscPart.partNumber)}
                {fieldBlock('Size', currentAscPart.dimensions)}
                <div>
                  <Typography.Text
                    style={{
                      color: token.colorTextTertiary,
                      fontSize: token.fontSizeSM,
                      display: 'block',
                    }}
                  >
                    Quantity
                  </Typography.Text>
                  <InputNumber
                    min={1}
                    defaultValue={currentItem.quantity}
                    style={{ width: 100, marginTop: token.marginXXS }}
                    size="small"
                  />
                </div>
              </Space>
            ) : (
              <Flex
                align="center"
                justify="center"
                style={{ height: token.controlHeightLG * 4 }}
              >
                <Typography.Text type="secondary">No ASC match found</Typography.Text>
              </Flex>
            )}
          </div>
        </Flex>

        {/* Note input */}
        {showNoteInput && (
          <Alert
            type="warning"
            showIcon
            message="Note about this part"
            description={
              <Input.TextArea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Describe what you need or why this part doesn't match…"
                rows={2}
                autoFocus
                style={{ marginTop: token.marginXS }}
              />
            }
          />
        )}

        {/* Footer */}
        <Flex justify="space-between" align="center">
          <Button
            icon={<LeftOutlined />}
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>

          <Flex gap={token.marginXS} align="center">
            <Button
              size="small"
              icon={<WarningOutlined />}
              type={showNoteInput ? 'primary' : 'default'}
              onClick={() => setShowNoteInput((v) => !v)}
            >
              Add note
            </Button>
            <Button
              size="small"
              danger
              onClick={() => message.info('Marked as not the right ASC part.')}
            >
              Not the right part
            </Button>
            <Divider type="vertical" style={{ height: token.controlHeightSM }} />
            <Button onClick={handleSkip}>Skip</Button>
            <Button type="primary" onClick={handleConfirm} disabled={!currentAscPart}>
              Confirm Translation
            </Button>
          </Flex>
        </Flex>

      </Space>
    </Modal>
  );
}
