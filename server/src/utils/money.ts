import { AppError } from './AppError.ts';

const MAX_CENTS = 2_147_483_647; // Postgres Int limit
const AMOUNT_RE = /^(\d+)(?:\.(\d{1,2}))?$/;

/**
 * Converts a decimal amount ("12.5", "12.50", "12") to integer cents
 * by parsing the string, never going through floats.
 */
export function parseAmountToCents(input: string | number): number {
  const str = typeof input === 'number' ? String(input) : input;
  if (typeof str !== 'string') {
    throw new AppError(400, 'INVALID_AMOUNT', 'The amount must be a number');
  }
  const match = AMOUNT_RE.exec(str.trim());
  if (!match) {
    throw new AppError(400, 'INVALID_AMOUNT', 'Invalid amount: use a positive number with up to 2 decimals');
  }
  const [, whole, frac = ''] = match;
  const cents = BigInt(whole!) * 100n + BigInt(frac.padEnd(2, '0'));
  if (cents <= 0n) {
    throw new AppError(400, 'INVALID_AMOUNT', 'The amount must be greater than 0');
  }
  if (cents > BigInt(MAX_CENTS)) {
    throw new AppError(400, 'INVALID_AMOUNT', 'The amount exceeds the maximum allowed');
  }
  return Number(cents);
}
