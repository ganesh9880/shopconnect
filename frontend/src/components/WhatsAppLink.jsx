import { useShop } from '../context/ShopContext';

/**
 * Opens WhatsApp chat with the shop number from Admin → Settings.
 */
export default function WhatsAppLink({ message, children, className = '', onMissing }) {
  const { getWhatsAppUrl, whatsappConfigured, loading } = useShop();

  if (loading) {
    return (
      <span className={`text-sm text-stone-400 ${className}`}>Loading…</span>
    );
  }

  const url = getWhatsAppUrl(message);

  if (!whatsappConfigured || !url) {
    if (onMissing) return onMissing();
    return (
      <p className={`text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 ${className}`}>
        WhatsApp is not set up yet. Shop owner: open <strong>Admin → Settings</strong> and
        save your real WhatsApp number (example: <code>919876543210</code> — 91 + 10-digit
        mobile, no spaces).
      </p>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
