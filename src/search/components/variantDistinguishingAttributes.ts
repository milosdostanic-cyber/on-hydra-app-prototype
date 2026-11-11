import type { PartVariationRow } from '../partDetailDemoData';
import { variationSpecValue } from '../partDetailDemoData';
import type { HydraColorfulPreset } from '../../ui/HydraTag';

import { isPlaceholderSpecValue } from './variantSelectionShared';

export type DistinguishingTag = HydraColorfulPreset | 'default';

export type DistinguishingAttribute = {
  key: string;
  label: string;
  weight: number;
  tag: DistinguishingTag;
};

const SKU_CHOICE = 100;
const MATERIAL_FINISH = 80;
const PERFORMANCE = 60;
const GEOMETRY = 40;

function attr(
  key: string,
  label: string,
  weight: number,
  tag: DistinguishingTag,
): DistinguishingAttribute {
  return { key, label, weight, tag };
}

/** Catalog keys that can distinguish one variant from another on the same part. */
export const DISTINGUISHING_ATTRIBUTE_CATALOG: DistinguishingAttribute[] = [
  attr('sizeDimensionOne', 'Nominal Size Dimension 1', SKU_CHOICE, 'blue'),
  attr('sizeDimensionTwo', 'Nominal Size Dimension 2', SKU_CHOICE, 'blue'),
  attr('sizeDimensionThree', 'Nominal Size Dimension 3', SKU_CHOICE, 'blue'),
  attr('pipeSize', 'Pipe Size', SKU_CHOICE, 'blue'),
  attr('nominalInnerDiameter', 'Nominal Inner Diameter', SKU_CHOICE, 'cyan'),
  attr('nominalOuterDiameter', 'Nominal Outer Diameter', SKU_CHOICE, 'cyan'),
  attr('schedule', 'Schedule', SKU_CHOICE, 'geekblue'),
  attr('pressureClass', 'Pressure Class', SKU_CHOICE, 'geekblue'),
  attr('endConnectionOne', 'End Connection 1', SKU_CHOICE, 'purple'),
  attr('endConnectionTwo', 'End Connection 2', SKU_CHOICE, 'purple'),

  attr('material', 'Material', MATERIAL_FINISH, 'green'),
  attr('mainMaterial', 'Main Material', MATERIAL_FINISH, 'green'),
  attr('coating', 'Coating / Finish', MATERIAL_FINISH, 'lime'),
  attr('finishDetail', 'Finish Detail', MATERIAL_FINISH, 'lime'),
  attr('gasketMaterial', 'Gasket Material', MATERIAL_FINISH, 'green'),
  attr('gasketType', 'Gasket Type', MATERIAL_FINISH, 'green'),
  attr('stainlessSteelType', 'Stainless Steel Type', MATERIAL_FINISH, 'green'),
  attr('productColor', 'Product Color', MATERIAL_FINISH, 'gold'),
  attr('elbowAngle', 'Elbow Angle', MATERIAL_FINISH, 'gold'),

  attr('weight', 'Approximate Weight', PERFORMANCE, 'orange'),
  attr('maximumPressure', 'Maximum Pressure', PERFORMANCE, 'red'),
  attr('minimumPressure', 'Minimum Pressure', PERFORMANCE, 'red'),
  attr('coldWorkingPressure', 'Cold Working Pressure', PERFORMANCE, 'red'),
  attr('maximumTemperatureC', 'Maximum Temperature (°C)', PERFORMANCE, 'volcano'),
  attr('maximumTemperatureF', 'Maximum Temperature (°F)', PERFORMANCE, 'volcano'),
  attr('minimumTemperatureC', 'Minimum Temperature (°C)', PERFORMANCE, 'volcano'),
  attr('minimumTemperatureF', 'Minimum Temperature (°F)', PERFORMANCE, 'volcano'),
  attr('minimumOperatingTemperature', 'Minimum Operating Temperature', PERFORMANCE, 'volcano'),
  attr('cvFactor', 'CV Factor', PERFORMANCE, 'magenta'),
  attr('cvFlowCoefficient', 'CV Flow Coefficient', PERFORMANCE, 'magenta'),
  attr('maxOperatingTorque', 'Max Operating Torque', PERFORMANCE, 'magenta'),

  attr('height', 'Height', GEOMETRY, 'default'),
  attr('width', 'Width', GEOMETRY, 'default'),
  attr('length', 'Length', GEOMETRY, 'default'),
  attr('minimumWallThickness', 'Minimum Wall Thickness', GEOMETRY, 'default'),
  attr('pipeWallThickness', 'Pipe Wall Thickness', GEOMETRY, 'default'),
  attr('flangeThickness', 'Flange Thickness', GEOMETRY, 'default'),
  attr('allowablePipeEndSeparation', 'Allowable Pipe-End Separation', GEOMETRY, 'default'),
  attr('fmEquivalentLength', 'FM Equivalent Length', GEOMETRY, 'default'),
  attr('inletNippleLength', 'Inlet Nipple Length', GEOMETRY, 'default'),
  attr('takeOut', 'Take Out', GEOMETRY, 'default'),
  attr('totalMovementCapability', 'Total Movement Capability', GEOMETRY, 'default'),
  attr('valveCenterToEnd', 'Valve Center to End', GEOMETRY, 'default'),
  attr('valveCenterToHandleTop', 'Valve Center to Handle Top', GEOMETRY, 'default'),
  attr('valveCenterToTop', 'Valve Center to Top', GEOMETRY, 'default'),
  attr('wrenchSize', 'Wrench Size', GEOMETRY, 'default'),
  attr('handwheelDiameter', 'Handwheel Diameter', GEOMETRY, 'cyan'),
  attr('pcdDiameter', 'PCD Diameter', GEOMETRY, 'cyan'),
  attr('stemSetScrewDiameter', 'Stem Set Screw Diameter', GEOMETRY, 'cyan'),
  attr('isoPattern', 'ISO Pattern', GEOMETRY, 'geekblue'),
  attr('bodyDetail', 'Body Detail', GEOMETRY, 'orange'),
  attr('bonnet', 'Bonnet', GEOMETRY, 'orange'),
  attr('disc', 'Disc', GEOMETRY, 'orange'),
  attr('handleBolt', 'Handle Bolt', GEOMETRY, 'orange'),
  attr('piston', 'Piston', GEOMETRY, 'orange'),
  attr('plug', 'Plug', GEOMETRY, 'orange'),
  attr('seal', 'Seal', GEOMETRY, 'orange'),
  attr('seatSeal', 'Seat Seal', GEOMETRY, 'orange'),
];

