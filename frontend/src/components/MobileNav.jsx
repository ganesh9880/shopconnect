import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function MobileMenuButton({ open, onToggle, label = 'Menu' }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={open ? 'Close menu' : 'Open menu'}
      className="lg:hidden flex flex-col justify-center items-center w-11 h-11 rounded-lg border border-stone-600 text-stone-200 hover:bg-stone-800 touch-manipulation"
    >
      <span
        className={`block h-0.5 w-5 bg-current transition-transform ${open ? 'translate-y-1.5 rotate-45' : ''}`}
      />
      <span className={`block h-0.5 w-5 bg-current my-1 ${open ? 'opacity-0' : ''}`} />
      <span
        className={`block h-0.5 w-5 bg-current transition-transform ${open ? '-translate-y-1.5 -rotate-45' : ''}`}
      />
      <span className="sr-only">{label}</span>
    </button>
  );
}

export function MobileDrawer({ open, onClose, children, title }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 touch-manipulation"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside
        className="absolute top-0 right-0 h-full w-[min(100%,280px)] bg-stone-950 text-stone-100 shadow-xl flex flex-col safe-area-pad"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between p-4 border-b border-stone-700">
          <span className="font-medium text-gold-400">{title}</span>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-2xl hover:bg-stone-800 rounded-lg touch-manipulation"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <nav className="flex flex-col p-2 overflow-y-auto flex-1" onClick={onClose}>
          {children}
        </nav>
      </aside>
    </div>
  );
}

export function NavLinkItem({ to, children, end = false }) {
  const { pathname } = useLocation();
  const active = end
    ? pathname === to
    : to === '/admin'
      ? pathname === '/admin'
      : pathname === to || pathname.startsWith(`${to}/`);
  return (
    <Link
      to={to}
        className={`block px-4 py-3.5 rounded-lg text-base touch-manipulation min-h-[44px] flex items-center ${
        active ? 'bg-maroon-800 text-gold-400 border border-gold-500/30' : 'hover:bg-maroon-900/50'
      }`}
    >
      {children}
    </Link>
  );
}

export function BottomNav({ items }) {
  const { pathname } = useLocation();
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950 border-t border-gold-500/30 safe-area-bottom"
      aria-label="Main navigation"
    >
      <div className="flex justify-around">
        {items.map(({ to, label, icon }) => {
          const active = pathname === to || (to !== '/' && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center justify-center py-2 min-h-[56px] touch-manipulation text-xs ${
                active ? 'text-gold-400' : 'text-stone-400'
              }`}
            >
              <span className="text-lg leading-none mb-0.5" aria-hidden>
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
