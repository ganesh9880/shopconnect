import WhatsAppLink from '../components/WhatsAppLink';

export default function Contact() {
  return (
    <div className="max-w-lg mx-auto text-center">
      <h1 className="theme-heading-lg mb-2">Contact Us</h1>
      <div className="theme-divider max-w-[100px] mx-auto mb-6" />
      <p className="text-stone-700 mb-6 max-w-md mx-auto">
        Visit our shop or message us on WhatsApp for orders and inquiries.
      </p>
      <WhatsAppLink
        message="Hello, I would like to know more about your shop."
        className="theme-btn-primary inline-flex !bg-[#128C7E] !border-[#0d6b60]"
      >
        Chat on WhatsApp
      </WhatsAppLink>
    </div>
  );
}
