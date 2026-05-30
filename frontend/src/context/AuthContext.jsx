import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const raw = localStorage.getItem('adminUser');
    return raw ? JSON.parse(raw) : null;
  });
  const [customer, setCustomer] = useState(() => {
    const raw = localStorage.getItem('customerUser');
    return raw ? JSON.parse(raw) : null;
  });

  const loginAdmin = useCallback((token, user) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(user));
    setAdmin(user);
  }, []);

  const loginCustomer = useCallback((token, user) => {
    localStorage.setItem('customerToken', token);
    localStorage.setItem('customerUser', JSON.stringify(user));
    setCustomer(user);
  }, []);

  const logout = useCallback(async () => {
    try {
      const { api } = await import('../api/client.js');
      await api('/auth/logout', { method: 'POST' });
    } catch {
      /* ignore */
    }
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerUser');
    setAdmin(null);
    setCustomer(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ admin, customer, loginAdmin, loginCustomer, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
