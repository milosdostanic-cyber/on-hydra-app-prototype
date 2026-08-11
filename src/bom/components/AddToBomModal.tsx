import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';

import { BomDestinationCreateModal } from '../../shell/components/BomDestinationCreateModal';
import { useBomDestinationFields } from '../../shell/components/useBomDestinationFields';
import { Flex, Modal, Select, Space, Typography, theme } from '../../ui/antd';

export type AddToBomPart = {
  partKey: string;
  sku: string;
  displayName: string;
};

export type AddToBomVariationOption = {
  key: string;
  sku: string;
  name: string;
  description?: string;
};

type Props = {
  open: boolean;
  projectId: string;
  part: AddToBomPart | null;
  variations?: AddToBomVariationOption[];
  initialVariantKey?: string | null;
  onAdded: (info: { bomProjectId: string; bomProjectName: string; part: AddToBomPart }) => void;
  onCancel: () => void;
};

function variationSelectLabel(variation: AddToBomVariationOption): string {
  return variation.name || variation.description || variation.sku;
}

function partFromVariation(variation: AddToBomVariationOption): AddToBomPart {
  const label = variationSelectLabel(variation);
  return {
    partKey: variation.key,
    sku: variation.sku,
    displayName: label === variation.sku ? variation.sku : `${variation.sku} — ${label}`,
  };
}

/**
 * Pick a variation (when applicable) and target BOM, then confirm add.
 */
export function AddToBomModal({
  open,
  projectId,
  part,
  variations,
  initialVariantKey,
  onAdded,
  onCancel,
}: Props) {
  const { token } = theme.useToken();
  const fields = useBomDestinationFields(projectId);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedVariantKey, setSelectedVariantKey] = useState<string | null>(null);

  const showVariationSelect = Boolean(variations && variations.length > 0);

  useEffect(() => {
    if (!open) return;
    const fallbackKey = initialVariantKey ?? variations?.[0]?.key ?? null;
    setSelectedVariantKey(fallbackKey);
  }, [open, initialVariantKey, variations]);

  const selectedVariation = useMemo(
    () => variations?.find((variation) => variation.key === selectedVariantKey) ?? null,
    [variations, selectedVariantKey],
  );

  const resolvedPart = useMemo(() => {
    if (selectedVariation) return partFromVariation(selectedVariation);
    return part;
  }, [part, selectedVariation]);

  const canSubmit =
    Boolean(fields.selectedId) &&
    Boolean(resolvedPart) &&
    (!showVariationSelect || Boolean(selectedVariantKey));

  const handleOk = () => {
    if (!resolvedPart) return;
    const dest = fields.resolve();
    if (!dest) return;
    onAdded({ ...dest, part: resolvedPart });
  };

  const handleCreatedBom = (name: string) => {
    fields.createBom(name);
    setCreateModalOpen(false);
  };

  const bomOptions = fields.boms.map((bom) => ({
    value: bom.id,
    label: bom.name,
  }));

  return (
    <>
      <Modal
        open={open}
        title="Add to BOM"
        width={token.screenSM}
        okText="Add to BOM"
        okButtonProps={{ disabled: !canSubmit }}
        onOk={handleOk}
        onCancel={onCancel}
        destroyOnClose
      >
        <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
          {showVariationSelect ? (
            <Flex vertical gap={token.marginXS}>
              <Typography.Text>Select a size or variation to add to this BOM.</Typography.Text>
              <Select
                showSearch
                placeholder="Choose a variation"
                value={selectedVariantKey ?? undefined}
                optionFilterProp="label"
                options={variations!.map((variation) => ({
                  value: variation.key,
                  label: variationSelectLabel(variation),
                }))}
                onChange={setSelectedVariantKey}
                style={{ width: '100%' }}
              />
            </Flex>
          ) : null}

          <Flex vertical gap={token.marginXS}>
            <Typography.Text>Select a BOM to add this part to.</Typography.Text>
            {fields.boms.length > 0 ? (
              <Select
                showSearch
                placeholder="Choose a BOM"
                value={fields.selectedId ?? undefined}
                optionFilterProp="label"
                options={bomOptions}
                onChange={fields.setSelectedId}
                style={{ width: '100%' }}
              />
            ) : (
              <Typography.Text type="secondary">
                No BOMs in this project yet. Create one to add this part.
              </Typography.Text>
            )}
          </Flex>

          {fields.boms.length > 0 ? (
            <Typography.Link onClick={() => setCreateModalOpen(true)}>
              <Space size={token.marginXS}>
                <PlusOutlined />
                <span>Create a new BOM instead</span>
              </Space>
            </Typography.Link>
          ) : (
            <Typography.Link onClick={() => setCreateModalOpen(true)}>
              <Space size={token.marginXS}>
                <PlusOutlined />
                <span>Create a new BOM</span>
              </Space>
            </Typography.Link>
          )}
        </Space>
      </Modal>

      <BomDestinationCreateModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onCreated={handleCreatedBom}
      />
    </>
  );
}
