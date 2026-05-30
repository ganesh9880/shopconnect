import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import AuthShell from '../../components/traditional/AuthShell';
import { Field, Input } from '../../components/admin/ui';

export default function CustomerLogin() {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { loginCustomer } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await api('/auth/customer/login', {
        method: 'POST',
        body: JSON.stringify({ phone, pin }),
      });
      loginCustomer(data.token, data.customer);
      navigate('/customer');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AuthShell title="Customer Login" subtitle="Phone number and 4-digit PIN">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Phone number">
          <Input
            type="tel"
            placeholder="10-digit mobile"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </Field>
        <Field label="PIN">
          <Input
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="4-digit PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            required
          />
        </Field>
        {error && <p className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}
        <button type="submit" className="theme-btn-primary w-full">
          Login
        </button>
      </form>
      <p className="text-xs text-stone-600 mt-4 text-center">
        First time? Use the{' '}
        <Link to="/activate/demo" className="text-maroon-800 font-medium underline">
          activation link
        </Link>{' '}
        from the shop.
      </p>
    </AuthShell>
  );
}
