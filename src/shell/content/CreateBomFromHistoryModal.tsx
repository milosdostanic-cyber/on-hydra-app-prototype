import { useState } from 'react';

import type { BomItem } from '../../bom/data/types';
import { BomDestinationCreateModal } from '../components/BomDestinationCreateModal';
import { BomDestinationFields } from '../components/BomDestinationFields';
import type { BomDestinationValue } from '../components/BomDestinationFields';
import { useBomDestinationFields } from '../components/useBomDestinationFields';
import {
  initialWorkspaceRowsForBomProject,
  useBomWorkspace,
} from '../../context/BomWorkspaceContext';
import { buildCatalogBomItem, isSkuInBomRows } from '../../search/catalogBomAdd';
import { Alert, App, Flex, Modal, Space, Typography, theme } from '../../ui/antd';
import type { ResolvedHistoryVariant, UnresolvedHistoryFigure } from './downloadHistorySelection';
import { ResolveFigureVariantsDrawer } from './ResolveFigureVariantsDrawer';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

const COPY = {
  title: 'Create BOM',
  ok: 'Create BOM',
  continue: 'Choose variations',
  addingVariants: 'These variations will be added',
  unresolved: (count: number) =>
    count === 1
      ? '1 figure still needs a variation before anything is added.'
      : `${count} figures still need a variation before anything is added.`,
  empty: 'Select at least one figure or variation first.',
};

type Props = {
  open: boolean;
  projectId: string;
  variants: ResolvedHistoryVariant[];
  unresolvedFigures: UnresolvedHistoryFigure[];
  onCancel: () => void;
  onCreated: (info: {
    bomProjectId: string;
    bomProjectName: string;
    itemCount: number;
    alreadyInBomCount: number;
  }) => void;
};

function planBomWrite(
  current: BomItem[],
  variants: ResolvedHistoryVariant[],
): { next: BomItem[]; itemCount: number; alreadyInBomCount: number } {
  const next = [...current];
  let itemCount = 0;
  let alreadyInBomCount = 0;
  for (const variant of variants) {
    if (isSkuInBomRows(next, variant.sku)) {
      alreadyInBomCount += 1;
      continue;
    }
    next.push(
      buildCatalogBomItem(
        {
          partKey: variant.variationKey || variant.partKey,
          sku: variant.sku,
          displayName: variant.name,
          figureNumber: variant.figureNumber,
        },
        next.length,
      ),
    );
    itemCount += 1;
  }
  return { next, itemCount, alreadyInBomCount };
}

/**
 * Create or add to a BOM from history selection.
 * Unresolved parent figures go through the variant queue before any write (FR-12).
 */
export function CreateBomFromHistoryModal({
  open,
  projectId,
  variants,
  unresolvedFigures,
  onCancel,
  onCreated,
}: Props) {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const fields = useBomDestinationFields(projectId);
  const { rowsByProjectId, setWorkspaceRows } = useBomWorkspace();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resolverOpen, setResolverOpen] = useState(false);
  const [pendingDest, setPendingDest] = useState<BomDestinationValue | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const needsResolver = unresolvedFigures.length > 0;
  const hasWork = variants.length > 0 || unresolvedFigures.length > 0;

  const finishWrite = (dest: BomDestinationValue, resolved: ResolvedHistoryVariant[]) => {
    if (resolved.length === 0) {
      message.warning('Nothing to add — every figure was skipped.');
      return;
    }
    setSubmitting(true);
    try {
      const current =
        rowsByProjectId[dest.bomProjectId] ?? initialWorkspaceRowsForBomProject(dest.bomProjectId);
      const planned = planBomWrite(current, resolved);
      setWorkspaceRows(dest.bomProjectId, (prev) => planBomWrite(prev, resolved).next);
      onCreated({
        bomProjectId: dest.bomProjectId,
        bomProjectName: dest.bomProjectName,
        itemCount: planned.itemCount,
        alreadyInBomCount: planned.alreadyInBomCount,
      });
    } catch {
      message.error('Could not add these items to the BOM. Try again.');
    } finally {
      setSubmitting(false);
      setResolverOpen(false);
      setPendingDest(null);
    }
  };

  const handleOk = () => {
    if (!hasWork || !fields.canSubmit || submitting) return;
    const dest = fields.resolve();
    if (!dest) {
      message.error('Choose a BOM to continue.');
      return;
    }
    if (needsResolver) {
      setPendingDest(dest);
      setResolverOpen(true);
      return;
    }
    finishWrite(dest, variants);
  };

  const handleResolverCancel = () => {
    setResolverOpen(false);
    setPendingDest(null);
  };

  return (
    <>
      <Modal
        open={open && !resolverOpen}
        title={COPY.title}
        width={token.screenSM}
        okText={needsResolver ? COPY.continue : COPY.ok}
        okButtonProps={{ disabled: !fields.canSubmit || !hasWork, loading: submitting }}
        onOk={handleOk}
        onCancel={onCancel}
        destroyOnClose
      >
        <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
          {!hasWork ? (
            <Alert type="info" showIcon title={COPY.empty} />
          ) : (
            <>
              {variants.length > 0 ? (
                <Flex
                  vertical
                  gap={token.marginXXS}
                  style={{
                    padding: token.padding,
                    border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                    borderRadius: token.borderRadiusLG,
                    background: token.colorFillQuaternary,
                  }}
                >
                  <Typography.Text type="secondary">{COPY.addingVariants}</Typography.Text>
                  {variants.map((variant) => (
                    <Typography.Text key={`${variant.partKey}-${variant.variationKey}`} style={hydraTextStyleToReactCss(hydraBaseStrong)}>
                      {variant.name} · {variant.sku}
                    </Typography.Text>
                  ))}
                </Flex>
              ) : null}
              {needsResolver ? (
                <Alert type="info" showIcon title={COPY.unresolved(unresolvedFigures.length)} />
              ) : null}
            </>
          )}

          <BomDestinationFields
            boms={fields.boms}
            selectedId={fields.selectedId}
            onSelectedIdChange={fields.setSelectedId}
            onRequestCreateNew={() => setCreateModalOpen(true)}
          />
        </Space>
      </Modal>

      <BomDestinationCreateModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onCreated={(name) => {
          fields.createBom(name);
          setCreateModalOpen(false);
        }}
      />

      <ResolveFigureVariantsDrawer
        open={resolverOpen}
        figures={unresolvedFigures}
        alreadyResolved={variants}
        onCancel={handleResolverCancel}
        onConfirm={(resolved) => {
          if (!pendingDest) {
            handleResolverCancel();
            return;
          }
          finishWrite(pendingDest, resolved);
        }}
      />
    </>
  );
}
