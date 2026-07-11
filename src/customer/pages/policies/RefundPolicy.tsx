import React from "react";

export const RefundPolicy = React.forwardRef<HTMLDivElement>((_, ref) => (
  <section
    ref={ref}
    className="bg-[var(--color-brand-cream)] border border-[var(--color-brand-border)] rounded-[var(--radius-card)] p-5 mb-6"
  >
    <h3 className="text-[var(--color-brand)] font-bold mb-2.5">❌ Return & Refund Policy</h3>
    <p>
      <strong>Last Updated: 2025</strong>
    </p>
    <p>
      At <strong>Vallalar Naturals – Village Kannama</strong>, we take great care in preparing and
      delivering 100% natural, fresh, and handmade products. Due to the nature of our products, we
      follow a strict
      <strong> no return, no exchange, and no refund policy</strong>.
    </p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">No Return or Exchange Policy</h5>
    <p>
      All products sold on <strong>www.villagekannama.com</strong> are
      <strong> non-returnable and non-exchangeable</strong>. Once an order has been delivered, we
      cannot accept returns or exchanges, as we cannot guarantee product quality, safety, or hygiene
      after delivery.
    </p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">
      Damaged, Defective, or Wrong Item Received
    </h5>
    <p>
      In the rare event that you receive a product that is damaged, leaked, defective, or incorrect,
      please contact us within
      <strong> 24 hours of delivery</strong> by emailing:
    </p>
    <p>
      <strong>villagekannamavallalarnaturals@gmail.com</strong>
    </p>
    <p>Please include the following details in your email:</p>
    <ul className="pl-5">
      <li>Your Order ID</li>
      <li>Clear photos of the product and outer packaging</li>
      <li>Unboxing video (if available)</li>
    </ul>
    <p>After verification of the issue, we may:</p>
    <ul className="pl-5">
      <li>Arrange a replacement for the same product, or</li>
      <li>Initiate a refund if a replacement is unavailable</li>
    </ul>
    <p>
      Refunds or replacements will only be processed for valid and verified cases of damaged or
      incorrect items.
    </p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">Non-Returnable Items</h5>
    <p>The following items are strictly non-returnable and non-refundable:</p>
    <ul className="pl-5">
      <li>All edible products, natural powders, oils, soaps, and personal care items</li>
      <li>Opened, unsealed, or used products</li>
      <li>Items returned without prior communication or approval</li>
      <li>Products damaged due to improper storage or handling by the customer</li>
    </ul>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">Order Cancellation</h5>
    <p>
      Orders can be cancelled only within
      <strong> 1 hour of placing the order</strong>, provided the order has not yet been packed or
      shipped.
    </p>
    <p>To request a cancellation, please email us immediately with your Order ID at:</p>
    <p>
      <strong>villagekannamavallalarnaturals@gmail.com</strong>
    </p>
    <p>
      Once an order has been processed or shipped, it cannot be cancelled, returned, or refunded.
    </p>
  </section>
));

RefundPolicy.displayName = "RefundPolicy";
