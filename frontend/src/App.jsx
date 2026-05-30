import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { PublicLayout, AdminLayout, CustomerLayout } from './components/Layout';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import CustomerLogin from './pages/customer/Login';
import Activate from './pages/customer/Activate';
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerLedger from './pages/customer/Ledger';
import CustomerPay from './pages/customer/Pay';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCustomers from './pages/admin/Customers';
import AdminPayments from './pages/admin/Payments';
import AdminLedger from './pages/admin/Ledger';
import AdminSales from './pages/admin/Sales';
import AdminInventory from './pages/admin/Inventory';
import AdminSettings from './pages/admin/Settings';

function RequireAdmin({ children }) {
  const { admin } = useAuth();
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}

function RequireCustomer({ children }) {
  const { customer } = useAuth();
  if (!customer) return <Navigate to="/customer/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ShopProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="catalog/:code" element={<ProductDetail />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="customer/login" element={<CustomerLogin />} />
          <Route path="activate/:token" element={<Activate />} />
          <Route
            path="admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="sales" element={<AdminSales />} />
            <Route path="ledger" element={<AdminLedger />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route
            path="customer"
            element={
              <RequireCustomer>
                <CustomerLayout />
              </RequireCustomer>
            }
          >
            <Route index element={<CustomerDashboard />} />
            <Route path="ledger" element={<CustomerLedger />} />
            <Route path="pay" element={<CustomerPay />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </ShopProvider>
    </AuthProvider>
  );
}
