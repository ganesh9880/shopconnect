import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import WhatsAppLink from '../components/WhatsAppLink';

export default function ProductDetail() {
  const { code } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api(`/products/public/${code}`).then(setProduct).catch(console.error);
  }, [code]);

  if (!product) return <p>Loading...</p>;

  const inquiryMessage = `Hello,\n\nI am interested in Product ${product.code} — ${product.name}.`;
  const shareUrl = window.location.href;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-2">
        {(product.images?.length ? product.images : [{ url: null }]).map((img, i) =>
          img.url ? (
            <img key={i} src={img.url} alt="" className="rounded-lg w-full max-h-96 object-cover" />
          ) : (
            <div key={i} className="bg-stone-200 h-64 rounded-lg flex items-center justify-center">
              No image
            </div>
          ),
        )}
      </div>
      <div>
        <p className="text-sm text-stone-500">{product.code}</p>
        <h1 className="theme-heading text-3xl">{product.name}</h1>
        <div className="theme-divider max-w-[100px] my-3" />
        <p className="text-2xl font-semibold text-maroon-700 mt-2">
          ₹{product.sellingPrice.toLocaleString('en-IN')}
        </p>
        <p className="mt-2 text-sm">{product.computedStatus || product.status}</p>
        <p className="mt-4 text-stone-600">{product.description}</p>
        <div className="flex gap-3 mt-6">
          <WhatsAppLink
            message={inquiryMessage}
            className="theme-btn-primary !bg-[#128C7E] !border-[#0d6b60] inline-flex"
          >
            WhatsApp Inquiry
          </WhatsAppLink>
          <button
            type="button"
            onClick={() => navigator.share?.({ title: product.name, url: shareUrl })}
            className="theme-btn-secondary"
          >
            Share Product
          </button>
        </div>
      </div>
    </div>
  );
}
