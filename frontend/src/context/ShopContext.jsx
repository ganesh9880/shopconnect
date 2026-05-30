import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from '../utils/whatsapp';

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/payments/shop-info')
      .then(setShop)
      .catch(() => setShop(null))
      .finally(() => setLoading(false));
  }, []);

  const whatsappDigits = normalizeWhatsAppNumber(shop?.whatsapp);
  const whatsappConfigured = Boolean(whatsappDigits);

  const getWhatsAppUrl = useCallback(
    (message) => buildWhatsAppUrl(shop?.whatsapp, message),
    [shop?.whatsapp],
  );

  return (
    <ShopContext.Provider
      value={{
        shop,
        loading,
        whatsappConfigured,
        whatsappDisplay: whatsappDigits ? `+${whatsappDigits}` : null,
        getWhatsAppUrl,
        refreshShop: () => api('/payments/shop-info').then(setShop),
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used within ShopProvider');
  return ctx;
}
