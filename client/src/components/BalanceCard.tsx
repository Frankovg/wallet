import { formatCents } from '../utils/money';

interface BalanceCardProps {
  balance: number;
  email: string;
}

export default function BalanceCard({ balance, email }: BalanceCardProps) {
  return (
    <section className="card balance">
      <span className="muted">Available balance</span>
      <strong>{formatCents(balance)}</strong>
      <span className="muted small">{email}</span>
    </section>
  );
}
