import { Link } from 'react-router-dom';
import WhatsAppLink from './WhatsAppLink';

const STATUS_LABEL = {
  AVAILABLE: 'In Stock',
  LOW_STOCK: 'Low Stock',
  OUT_OF_STOCK: 'Out of Stock',
};

export default function ProductCard({ product }) {
  const image = product.images?.[0]?.url;
  const status = product.computedStatus || product.status;
  const inquiryMessage = `Hello,\n\nI am interested in Product ${product.code} — ${product.name}.`;

  return (
    <article className="theme-card overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      <Link to={`/catalog/${product.code}`}>
        <div className="aspect-[4/5] bg-cream-dark flex items-center justify-center border-b border-gold-400/20">
          {image ? (
            <img src={image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-stone-400 text-sm font-display">Sri Lakshmi</span>
          )}
        </div>
      </Link>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-gold-600 font-medium tracking-wide">{product.code}</p>
        <h3 className="font-medium text-maroon-800 line-clamp-2 leading-snug">{product.name}</h3>
        <p className="text-lg font-semibold text-maroon-700 mt-1">
          ₹{product.sellingPrice.toLocaleString('en-IN')}
        </p>
        <p
          className={`text-xs mt-1 font-medium ${
            status === 'OUT_OF_STOCK' ? 'text-red-700' : 'text-amber-800'
          }`}
        >
          {STATUS_LABEL[status] || status}
        </p>
        <div className="mt-auto pt-3 flex gap-2">
          <WhatsAppLink
            message={inquiryMessage}
            className="flex-1 text-center text-xs py-2.5 min-h-[44px] flex items-center justify-center bg-[#128C7E] text-white rounded-lg border border-[#0d6b60]"
          >
            WhatsApp
          </WhatsAppLink>
          <Link
            to={`/catalog/${product.code}`}
            className="flex-1 text-center text-xs py-2.5 min-h-[44px] flex items-center justify-center theme-btn-secondary !min-h-[44px] !py-2"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
