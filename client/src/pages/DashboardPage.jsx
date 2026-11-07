import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import BalanceCard from '../components/BalanceCard.jsx';
import TransferForm from '../components/TransferForm.jsx';
import TransactionList from '../components/TransactionList.jsx';

export default function DashboardPage() {
  const { token, logout } = useAuth();
  const [me, setMe] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [meData, list] = await Promise.all([
        api('/me', { token }),
        api('/transfers', { token }),
      ]);
      setMe(meData);
      setTransfers(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <main className="dashboard"><p className="muted">Cargando…</p></main>;

  return (
    <main className="dashboard">
      <header>
        <h1>Hola{me ? `, ${me.user.name}` : ''}</h1>
        <button className="link" onClick={logout}>Cerrar sesión</button>
      </header>

      {error && (
        <p className="error" role="alert">
          {error} <button className="link" onClick={load}>Reintentar</button>
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
