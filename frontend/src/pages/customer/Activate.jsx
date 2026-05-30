import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import AuthShell from '../../components/traditional/AuthShell';
import { Field, Input } from '../../components/admin/ui';

export default function Activate() {
  const { token } = useParams();
  const [info, setInfo] = useState(null);
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const { loginCustomer } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || token === 'demo') return;
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) {
        setError(
          'Taking too long. Check VITE_API_URL on static site and FRONTEND_URL on API, then redeploy both.',
        );
      }
    }, 12000);
    api(`/auth/activate/${token}`)
      .then((data) => {
        if (!cancelled) setInfo(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => clearTimeout(timer));
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (pin !== confirm) return setError('PINs do not match');
    if (!/^\d{4}$/.test(pin)) return setError('PIN must be 4 digits');
    try {
      const data = await api(`/auth/activate/${token}`, {
        method: 'POST',
        body: JSON.stringify({ pin }),
      });
      loginCustomer(data.token, data.customer);
      navigate('/customer');
    } catch (err) {
      setError(err.message);
    }
  }

  if (token === 'demo') {
    return (
      <AuthShell title="Activate account" subtitle="Use the link shared by the shop">
        <p className="text-center text-stone-600 text-sm">
          Open the activation link from WhatsApp, printed card, or QR code.
        </p>
        <Link to="/customer/login" className="theme-btn-secondary w-full mt-4 text-center block">
          Go to login
        </Link>
      </AuthShell>
    );
  }

  if (error && !info) {
    return (
      <AuthShell title="Activation">
        <p className="text-red-700 text-sm text-center whitespace-pre-wrap">{error}</p>
        <Link to="/" className="theme-btn-secondary w-full mt-4 text-center block">
          Back to home
        </Link>
      </AuthShell>
    );
  }

  if (!info) {
    return (
      <div className="theme-auth-bg min-h-screen flex items-center justify-center">
        <p className="text-gold-400">Loading…</p>
      </div>
    );
  }

  if (info.isActivated) {
    return (
      <AuthShell title="Already activated">
        <Link to="/customer/login" className="theme-btn-primary w-full text-center block">
          Login
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={`Welcome, ${info.name}`}
      subtitle={`${info.customerCode} — create your 4-digit PIN`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="PIN">
          <Input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          />
        </Field>
        <Field label="Confirm PIN">
          <Input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
          />
        </Field>
        {error && <p className="text-red-700 text-sm bg-red-50 rounded-lg p-2">{error}</p>}
        <button type="submit" className="theme-btn-primary w-full">
          Activate account
        </button>
      </form>
    </AuthShell>
  );
}
