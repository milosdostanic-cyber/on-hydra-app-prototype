import { useEffect, useMemo, useState } from 'react';

import { CODE_REQUIREMENT_LABELS, LOAD_TYPE_LABELS } from '../constants/options';
import { Alert, Flex, Input, Modal, Radio, Select, Typography, theme } from '../../ui/antd';
import type { SeismicDesign } from '../types';

export type CopyBraceDestination =
  | { kind: 'current' }
  | { kind: 'existing'; designId: string }
  | { kind: 'new'; name: string };

type Props = {
  open: boolean;
  braceName: string;
  sourceDesign: SeismicDesign | undefined;
  designs: SeismicDesign[];
  onConfirm: (destination: CopyBraceDestination) => void;
  onCancel: () => void;
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function standardsDiffer(source: SeismicDesign, destination: SeismicDesign): boolean {
  return (
    source.codeRequirement !== destination.codeRequirement || source.loadType !== destination.loadType
  );
}

function standardsPhrase(design: SeismicDesign): string {
  return `${CODE_REQUIREMENT_LABELS[design.codeRequirement]} and ${LOAD_TYPE_LABELS[design.loadType]}`;
}

/**
 * Immediate destination prompt for copying one brace.
 * Warning is informational — copy is not blocked when standards differ.
 */
export function CopyBraceDestinationModal({
  open,
  braceName,
  sourceDesign,
  designs,
  onConfirm,
  onCancel,
}: Props) {
  const { token } = theme.useToken();
  const [kind, setKind] = useState<'current' | 'existing' | 'new'>('current');
  const [otherDesignId, setOtherDesignId] = useState<string | undefined>();
  const [newName, setNewName] = useState('');

  const otherDesigns = useMemo(
    () => designs.filter((design) => design.id !== sourceDesign?.id),
    [designs, sourceDesign?.id],
  );

  useEffect(() => {
    if (!open) return;
    setKind('current');
    setOtherDesignId(otherDesigns[0]?.id);
    setNewName(sourceDesign ? `${sourceDesign.name} (copy)` : '');
  }, [open, sourceDesign, otherDesigns]);

  const destinationDesign =
    kind === 'existing' ? otherDesigns.find((design) => design.id === otherDesignId) : undefined;
  const mismatch =
    kind === 'existing' && sourceDesign && destinationDesign
      ? standardsDiffer(sourceDesign, destinationDesign)
      : false;

  const canSubmit =
    Boolean(sourceDesign) &&
    (kind === 'current' ||
      (kind === 'existing' && Boolean(otherDesignId)) ||
      (kind === 'new' && newName.trim().length > 0));

  const handleOk = () => {
    if (!canSubmit) return;
    if (kind === 'current') {
      onConfirm({ kind: 'current' });
      return;
    }
    if (kind === 'existing' && otherDesignId) {
      onConfirm({ kind: 'existing', designId: otherDesignId });
      return;
    }
    onConfirm({ kind: 'new', name: newName.trim() });
  };

  return (
    <Modal
      open={open}
      title="Copy brace"
      okText="Copy brace"
      okButtonProps={{ disabled: !canSubmit }}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
      width={560}
    >
      <Flex vertical gap={token.margin} style={{ width: '100%' }}>
        <Typography.Text>
          Choose where to copy “{braceName}”.
        </Typography.Text>

        <Radio.Group
          value={kind}
          onChange={(event) => setKind(event.target.value)}
          style={{ display: 'flex', flexDirection: 'column', gap: token.marginSM }}
        >
          <Radio value="current">This design</Radio>
          <Flex vertical gap={token.marginXS}>
            <Radio value="existing" disabled={otherDesigns.length === 0}>
              Another design
            </Radio>
            {kind === 'existing' ? (
              <Select
                showSearch
                placeholder="Choose a design"
                optionFilterProp="label"
                value={otherDesignId}
                options={otherDesigns.map((design) => ({
                  value: design.id,
                  label: `${design.displayName} · ${dateFormatter.format(new Date(design.projectDate))}`,
                }))}
                onChange={setOtherDesignId}
                style={{ width: '100%' }}
              />
            ) : otherDesigns.length === 0 ? (
              <Typography.Text type="secondary">No other designs in this project.</Typography.Text>
            ) : null}
          </Flex>
          <Flex vertical gap={token.marginXS}>
            <Radio value="new">New design</Radio>
            {kind === 'new' ? (
              <Input
                value={newName}
                placeholder="Design name"
                aria-label="New design name"
                onChange={(event) => setNewName(event.target.value)}
              />
            ) : null}
          </Flex>
        </Radio.Group>

        {mismatch && sourceDesign && destinationDesign ? (
          <Alert
            type="warning"
            showIcon
            message="Standards differ — revalidation may be required"
            description={`This design uses ${standardsPhrase(destinationDesign)}. The brace was configured for ${standardsPhrase(sourceDesign)}. It may need to be reconfigured or revalidated.`}
          />
        ) : (
          <Typography.Text type="secondary">
            Changing this design’s seismic, NFPA, or FM/UL standards later may require the brace to be
            reconfigured or revalidated.
          </Typography.Text>
        )}
      </Flex>
    </Modal>
  );
}
