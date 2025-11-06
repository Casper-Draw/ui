import Decimal from "decimal.js";
import {
  DecimalInput,
  formatDecimal,
  formatDecimalWithCommas,
  toDecimal,
} from "./decimal";

const THOUSAND = new Decimal(1_000);
const MILLION = new Decimal(1_000_000);
const BILLION = new Decimal(1_000_000_000);

/**
 * Formats numbers with optional K, M, B suffixes.
 * Values are rounded to the specified number of decimal places (default 2)
 * while trimming trailing zeros.
 */
export function formatNumber(
  value: DecimalInput,
  decimals: number = 2
): string {
  const decimalValue = toDecimal(value);

  if (!decimalValue.isFinite()) {
    return decimalValue.toString();
  }

  const isNegative = decimalValue.isNegative();
  const absValue = decimalValue.abs();

  const sign = isNegative ? "-" : "";

  if (absValue.greaterThanOrEqualTo(BILLION)) {
    return (
      sign +
      formatDecimal(absValue.dividedBy(BILLION), decimals) +
      "B"
    );
  }

  if (absValue.greaterThanOrEqualTo(MILLION)) {
    return (
      sign +
      formatDecimal(absValue.dividedBy(MILLION), decimals) +
      "M"
    );
  }

  if (absValue.greaterThanOrEqualTo(THOUSAND)) {
    return (
      sign +
      formatDecimal(absValue.dividedBy(THOUSAND), decimals) +
      "K"
    );
  }

  return sign + formatDecimal(absValue, decimals);
}

/**
 * Formats numbers with comma separation.
 * For M/B ranges, appends suffixes while applying the same rounding rules.
 */
export function formatNumberWithCommas(
  value: DecimalInput,
  decimals: number = 2
): string {
  const decimalValue = toDecimal(value);

  if (!decimalValue.isFinite()) {
    return decimalValue.toString();
  }

  const isNegative = decimalValue.isNegative();
  const absValue = decimalValue.abs();
  const sign = isNegative ? "-" : "";

  if (absValue.greaterThanOrEqualTo(BILLION)) {
    return (
      sign +
      formatDecimal(absValue.dividedBy(BILLION), decimals) +
      "B"
    );
  }

  if (absValue.greaterThanOrEqualTo(MILLION)) {
    return (
      sign +
      formatDecimal(absValue.dividedBy(MILLION), decimals) +
      "M"
    );
  }

  return sign + formatDecimalWithCommas(absValue, decimals);
}
