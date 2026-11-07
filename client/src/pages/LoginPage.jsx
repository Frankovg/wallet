import AuthForm from '../components/AuthForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  return (
    <AuthForm
      title="Iniciar sesión"
      submitLabel="Ingresar"
      onSubmit={login}
      fields={[
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
        { name: 'password', label: 'Contraseña', type: 'password', autoComplete: 'current-password' },
      ]}
      footer={{ text: '¿No tenés cuenta?', link: 'Registrate', to: '/register' }}
    />
  );
}
