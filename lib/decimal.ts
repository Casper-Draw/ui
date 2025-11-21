import Decimal from "decimal.js";

Decimal.set({
  precision: 40,
  rounding: Decimal.ROUND_HALF_UP,
});

export type DecimalInput =
  | string
  | number
  | bigint
  | Decimal
  | null
  | undefined;

export const MOTES_PER_CSPR = new Decimal("1000000000");

export function toDecimal(value: DecimalInput): Decimal {
  if (value instanceof Decimal) {
    return value;
  }

  if (typeof value === "bigint") {
    return new Decimal(value.toString());
  }

  if (value === null || value === undefined || value === "") {
    return new Decimal(0);
  }

  return new Decimal(value);
}

export function formatDecimal(
  value: DecimalInput,
  decimalPlaces = 2
): string {
  const decimalValue = toDecimal(value);

  if (!decimalValue.isFinite()) {
    return decimalValue.toString();
  }

  const rounded = decimalValue.toDecimalPlaces(
    decimalPlaces,
    Decimal.ROUND_HALF_UP
  );
  const fixed = rounded.toFixed(decimalPlaces);
  // Remove trailing zeros after last significant digit, then remove trailing dot
  const trimmed = fixed.replace(/(\.\d*[1-9])0+$/, '$1').replace(/\.0*$/, '');

  if (trimmed === "" || trimmed === "-0") {
    return "0";
  }

  return trimmed;
}

export function motesToDecimalCspr(value: DecimalInput): Decimal {
  return toDecimal(value).dividedBy(MOTES_PER_CSPR);
}

export function formatMotesToCspr(
  value: DecimalInput,
  decimalPlaces = 2
): string {
  return formatDecimal(motesToDecimalCspr(value), decimalPlaces);
}

export function motesToCsprNumber(
  value: DecimalInput,
  decimalPlaces = 2
): number {
  return parseFloat(formatMotesToCspr(value, decimalPlaces));
}

export function formatDecimalWithCommas(
  value: DecimalInput,
  decimalPlaces = 2
): string {
  const decimalValue = toDecimal(value);

  if (!decimalValue.isFinite()) {
    return decimalValue.toString();
  }

  const rounded = decimalValue.toDecimalPlaces(
    decimalPlaces,
    Decimal.ROUND_HALF_UP
  );
  const fixed = rounded.toFixed(decimalPlaces);
  const [integerPart, fractionPart] = fixed.split(".");

  const withCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (!fractionPart) {
    return withCommas;
  }

  const trimmedFraction = fractionPart.replace(/0+$/, "");
  return trimmedFraction.length > 0
    ? `${withCommas}.${trimmedFraction}`
    : withCommas;
}

export { Decimal };
