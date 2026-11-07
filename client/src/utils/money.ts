const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// Amounts are always sent as integer cents; they are only divided for display.
export function formatCents(cents: number): string {
  return formatter.format(cents / 100);
}
