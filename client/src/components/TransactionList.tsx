import type { Transfer } from '../types';
import { formatCents } from '../utils/money';

const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' });

export default function TransactionList({ transfers }: { transfers: Transfer[] }) {
  return (
    <section className="card">
      <h2>Transactions</h2>
      {transfers.length === 0 ? (
        <p className="muted">You have no transactions yet.</p>
      ) : (
        <ul className="tx-list">
          {transfers.map((t) => {
            const sent = t.direction === 'sent';
            return (
              <li key={t.id}>
                <div>
                  <span>{sent ? 'Sent to' : 'Received from'} {t.counterpartName}</span>
                  <span className="muted small">{t.counterpartEmail} · {dateFormatter.format(new Date(t.createdAt))}</span>
                </div>
                <strong className={sent ? 'neg' : 'pos'}>
                  {sent ? '−' : '+'}{formatCents(t.amount)}
                </strong>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
