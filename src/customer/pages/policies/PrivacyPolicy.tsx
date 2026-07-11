import React from "react";

export const PrivacyPolicy = React.forwardRef<HTMLDivElement>((_, ref) => (
  <section
    ref={ref}
    className="bg-[var(--color-brand-cream)] border border-[var(--color-brand-border)] rounded-[var(--radius-card)] p-5 mb-6"
  >
    <h3 className="text-[var(--color-brand)] font-bold mb-2.5">🔐 Privacy Policy</h3>
    <p>
      <strong>Last Updated: 2025</strong>
    </p>
    <p>
      We value your privacy. This Policy explains how we collect, use, store, and protect your data
      when visiting <strong>www.villagekannama.com</strong>.
    </p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">1. Information We Collect</h5>
    <p>
      <strong>a) Personal Information</strong>
    </p>
    <ul className="pl-5">
      <li>Name</li>
      <li>Address</li>
      <li>Email</li>
      <li>Phone number</li>
      <li>Payment details (processed securely by Razorpay)</li>
    </ul>
    <p>
      <strong>b) Non-Personal Information</strong>
    </p>
    <ul className="pl-5">
      <li>Browser details</li>
      <li>Device info</li>
      <li>IP address</li>
      <li>Cookies & usage patterns</li>
    </ul>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">2. How We Use Your Information</h5>
    <ul className="pl-5">
      <li>To process and deliver orders</li>
      <li>To provide customer support</li>
      <li>To prevent fraud</li>
      <li>To improve our website</li>
      <li>To send essential updates</li>
    </ul>
    <p>
      <strong>We do NOT sell your data.</strong>
    </p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">3. Payments via Razorpay</h5>
    <p>Your payment details are not stored by us. Razorpay handles all financial data.</p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">4. Cookies</h5>
    <p>Cookies help improve functionality and analytics.</p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">5. Information Sharing</h5>
    <ul className="pl-5">
      <li>Courier partners</li>
      <li>Razorpay</li>
      <li>Legal authorities</li>
    </ul>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">6. Data Security</h5>
    <p>We use industry-level protection but cannot guarantee 100% safety due to internet risks.</p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">7. Data Retention</h5>
    <p>We retain your data only as required for legal, transactional, and service reasons.</p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">8. Your Rights</h5>
    <ul className="pl-5">
      <li>Request data correction</li>
      <li>Request deletion (where legally possible)</li>
      <li>Opt-out of emails</li>
    </ul>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">9. External Links</h5>
    <p>We are not responsible for content or privacy practices of third-party websites.</p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">10. Changes</h5>
    <p>We may update this policy anytime. Updates appear on this page.</p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">11. Grievance Officer</h5>
    <p>
      Email: villagekannamavallalarnaturals@gmail.com
      <br />
      Phone: +91 63747 30489
    </p>
  </section>
));

PrivacyPolicy.displayName = "PrivacyPolicy";
