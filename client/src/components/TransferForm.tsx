import { useActionState } from 'react';
import { api } from '../api/client';
import type { Transfer } from '../types';
import { formatCents } from '../utils/money';

const AMOUNT_RE = /^\d+([.,]\d{1,2})?$/;

interface TransferFormProps {
  token: string | null;
  onSuccess: () => Promise<void>;
}

interface FormState {
  error?: string;
  success?: string;
  values?: { toEmail: string; amount: string };
}

export default function TransferForm({ token, onSuccess }: TransferFormProps) {
  // React 19: useActionState handles pending/error/success without manual useState.
  // On error we return the typed values so the automatic form reset restores them.
  const [state, submit, pending] = useActionState<FormState, FormData>(async (_prev, formData) => {
    const toEmail = String(formData.get('toEmail') ?? '').trim();
    const rawAmount = String(formData.get('amount') ?? '');
    const values = { toEmail, amount: rawAmount };

    const normalized = rawAmount.trim().replace(',', '.');
    if (!AMOUNT_RE.test(normalized) || /^0+(\.0+)?$/.test(normalized)) {
      return { error: 'Enter an amount greater than 0 with up to 2 decimals', values };
    }

    try {
      // The amount is sent as a decimal string; the backend converts it to cents.
      const res = await api<{ transfer: Transfer }>('/transfers', {
        method: 'POST',
        token,
        body: { toEmail, amount: normalized },
      });
      await onSuccess();
      return { success: `You transferred ${formatCents(res.transfer.amount)} to ${res.transfer.counterpartEmail}` };
    } catch (err) {
      return { error: err instanceof Error ? err.message : String(err), values };
    }
  }, {});

  return (
    <section className="card">
      <h2>Transfer</h2>
      <form className="transfer" action={submit}>
        <label>
          Recipient email
          <input
            name="toEmail"
            type="email"
            defaultValue={state.values?.toEmail ?? ''}
            required
            disabled={pending}
          />
        </label>
        <label>
          Amount
          <input
            name="amount"
            inputMode="decimal"
            placeholder="0.00"
            defaultValue={state.values?.amount ?? ''}
            required
            disabled={pending}
          />
        </label>
        <button type="submit" disabled={pending}>{pending ? 'Sending…' : 'Send'}</button>
      </form>
      {state.error && <p className="error" role="alert">{state.error}</p>}
      {state.success && <p className="success" role="status">{state.success}</p>}
    </section>
  );
}
