import AuthForm from '../components/AuthForm';
import { useAuth, type Credentials } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  return (
    <AuthForm<Credentials>
      title="Log in"
      submitLabel="Log in"
      onSubmit={login}
      fields={[
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
        { name: 'password', label: 'Password', type: 'password', autoComplete: 'current-password' },
      ]}
      footer={{ text: "Don't have an account?", link: 'Sign up', to: '/register' }}
    />
  );
}
