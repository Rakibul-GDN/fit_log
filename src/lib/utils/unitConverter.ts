/** Measurement unit conversion utilities (metric ↔ imperial) */

const KG_TO_LBS = 2.20462;
const CM_TO_INCHES = 0.393701;

/** Convert kilograms to pounds */
export function kgToLbs(kg: number): number {
  return Math.round(kg * KG_TO_LBS * 10) / 10;
}

/** Convert pounds to kilograms */
export function lbsToKg(lbs: number): number {
  return Math.round(lbs / KG_TO_LBS * 10) / 10;
}

/** Convert centimeters to inches */
export function cmToInches(cm: number): number {
  return Math.round(cm * CM_TO_INCHES * 10) / 10;
}

/** Convert inches to centimeters */
export function inchesToCm(inches: number): number {
  return Math.round(inches / CM_TO_INCHES * 10) / 10;
}

/** Display a weight value with the correct unit label */
export function formatWeight(
  value: number,
  unit: 'KG' | 'LBS',
  decimals = 0,
): string {
  return `${value.toFixed(decimals)} ${unit.toLowerCase()}`;
}

/** Display a body measurement value with unit label */
export function formatMeasurement(
  value: number,
  unit: 'KG' | 'LBS' | 'CM' | 'INCHES',
  decimals = 1,
): string {
  const labels: Record<string, string> = {
    KG: 'kg',
    LBS: 'lbs',
    CM: 'cm',
    INCHES: 'in',
  };
  return `${value.toFixed(decimals)} ${labels[unit] ?? unit}`;
}

/** Convert a measurement value between metric and imperial */
export function convertMeasurement(
  value: number,
  fromUnit: 'KG' | 'LBS' | 'CM' | 'INCHES',
  toUnit: 'KG' | 'LBS' | 'CM' | 'INCHES',
): number {
  if (fromUnit === toUnit) return value;

  // Weight conversions
  if (fromUnit === 'KG' && toUnit === 'LBS') return kgToLbs(value);
  if (fromUnit === 'LBS' && toUnit === 'KG') return lbsToKg(value);

  // Length conversions
  if (fromUnit === 'CM' && toUnit === 'INCHES') return cmToInches(value);
  if (fromUnit === 'INCHES' && toUnit === 'CM') return inchesToCm(value);

  return value;
}

/** Get the display unit for a measurement type based on user preference */
export function getDisplayUnit(
  measurementType: string,
  preferredUnits: 'METRIC' | 'IMPERIAL',
): 'KG' | 'LBS' | 'CM' | 'INCHES' {
  const isWeightType = [
    'BODY_WEIGHT',
    'BODY_FAT_PERCENTAGE',
  ].includes(measurementType);

  if (isWeightType) {
    return preferredUnits === 'METRIC' ? 'KG' : 'LBS';
  }

  return preferredUnits === 'METRIC' ? 'CM' : 'INCHES';
}
