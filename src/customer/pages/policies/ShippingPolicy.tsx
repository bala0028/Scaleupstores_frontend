import React from "react";

export const ShippingPolicy = React.forwardRef<HTMLDivElement>((_, ref) => (
  <section
    ref={ref}
    className="bg-[var(--color-brand-cream)] border border-[var(--color-brand-border)] rounded-[var(--radius-card)] p-5 mb-6"
  >
    <h3 className="text-[var(--color-brand)] font-bold mb-2.5">🚚 Shipping & Payment Policy</h3>
    <p>
      <strong>Last Updated: 2025</strong>
    </p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">1. Shipping Timeline</h5>
    <p>
      Orders are shipped within <strong>24-48 hours.</strong> Delivery time:{" "}
      <strong>2–7 business days</strong>.
    </p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">2. Delivery Coverage</h5>
    <p>We ship PAN-India via trusted courier partners.</p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">3. Shipping Charges</h5>
    <p>Charges are shown at checkout. Some products may include free shipping.</p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">4. Order Tracking</h5>
    <p>You will receive updates + tracking link once dispatched.</p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">5. Delivery Confirmation</h5>
    <p>A signature/OTP may be required. After confirmation, responsibility transfers to you.</p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">6. Payment Methods</h5>
    <p>We accept the following via Razorpay:</p>
    <ul className="pl-5">
      <li>UPI</li>
      <li>Debit Cards</li>
    </ul>
    <p>
      <strong>❌ Cash on Delivery is NOT available.</strong>
    </p>
  </section>
));

ShippingPolicy.displayName = "ShippingPolicy";
