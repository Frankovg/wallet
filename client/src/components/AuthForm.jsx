import { useState } from 'react';
import { Link } from 'react-router-dom';

/** Shared login/register form with loading and error states. */
export default function AuthForm({ title, fields, submitLabel, onSubmit, footer }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f) => [f.name, ''])));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="auth">
      <form className="card" onSubmit={handleSubmit}>
        <h1>{title}</h1>
        {fields.map((f) => (
          <label key={f.name}>
            {f.label}
            <input
              type={f.type || 'text'}
              autoComplete={f.autoComplete}
              value={values[f.name]}
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              required
              minLength={f.minLength}
              disabled={loading}
            />
          </label>
        ))}
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Procesando…' : submitLabel}
        </button>
        <p className="muted">
          {footer.text} <Link to={footer.to}>{footer.link}</Link>
        </p>
      </form>
    </main>
  );
}
