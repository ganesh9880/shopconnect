import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';

export default function Home() {
  return (
    <section className="text-center py-6 md:py-10">
      <BrandLogo
        to={null}
        imgClassName="h-36 sm:h-44 md:h-52 w-auto object-contain mx-auto drop-shadow-sm"
        className="items-center mx-auto"
      />
      <p className="theme-subheading text-lg mt-4">Where Trust Meets Tradition</p>
      <div className="theme-divider max-w-xs mx-auto mt-4" />
      <p className="max-w-xl mx-auto mt-6 text-stone-700 leading-relaxed px-2">
        Trusted textiles for your family — sarees, dress materials, nighties, and more.
        Browse our catalog or sign in to view your purchases and balance.
      </p>
      <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 mt-10 px-2">
        <Link to="/catalog" className="theme-btn-primary w-full sm:w-auto">
          Browse Catalog
        </Link>
        <Link to="/customer/login" className="theme-btn-secondary w-full sm:w-auto">
          Customer Login
        </Link>
        <Link
          to="/contact"
          className="theme-btn-ghost w-full sm:w-auto text-maroon-800 underline"
        >
          Contact Shop
        </Link>
      </div>
    </section>
  );
}
