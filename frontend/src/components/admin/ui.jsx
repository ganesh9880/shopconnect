export function PageHeader({ title, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="theme-heading-lg">{title}</h1>
        <div className="theme-divider max-w-[120px] mt-2 mb-0" />
      </div>
      {children}
    </div>
  );
}

export function Card({ children, className = '' }) {
  return <div className={`theme-card ${className}`}>{children}</div>;
}

export function Btn({ children, variant = 'primary', className = '', type = 'button', ...props }) {
  const styles = {
    primary: 'theme-btn-primary text-sm !min-h-[40px] !py-1.5',
    secondary: 'theme-btn-secondary text-sm !min-h-[40px] !py-1.5',
    danger:
      'text-sm min-h-[40px] py-1.5 px-3 rounded-lg border border-red-700 text-red-700 hover:bg-red-50 touch-manipulation',
    ghost: 'theme-btn-ghost text-sm',
  };
  return (
    <button type={type} className={`${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="text-maroon-800/80 font-medium mb-1 block">{label}</span>
      {children}
    </label>
  );
}

export function Input(props) {
  return <input className="theme-input text-sm" {...props} />;
}

export function Select({ children, ...props }) {
  return (
    <select className="theme-input text-sm" {...props}>
      {children}
    </select>
  );
}

export function Textarea(props) {
  return <textarea className="theme-input text-sm" rows={3} {...props} />;
}

export function Modal({ open, title, onClose, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-center p-0 sm:p-4 bg-maroon-900/50 overflow-y-auto">
      <div
        className={`theme-card-elevated w-full max-h-[92vh] overflow-y-auto ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} sm:my-8 rounded-t-2xl sm:rounded-xl`}
      >
        <div className="flex items-center justify-between border-b border-gold-400/30 px-4 py-3 bg-gradient-to-r from-maroon-50 to-cream">
          <h2 className="theme-heading text-xl">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-maroon-700 hover:bg-maroon-100 rounded-lg touch-manipulation"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export function Alert({ type = 'info', children }) {
  const styles = {
    info: 'bg-cream border-gold-400/40 text-maroon-800',
    success: 'bg-green-50 border-green-300 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
  };
  return (
    <div className={`border rounded-lg p-3 text-sm mb-4 ${styles[type]}`}>{children}</div>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 mb-4 border-b border-gold-400/30 overflow-x-auto">
      {tabs.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`px-4 py-2.5 text-sm whitespace-nowrap -mb-px border-b-2 touch-manipulation min-h-[44px] ${
            active === id
              ? 'border-maroon-700 text-maroon-800 font-medium'
              : 'border-transparent text-stone-500 hover:text-maroon-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function TableWrap({ children }) {
  return <div className="table-scroll">{children}</div>;
}

export function formatMoney(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}
