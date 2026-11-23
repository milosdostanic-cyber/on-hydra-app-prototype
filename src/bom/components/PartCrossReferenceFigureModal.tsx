import { useState } from 'react';

import {
  crossReferenceFigureLabel,
  listPrototypeVariantsForFigure,
  type CrossReferenceFigure,
  type FigureMatchResult,
  type RsfcPart,
} from '../data/partCrossReferenceData';
import { sizeLabel } from '../data/pimDisplayMapping';
import { hydraBaseMedium, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { Button, Flex, Modal, Segmented, Table, Typography, theme } from '../../ui/antd';
import { HydraTag } from '../../ui/HydraTag';
import { FigureMatchTag, PartPhoto } from './PartCrossReferenceCard';

function FigureSummary({ part, side }: { part: CrossReferenceFigure; side: 'Competitor' | 'RSFC' }) {
  const { token } = theme.useToken();
  const rsfc = side === 'RSFC';

  return (
    <Flex
      align="center"
      gap={token.marginSM}
      wrap="wrap"
      style={{
        flex: '1 1 0',
        minWidth: `min(100%, ${token.controlHeightLG * 5}px)`,
        padding: token.paddingSM,
        background: rsfc ? token.colorPrimaryBg : token.colorFillAlter,
        border: `${token.lineWidth}px ${token.lineType} ${rsfc ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
      }}
    >
      {part.photo && <PartPhoto src={part.photo} size={token.controlHeightLG * 2} />}
      <Flex vertical align="start" gap={token.marginXXS} style={{ flex: 1, minWidth: 0 }}>
        <HydraTag>{side}</HydraTag>
        <Typography.Text style={hydraTextStyleToReactCss(hydraBaseMedium)}>
          {crossReferenceFigureLabel(part)}
        </Typography.Text>
        <Typography.Text type="secondary">{part.description}</Typography.Text>
      </Flex>
    </Flex>
  );
}

function FigureMatchDetails({ result }: { result: FigureMatchResult }) {
  const { token } = theme.useToken();
  const [option, setOption] = useState(0);
  const { direction, source, targets } = result;
  const reverse = direction === 'rsfc';
  const target = targets[option];
  const rsfc = reverse ? source : target;
  const variants = listPrototypeVariantsForFigure(rsfc);

  return (
    <Flex vertical gap={token.margin} style={{ paddingBlock: token.paddingXS }}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={token.marginSM}>
        <Flex align="center" gap={token.marginSM} wrap="wrap">
          <FigureMatchTag />
          <Typography.Text type="secondary">
            {targets.length} {reverse ? 'competitor' : 'RSFC'} {targets.length === 1 ? 'figure' : 'figures'}
          </Typography.Text>
        </Flex>
        {targets.length > 1 && (
          <Segmented
            aria-label={reverse ? 'Competitor figure' : 'RSFC figure'}
            value={option}
            onChange={setOption}
            options={targets.map((part, index) => ({ value: index, label: `Fig. ${part.figure}` }))}
          />
        )}
      </Flex>
      <Flex wrap="wrap" gap={token.marginSM}>
        <FigureSummary part={source} side={reverse ? 'RSFC' : 'Competitor'} />
        <FigureSummary part={target} side={reverse ? 'Competitor' : 'RSFC'} />
      </Flex>
      <Flex vertical gap={token.marginXS}>
        <Typography.Text style={hydraTextStyleToReactCss(hydraBaseMedium)}>
          Available RSFC SKUs for Fig. {rsfc.figure}
        </Typography.Text>
        {variants.length ? (
          <>
            <Typography.Text type="secondary">
              {reverse
                ? 'Search for one of these RSFC SKUs to check for a competitor SKU match.'
                : 'Check the size and specifications before choosing a SKU.'}
            </Typography.Text>
            <Table<RsfcPart>
              size="small"
              rowKey="sku"
              pagination={false}
              dataSource={variants}
              columns={[
                { title: 'SKU', dataIndex: 'sku' },
                { title: 'Size', dataIndex: 'size', render: (size: string) => sizeLabel(size) },
              ]}
            />
          </>
        ) : (
          <Typography.Text type="secondary">This prototype has no SKU variants for this figure.</Typography.Text>
        )}
      </Flex>
    </Flex>
  );
}

export function PartCrossReferenceFigureModal({
  result,
  onClose,
}: {
  result: FigureMatchResult | null;
  onClose: () => void;
}) {
  return (
    <Modal
      open={result !== null}
      onCancel={onClose}
      title={result ? `Matches for ${crossReferenceFigureLabel(result.source)}` : undefined}
      width={760}
      destroyOnHidden
      footer={<Button onClick={onClose}>Close</Button>}
    >
      {result && <FigureMatchDetails key={result.key} result={result} />}
    </Modal>
  );
}
