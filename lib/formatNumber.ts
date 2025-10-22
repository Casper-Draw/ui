/**
 * Formats numbers with K, M, B suffixes
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string
 */
export function formatNumber(num: number, decimals: number = 1): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(decimals).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(decimals).replace(/\.0$/, '') + 'M';
  }
  if (num > 999) {
    return (num / 1_000).toFixed(decimals).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

/**
 * Formats numbers with commas for stats display
 * For millions and above, uses M/B suffix
 * For thousands, shows full number with comma separators
 * @param num - The number to format
 * @returns Formatted string with commas
 */
export function formatNumberWithCommas(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  return num.toLocaleString();
}
