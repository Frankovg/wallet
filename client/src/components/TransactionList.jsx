import { formatCents } from '../utils/money.js';

const dateFormatter = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' });

export default function TransactionList({ transfers }) {
  return (
    <section className="card">
      <h2>Movimientos</h2>
      {transfers.length === 0 ? (
        <p className="muted">Todavía no tenés movimientos.</p>
      ) : (
        <ul className="tx-list">
          {transfers.map((t) => {
            const sent = t.direction === 'sent';
            return (
              <li key={t.id}>
                <div>
                  <span>{sent ? 'Enviado a' : 'Recibido de'} {t.counterpartName}</span>
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
