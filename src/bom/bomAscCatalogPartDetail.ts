import { ascBrowserRowToCatalogPart } from './bomChoosePartUtils';
import { demoCatalogImageForPart } from './bomWorkspaceDashboard';
import type { AscBrowserProductRow } from './data/ascBrowserProducts';
import { getSkuVariantsForFigure } from './data/ascSkuVariants';

export type BomAscPartSizeRow = {
  key: string;
  name: string;
  sku: string;
  variantId?: string;
};

export type BomAscPartDetailView = {
  title: string;
  modelCode: string;
  productDescription: string;
  regulatory: string;
  sizeVariationIntro: string;
  imageUrl?: string;
  sizeRows: BomAscPartSizeRow[];
};

const SIZE_VARIATION_INTRO =
  'View all available product variations. All variations have the same specifications with size-specific differences.';

const DETAIL_COPY_OVERRIDES: Record<
  string,
  Partial<Pick<BomAscPartDetailView, 'title' | 'productDescription' | 'regulatory'>>
> = {
  '9': {
    title: 'C9-CL CenterLOK® Ready for Installation Coupling with Sabertooth Technology',
    productDescription:
      'SPF/Anvil Figure C9-CL is a ready-for-installation coupling with Sabertooth™ technology for fire protection systems. The coupling is designed for fast installation and reliable groove engagement in rigid and flexible drop applications.',
    regulatory: '—',
  },
};

export function buildBomAscPartDetailView(product: AscBrowserProductRow): BomAscPartDetailView {
  const catalogPart = ascBrowserRowToCatalogPart(product);
  const variants = getSkuVariantsForFigure(product.figureNumber);
  const overrides = DETAIL_COPY_OVERRIDES[product.key];

  const sizeRows: BomAscPartSizeRow[] =
    variants.length > 0
      ? variants.map((variant) => ({
          key: variant.id,
          name: variant.description,
          sku: variant.sku,
          variantId: variant.id,
        }))
      : [
          {
            key: product.key,
            name: product.description,
            sku: product.ascNumber,
          },
        ];

  return {
    title: overrides?.title ?? product.description,
    modelCode: product.figureNumber,
    productDescription:
      overrides?.productDescription ??
      `${product.mfr} ${product.partType} — ${product.description}. Size ${product.size}.`,
    regulatory: overrides?.regulatory ?? '—',
    sizeVariationIntro: SIZE_VARIATION_INTRO,
    imageUrl: demoCatalogImageForPart(catalogPart),
    sizeRows,
  };
}

export function matchingCatalogPartDetailRoute(bomProjectId: string, productKey: string): string {
  return `/bom/projects/${bomProjectId}/asc-products/part/${encodeURIComponent(productKey)}`;
}
