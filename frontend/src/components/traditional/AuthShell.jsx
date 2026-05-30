import { Link } from 'react-router-dom';
import BrandLogo from '../BrandLogo';

export default function AuthShell({ title, subtitle, children, backTo = '/' }) {
  return (
    <div className="theme-auth-bg flex flex-col items-center justify-center p-4 safe-area-pad">
      <Link to={backTo} className="mb-6 shrink-0">
        <BrandLogo
          imgClassName="h-24 sm:h-28 w-auto object-contain drop-shadow-lg"
          className="items-center"
        />
      </Link>
      <div className="theme-auth-frame w-full max-w-md p-6 sm:p-8">
        <h1 className="theme-heading text-2xl sm:text-3xl text-center">{title}</h1>
        {subtitle && (
          <p className="text-center text-stone-600 text-sm mt-2">{subtitle}</p>
        )}
        <div className="theme-divider" />
        {children}
      </div>
      <p className="theme-subheading text-sm mt-6 text-gold-400/90 text-center">
        Where Trust Meets Tradition
      </p>
    </div>
  );
}
