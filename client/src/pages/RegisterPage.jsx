import AuthForm from '../components/AuthForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  return (
    <AuthForm
      title="Crear cuenta"
      submitLabel="Registrarme"
      onSubmit={register}
      fields={[
        { name: 'name', label: 'Nombre', autoComplete: 'name' },
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
        { name: 'password', label: 'Contraseña (mín. 8)', type: 'password', autoComplete: 'new-password', minLength: 8 },
      ]}
      footer={{ text: '¿Ya tenés cuenta?', link: 'Iniciá sesión', to: '/login' }}
    />
  );
}
