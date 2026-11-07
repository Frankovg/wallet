import { formatCents } from '../utils/money.js';

export default function BalanceCard({ balance, email }) {
  return (
    <section className="card balance">
      <span className="muted">Saldo disponible</span>
      <strong>{formatCents(balance)}</strong>
      <span className="muted small">{email}</span>
    </section>
  );
}
