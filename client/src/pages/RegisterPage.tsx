import AuthForm from '../components/AuthForm';
import { useAuth, type RegisterPayload } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  return (
    <AuthForm<RegisterPayload>
      title="Create account"
      submitLabel="Sign up"
      onSubmit={register}
      fields={[
        { name: 'name', label: 'Name', autoComplete: 'name' },
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
        { name: 'password', label: 'Password (min. 8)', type: 'password', autoComplete: 'new-password', minLength: 8 },
      ]}
      footer={{ text: 'Already have an account?', link: 'Log in', to: '/login' }}
    />
  );
}
