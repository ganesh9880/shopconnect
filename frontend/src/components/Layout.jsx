import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import {
  BottomNav,
  MobileDrawer,
  MobileMenuButton,
  NavLinkItem,
} from './MobileNav';

const PUBLIC_LINKS = [
  ['Catalog', '/catalog'],
  ['Contact', '/contact'],
  ['Customer Login', '/customer/login'],
  ['Shop Login', '/admin/login'],
];

const ADMIN_LINKS = [
  ['Dashboard', '/admin'],
  ['Products', '/admin/products'],
  ['Customers', '/admin/customers'],
  ['Sales', '/admin/sales'],
  ['Ledger', '/admin/ledger'],
  ['Payments', '/admin/payments'],
  ['Inventory', '/admin/inventory'],
  ['Settings', '/admin/settings'],
];

const CUSTOMER_BOTTOM = [
  { to: '/customer', label: 'Home', icon: '⌂' },
  { to: '/customer/ledger', label: 'Ledger', icon: '📒' },
  { to: '/customer/pay', label: 'Pay', icon: '₹' },
  { to: '/catalog', label: 'Shop', icon: '🛍' },
];

function DesktopNav({ links }) {
  return (
    <nav className="hidden lg:flex flex-wrap gap-x-1 text-sm text-stone-200">
      {links.map(([label, path]) => (
        <Link
          key={path}
          to={path}
          className={`py-2 px-3 min-h-[44px] inline-flex items-center hover:text-gold-400 touch-manipulation rounded-lg hover:bg-white/5 ${
            path.includes('admin') && path.endsWith('/login') ? 'text-gold-400 font-medium' : ''
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col theme-page">
      <header className="sticky top-0 z-30 theme-header safe-area-top">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
          <BrandLogo imgClassName="h-11 sm:h-14 md:h-16 w-auto max-w-[55vw] object-contain object-left" />
          <DesktopNav links={PUBLIC_LINKS} />
          <MobileMenuButton open={menuOpen} onToggle={() => setMenuOpen((o) => !o)} />
        </div>
      </header>

      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
        {PUBLIC_LINKS.map(([label, path]) => (
          <NavLinkItem key={path} to={path}>
            {label}
          </NavLinkItem>
        ))}
      </MobileDrawer>

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-6 sm:py-8 page-main">
        <Outlet />
      </main>

      <footer className="border-t border-gold-400/25 bg-maroon-900/5 py-4 text-center text-xs text-stone-500">
        <p className="theme-subheading text-maroon-800/70">Sri Lakshmi Vastralayam</p>
        <p className="mt-1">Where Trust Meets Tradition</p>
      </footer>
    </div>
  );
}

export function AdminLayout() {
  const { admin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const navLinkClass = (path) =>
    `px-3 py-2.5 rounded-lg min-h-[44px] flex items-center touch-manipulation ${
      pathname === path || (path !== '/admin' && pathname.startsWith(path))
        ? 'bg-maroon-800 text-gold-400 border border-gold-500/30'
        : 'hover:bg-maroon-900/60 text-stone-200'
    }`;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row theme-admin-main">
      <aside className="hidden lg:flex w-60 theme-header text-white p-4 flex-col shrink-0 border-r border-gold-500/25">
        <BrandLogo to="/admin" imgClassName="h-12 w-auto object-contain mx-auto mb-2" />
        <p className="text-xs text-gold-400 text-center mb-1">Shop Panel</p>
        <p className="text-[10px] text-stone-400 text-center mb-6 italic">वस्त्रालयम्</p>
        <nav className="flex flex-col gap-1 text-sm flex-1">
          {ADMIN_LINKS.map(([label, path]) => (
            <Link key={path} to={path} className={navLinkClass(path)}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="theme-divider opacity-50" />
        <p className="text-xs text-stone-400 mb-2 truncate pt-2">{admin?.username}</p>
        <button
          type="button"
          onClick={logout}
          className="text-sm text-left text-gold-400 hover:underline py-2 min-h-[44px] touch-manipulation"
        >
          Logout
        </button>
      </aside>

      <header className="lg:hidden sticky top-0 z-30 theme-header text-white safe-area-top">
        <div className="flex items-center justify-between px-3 py-2 gap-2">
          <BrandLogo to="/admin" imgClassName="h-9 w-auto max-w-[40vw] object-contain" />
          <span className="text-xs text-gold-400 truncate flex-1 text-center">{admin?.username}</span>
          <MobileMenuButton open={menuOpen} onToggle={() => setMenuOpen((o) => !o)} />
        </div>
      </header>

      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Shop Panel">
        {ADMIN_LINKS.map(([label, path]) => (
          <NavLinkItem key={path} to={path} end={path === '/admin'}>
            {label}
          </NavLinkItem>
        ))}
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            logout();
          }}
          className="mt-4 mx-2 py-3 text-left text-gold-400 border-t border-gold-500/30 pt-4 min-h-[44px] touch-manipulation w-[calc(100%-1rem)]"
        >
          Logout
        </button>
      </MobileDrawer>

      <main className="flex-1 p-3 sm:p-6 overflow-x-hidden min-h-0 page-main">
        <Outlet />
      </main>
    </div>
  );
}

export function CustomerLayout() {
  const { customer, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col theme-page">
      <header className="sticky top-0 z-30 theme-header text-white safe-area-top">
        <div className="max-w-4xl mx-auto px-3 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <BrandLogo to="/customer" imgClassName="h-9 sm:h-10 w-auto shrink-0 object-contain" />
            <div className="min-w-0 hidden sm:block">
              <p className="text-sm truncate leading-tight text-gold-100">{customer?.name}</p>
              <p className="text-[10px] sm:text-xs text-gold-400">{customer?.customerCode}</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-1 text-sm items-center shrink-0">
            {[
              ['Dashboard', '/customer'],
              ['Ledger', '/customer/ledger'],
              ['Pay', '/customer/pay'],
              ['Catalog', '/catalog'],
            ].map(([label, path]) => (
              <Link
                key={path}
                to={path}
                className="py-2 px-2 hover:text-gold-400 touch-manipulation rounded"
              >
                {label}
              </Link>
            ))}
            <button
              type="button"
              onClick={logout}
              className="text-gold-400 py-2 px-2 touch-manipulation min-h-[44px]"
            >
              Logout
            </button>
          </nav>
          <MobileMenuButton open={menuOpen} onToggle={() => setMenuOpen((o) => !o)} />
        </div>
      </header>

      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Account">
        <NavLinkItem to="/customer" end>
          Dashboard
        </NavLinkItem>
        <NavLinkItem to="/customer/ledger">Ledger</NavLinkItem>
        <NavLinkItem to="/customer/pay">Pay</NavLinkItem>
        <NavLinkItem to="/catalog">Catalog</NavLinkItem>
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            logout();
          }}
          className="w-full text-left px-4 py-3.5 text-gold-400 min-h-[44px] touch-manipulation"
        >
          Logout
        </button>
      </MobileDrawer>

      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 page-main-with-bottom-nav md:pb-6">
        <Outlet />
      </main>

      <BottomNav items={CUSTOMER_BOTTOM} />
    </div>
  );
}
