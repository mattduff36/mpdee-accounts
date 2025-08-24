import { Metadata } from 'next';
import LoginForm from '../../components/LoginForm';

export const metadata: Metadata = {
  title: 'Login | MPDEE Accounts',
  description: 'Sign in to access the MPDEE Accounts system',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
