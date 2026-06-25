import type { AscSkuVariant } from './types';

/** Demo SKU variants grouped by parent figure number. */
export const ASC_SKU_VARIANTS_BY_FIGURE: Record<string, AscSkuVariant[]> = {
  'ASC-SR-155-TH': [
    {
      id: 'sr-155-ch',
      figureNumber: 'ASC-SR-155-TH',
      sku: '8821042193',
      description: 'Standard Response Pendent Sprinkler, 155°F, Chrome',
      size: '1/2 inch NPT',
      finish: 'Chrome',
      domesticImport: 'Domestic',
      painted: 'Unpainted',
      pressureRating: '175 PSI',
      connectionType: 'Threaded',
    },
    {
      id: 'sr-155-bb',
      figureNumber: 'ASC-SR-155-TH',
      sku: '8821042194',
      description: 'Standard Response Pendent Sprinkler, 155°F, Brass',
      size: '1/2 inch NPT',
      finish: 'Brass',
      domesticImport: 'Domestic',
      painted: 'Unpainted',
      pressureRating: '175 PSI',
      connectionType: 'Threaded',
    },
    {
      id: 'sr-155-fp',
      figureNumber: 'ASC-SR-155-TH',
      sku: '8821042195',
      description: 'Standard Response Pendent Sprinkler, 155°F, Flat Black',
      size: '1/2 inch NPT',
      finish: 'Flat Black',
      domesticImport: 'Import',
      painted: 'Painted',
      pressureRating: '175 PSI',
      connectionType: 'Threaded',
    },
  ],
  'ASC-GV-600-FL': [
    {
      id: 'gv-600-fl-01',
      figureNumber: 'ASC-GV-600-FL',
      sku: '4371000821',
      description: 'Gate Valve, Flanged, Class 150',
      size: '6 inch',
      finish: 'Epoxy',
      domesticImport: 'Domestic',
      painted: 'Unpainted',
      pressureRating: '150 PSI',
      connectionType: 'Flanged',
    },
    {
      id: 'gv-600-fl-02',
      figureNumber: 'ASC-GV-600-FL',
      sku: '4371000822',
      description: 'Gate Valve, Flanged, OS&Y, Class 150',
      size: '6 inch',
      finish: 'Epoxy',
      domesticImport: 'Import',
      painted: 'Unpainted',
      pressureRating: '150 PSI',
      connectionType: 'Flanged',
    },
  ],
};

export function getSkuVariantsForFigure(figureNumber: string | undefined): AscSkuVariant[] {
  if (!figureNumber?.trim()) return [];
  return ASC_SKU_VARIANTS_BY_FIGURE[figureNumber.trim()] ?? [];
}
