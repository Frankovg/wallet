import { useState, type SubmitEvent } from 'react';
import { Link } from 'react-router-dom';

export interface AuthField<K extends string> {
  name: K;
  label: string;
  type?: string;
  autoComplete?: string;
  minLength?: number;
}

interface AuthFormProps<T extends Record<string, string>> {
  title: string;
  fields: AuthField<Extract<keyof T, string>>[];
  submitLabel: string;
  onSubmit: (values: T) => Promise<void>;
  footer: { text: string; link: string; to: string };
}

/** Shared login/register form with loading and error states. */
export default function AuthForm<T extends Record<string, string>>({
  title,
  fields,
  submitLabel,
  onSubmit,
  footer,
}: AuthFormProps<T>) {
  const [values, setValues] = useState<T>(
    () => Object.fromEntries(fields.map((f) => [f.name, ''])) as T
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
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
          {loading ? 'Processing…' : submitLabel}
        </button>
        <p className="muted">
          {footer.text} <Link to={footer.to}>{footer.link}</Link>
        </p>
      </form>
    </main>
  );
}
