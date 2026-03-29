import { useState } from 'react';
import { useAuth } from '../store/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input } from '../components/ui';

export default function Register() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(email, displayName, password);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">LinguaCMS</h1>
        <h2 className="text-xl text-center text-gray-600 mb-6">Create Account</h2>
        {error && <p className="text-error text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Button type="submit" fullWidth>
            Sign Up
          </Button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center text-sm"><span className="bg-white px-3 text-gray-400">or</span></div>
        </div>
        <Link
          to="/demo"
          className="block w-full text-center border-2 border-brand text-brand hover:bg-brand/5 font-bold py-3 rounded-xl text-lg transition-colors"
        >
          Try Demo
        </Link>
        <p className="text-center mt-4 text-gray-600">
          Already have an account? <Link to="/login" className="text-brand font-semibold">Log in</Link>
        </p>
      </div>
    </div>
  );
}
