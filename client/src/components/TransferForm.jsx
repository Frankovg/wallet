import { useState } from 'react';
import { api } from '../api/client.js';
import { formatCents } from '../utils/money.js';

const AMOUNT_RE = /^\d+([.,]\d{1,2})?$/;

export default function TransferForm({ token, onSuccess }) {
  const [toEmail, setToEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const normalized = amount.trim().replace(',', '.');
    if (!AMOUNT_RE.test(normalized) || /^0+(\.0+)?$/.test(normalized)) {
      setError('Ingresá un monto mayor a 0 con hasta 2 decimales');
      return;
    }

    setLoading(true);
    try {
      // The amount is sent as a decimal string; the backend converts it to cents.
      const res = await api('/transfers', {
        method: 'POST',
        token,
        body: { toEmail: toEmail.trim(), amount: normalized },
      });
      setSuccess(`Transferiste ${formatCents(res.transfer.amount)} a ${res.transfer.counterpartEmail}`);
      setToEmail('');
      setAmount('');
      await onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2>Transferir</h2>
      <form className="transfer" onSubmit={handleSubmit}>
        <label>
          Email del destinatario
          <input type="email" value={toEmail} onChange={(e) => setToEmail(e.target.value)} required disabled={loading} />
        </label>
        <label>
          Monto
          <input
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            disabled={loading}
          />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Enviando…' : 'Enviar'}</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      {success && <p className="success" role="status">{success}</p>}
    </section>
  );
}