const CATALOG_BY_KEY = new Map(DISTINGUISHING_ATTRIBUTE_CATALOG.map((entry) => [entry.key, entry]));

/** Blank and placeholder text do not count as a distinguishing value. */
export function isEmptyDistinguishingValue(value: string | undefined): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (/^(-|n\/a|na|null|none)$/i.test(trimmed)) return true;
  return isPlaceholderSpecValue(trimmed);
}

/**
 * Up to four attributes that differ across the listed variants.
 * Higher weight wins, then more distinct values, then the attribute key.
 */
export function selectDistinguishingAttributes(
  variations: PartVariationRow[],
): DistinguishingAttribute[] {
  const ranked = DISTINGUISHING_ATTRIBUTE_CATALOG.map((attribute) => {
    const values = new Set<string>();
    for (const variation of variations) {
      const raw = variationSpecValue(variation, attribute.key);
      if (isEmptyDistinguishingValue(raw)) continue;
      values.add(raw!.trim());
    }
    return { attribute, distinct: values.size };
  }).filter((entry) => entry.distinct >= 2);

  ranked.sort((left, right) => {
    if (right.attribute.weight !== left.attribute.weight) {
      return right.attribute.weight - left.attribute.weight;
    }
    if (right.distinct !== left.distinct) return right.distinct - left.distinct;
    return left.attribute.key.localeCompare(right.attribute.key);
  });

  return ranked.slice(0, 4).map((entry) => entry.attribute);
}

export function distinguishingAttributeByKey(key: string): DistinguishingAttribute | undefined {
  return CATALOG_BY_KEY.get(key);
}
