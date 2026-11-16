import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

import { hydraBaseNormal, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import type { PartActionPayload } from '../usePartActionFlows';
import { usePartActionFlows } from '../usePartActionFlows';
import type { PartVariationRow } from '../partDetailDemoData';
import { useVariantActionFlows } from '../useVariantActionFlows';
import { Button, Col, Flex, Row, Typography, theme } from '../../ui/antd';

import { VariantActionSelectionModal } from './VariantActionSelectionModal';
import type { VariantFigureContext, VariantSelectionAction } from './variantSelectionShared';

type Props = {
  partKey: string;
  payload: PartActionPayload;
  variations: PartVariationRow[];
  figure?: VariantFigureContext;
  /** `stack` = full-width column (sidebar). `grid` = responsive 2–3 col grid (wide footer). */
  layout?: 'stack' | 'grid';
};

function ActionButtonCell({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <Button type="default" size="middle" icon={<PlusOutlined />} onClick={onAdd} block>
      {label}
    </Button>
  );
}

/**
 * Action-first CTAs. Variant picking lives only inside each action’s modal —
 * not as a page-level selection step. Session keys persist across CTA opens
 * for this part visit; Confirm runs the bulk action.
 */
export function ActionsPanel({ partKey, payload, variations, figure, layout = 'grid' }: Props) {
  const { token } = theme.useToken();
  const figureFlows = usePartActionFlows(payload);
  const variantFlows = useVariantActionFlows(partKey, variations);

  /** Visit-scoped working selection — owned by action modals, not the page chrome. */
  const [sessionVariantKeys, setSessionVariantKeys] = useState<string[]>([]);
  const [selectionAction, setSelectionAction] = useState<VariantSelectionAction | null>(null);

  useEffect(() => {
    setSessionVariantKeys([]);
  }, [partKey]);

  const openSelection = (action: VariantSelectionAction) => {
    setSelectionAction(action);
  };

  /** Membership is already in session; Confirm only applies the bulk action. */
  const handleSelectionConfirm = (keys: string[]) => {
    const action = selectionAction;
    setSelectionAction(null);
    setSessionVariantKeys(keys);

    const nextVariations = keys
      .map((key) => variations.find((variation) => variation.key === key))
      .filter((variation): variation is PartVariationRow => Boolean(variation));

    if (!action || nextVariations.length === 0) return;

    if (action === 'bom') {
      variantFlows.requestBomAdd(nextVariations);
      return;
    }

    const fileType = action === 'pdf' ? 'PDF' : action === 'dwg' ? 'DWG' : 'STEP';
    variantFlows.queueFileTypeForVariations(fileType, nextVariations);
  };

  const actionCells = [
    <ActionButtonCell key="bom" label="Add to BOM" onAdd={() => openSelection('bom')} />,
    <ActionButtonCell
      key="submittal"
      label="Add Part to Submittal Package"
      onAdd={() => figureFlows.requestAction('submittal')}
    />,
    <ActionButtonCell
      key="revit"
      label="Add Revit File to Downloads"
      onAdd={() => figureFlows.requestAction('revit-queue')}
    />,
    <ActionButtonCell
      key="pdf"
      label="Download PDF File"
      onAdd={() => openSelection('pdf')}
    />,
    <ActionButtonCell
      key="dwg"
      label="Download DWG File"
      onAdd={() => openSelection('dwg')}
    />,
    <ActionButtonCell
      key="step"
      label="Download STEP File"
      onAdd={() => openSelection('step')}
    />,
  ];

  return (
    <>
      <Flex vertical gap={token.marginSM} style={{ width: '100%' }}>
        <Typography.Paragraph
          type="secondary"
          style={{ margin: 0, ...hydraTextStyleToReactCss(hydraBaseNormal) }}
        >
          Click an action to choose one or more variants. Your checks stay selected for other
          actions on this page. Submittal and Revit stay at the figure level.
        </Typography.Paragraph>

        {layout === 'stack' ? (
          <Flex vertical gap={token.paddingSM} style={{ width: '100%' }}>
            {actionCells}
          </Flex>
        ) : (
          <Row gutter={[token.paddingSM, token.paddingSM]} style={{ width: '100%' }}>
            {actionCells.map((cell) => (
              <Col key={cell.key} xs={24} sm={12} xl={8}>
                {cell}
              </Col>
            ))}
          </Row>
        )}
      </Flex>

      <VariantActionSelectionModal
        open={selectionAction !== null}
        action={selectionAction}
        variations={variations}
        figure={figure}
        selectedKeys={sessionVariantKeys}
        onSessionKeysChange={setSessionVariantKeys}
        onConfirm={handleSelectionConfirm}
        onCancel={() => setSelectionAction(null)}
      />

      {figureFlows.modals}
      {variantFlows.modals}
    </>
  );
}
