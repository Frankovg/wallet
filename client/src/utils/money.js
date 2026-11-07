const formatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' });

// Amounts are always sent as integer cents; they are only divided for display.
export function formatCents(cents) {
  return formatter.format(cents / 100);
}
