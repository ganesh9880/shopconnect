import { Link } from 'react-router-dom';

/**
 * Shop logo — file at /public/logo.png
 */
export default function BrandLogo({
  to = '/',
  className = '',
  imgClassName = 'h-16 md:h-20 w-auto object-contain',
  showTagline = false,
}) {
  const img = (
    <img
      src="/logo.png"
      alt="Sri Lakshmi Vastralayam — Where Trust Meets Tradition"
      className={imgClassName}
    />
  );

  const content = (
    <span className={`inline-flex flex-col items-start ${className}`}>
      {img}
      {showTagline && (
        <span className="text-gold-500 text-xs font-display italic mt-1 hidden sm:block">
          Where Trust Meets Tradition
        </span>
      )}
    </span>
  );

  if (to) {
    return (
      <Link to={to} className="shrink-0 focus:outline-none focus:ring-2 focus:ring-gold-400 rounded">
        {content}
      </Link>
    );
  }

  return content;
}
