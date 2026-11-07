import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import BalanceCard from '../components/BalanceCard';
import TransferForm from '../components/TransferForm';
import TransactionList from '../components/TransactionList';
import type { MeResponse, Transfer } from '../types';

export default function DashboardPage() {
  const { token, logout } = useAuth();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [meData, list] = await Promise.all([
        api<MeResponse>('/me', { token }),
        api<Transfer[]>('/transfers', { token }),
      ]);
      setMe(meData);
      setTransfers(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <main className="dashboard"><p className="muted">Loading…</p></main>;

  return (
    <main className="dashboard">
      <header>
        <h1>Hello{me ? `, ${me.user.name}` : ''}</h1>
        <button className="link" onClick={logout}>Log out</button>
      </header>

      {error && (
        <p className="error" role="alert">
          {error} <button className="link" onClick={load}>Retry</button>
        </p>
      )}

      {me && (
        <>
          <BalanceCard balance={me.account.balance} email={me.user.email} />
          <TransferForm token={token} onSuccess={load} />
          <TransactionList transfers={transfers} />
        </>
      )}
    </main>
  );
}
