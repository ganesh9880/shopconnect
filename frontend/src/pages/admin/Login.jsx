import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import AuthShell from '../../components/traditional/AuthShell';
import { Field, Input } from '../../components/admin/ui';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await api('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      loginAdmin(data.token, data.user);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AuthShell title="Shop Login" subtitle="For owners and staff only" backTo="/">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Username">
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        {error && <p className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}
        <button type="submit" className="theme-btn-primary w-full">
          Sign in
        </button>
      </form>
      <p className="text-center text-sm mt-4">
        <Link to="/" className="text-maroon-700 hover:text-gold-600 underline">
          ← Back to store
        </Link>
      </p>
    </AuthShell>
  );
}
