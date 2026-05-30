import { useEffect, useState } from 'react';
import { api, apiForm } from '../../api/client';
import { useShop } from '../../context/ShopContext';
import { Alert, Btn, Card, Field, Input, PageHeader } from '../../components/admin/ui';

export default function AdminSettings() {
  const { refreshShop } = useShop();
  const [form, setForm] = useState({
    shopName: '',
    tagline: '',
    whatsapp: '',
    upiId: '',
  });
  const [qrPreview, setQrPreview] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api('/settings')
      .then((s) => {
        setForm({
          shopName: s.shopName || '',
          tagline: s.tagline || '',
          whatsapp: s.whatsapp || '',
          upiId: s.upiId || '',
        });
        if (s.upiQrPath) setQrPreview(`/uploads/${s.upiQrPath.replace(/\\/g, '/')}`);
      })
      .catch(() => {});
  }, []);

  async function save(e) {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      const fd = new FormData();
      fd.append('shopName', form.shopName);
      fd.append('tagline', form.tagline);
      fd.append('whatsapp', form.whatsapp);
      fd.append('upiId', form.upiId);
      if (qrFile) fd.append('upiQr', qrFile);
      const updated = await apiForm('/settings', fd, 'PUT');
      setMsg('Settings saved');
      if (updated.upiQrUrl) setQrPreview(updated.upiQrUrl);
      setQrFile(null);
      await refreshShop();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader title="Shop settings" />
      {msg && <Alert type="success">{msg}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <Card className="p-4 max-w-lg">
        <form onSubmit={save} className="space-y-4">
          <Field label="Shop name">
            <Input
              value={form.shopName}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
            />
          </Field>
          <Field label="Tagline">
            <Input
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            />
          </Field>
          <Field label="WhatsApp number (must be registered on WhatsApp)">
            <Input
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="9876543210 or 919876543210"
            />
            <p className="text-xs text-stone-500 mt-1">
              Use the shop&apos;s real mobile number. 10 digits (we add 91) or full 91XXXXXXXXXX.
              No spaces. Wrong numbers show &quot;isn&apos;t on WhatsApp&quot; in the app.
            </p>
          </Field>
          <Field label="UPI ID">
            <Input
              value={form.upiId}
              onChange={(e) => setForm({ ...form, upiId: e.target.value })}
              placeholder="name@bank"
            />
          </Field>
          <Field label="UPI QR image">
            {qrPreview && (
              <img src={qrPreview} alt="UPI QR" className="w-48 h-48 object-contain border rounded mb-2" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setQrFile(e.target.files?.[0] || null)}
              className="text-sm w-full"
            />
          </Field>
          <Btn type="submit">Save settings</Btn>
        </form>
      </Card>
    </div>
  );
}
