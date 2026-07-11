import React from "react";

export const TermsOfService = React.forwardRef<HTMLDivElement>((_, ref) => (
  <section
    ref={ref}
    className="bg-[var(--color-brand-cream)] border border-[var(--color-brand-border)] rounded-[var(--radius-card)] p-5 mb-6"
  >
    <h3 className="text-[var(--color-brand)] font-bold mb-2.5">📜 Terms & Conditions</h3>
    <p>
      <strong>Last Updated: 2025</strong>
    </p>
    <p>
      Welcome to <strong>VALLALAR NATURALS FROM VILLAGE KANNAMA</strong> ("Company", "we", "our",
      "us"). These Terms & Conditions ("Terms") govern your use of our website
      <strong> www.villagekannama.com</strong> ("Website") and its related services.
    </p>
    <p>
      By accessing or placing an order on this Website, you agree to be bound by these Terms. If you
      do not agree, please do not use our Website.
    </p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">1. General Use</h5>
    <ul className="pl-5">
      <li>You must be at least 18 years old to purchase from our Website.</li>
      <li>We sell natural products and related items.</li>
      <li>We may modify, update, discontinue, or restrict Website access anytime.</li>
    </ul>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">2. Product Information</h5>
    <p>
      We make every effort to display accurate product descriptions but do not guarantee error-free
      content. Packaging and colors may vary slightly.
    </p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">3. Orders & Acceptance</h5>
    <p>Placing an order does not guarantee acceptance.</p>
    <p>Orders are accepted only after successful Razorpay payment.</p>
    <p>We may cancel orders due to:</p>
    <ul className="pl-5">
      <li>Payment failure</li>
      <li>Incorrect information</li>
      <li>Product unavailability</li>
      <li>Suspicious activity</li>
    </ul>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">4. Pricing</h5>
    <ul className="pl-5">
      <li>Prices are listed in INR and may change without notice.</li>
      <li>The checkout price is final.</li>
    </ul>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">5. Payments</h5>
    <p>We accept ONLINE PAYMENT ONLY via Razorpay:</p>
    <ul className="pl-5">
      <li>Debit Cards</li>
      <li>Credit Cards</li>
      <li>UPI</li>
      <li>Net Banking</li>
      <li>Wallets</li>
    </ul>
    <p>
      <strong>❌ Cash on Delivery (COD) is NOT available.</strong>
    </p>
    <p>Payments are securely processed by Razorpay. You agree to their Terms & Privacy Policy.</p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">6. Shipping</h5>
    <p>Shipping timelines appear in the Shipping & Payment Policy.</p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">
      7. Cancellations / Returns / Refunds
    </h5>
    <p>
      <strong>We do NOT accept cancellations, returns, or refunds.</strong>
    </p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">8. Intellectual Property</h5>
    <p>
      All content on this Website is owned by VALLALAR NATURALS FROM VILLAGE KANNAMA. Unauthorized
      use is prohibited.
    </p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">9. Prohibited Activities</h5>
    <ul className="pl-5">
      <li>Misuse of Website</li>
      <li>Uploading harmful files</li>
      <li>Unauthorized access attempts</li>
      <li>Illegal activities</li>
    </ul>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">10. Limitation of Liability</h5>
    <p>
      We are not responsible for courier delays, misuse of products, technical issues, or indirect
      losses. Use of the Website is at your own risk.
    </p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">11. Indemnification</h5>
    <p>
      You agree to indemnify VALLALAR NATURALS FROM VILLAGE KANNAMA against any claims arising from
      misuse of our services.
    </p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">12. Governing Law</h5>
    <p>These Terms follow Indian Law. Disputes fall under Tamil Nadu jurisdiction.</p>
    <h5 className="text-[var(--color-brand)] font-semibold mt-4">13. Contact Info</h5>
    <p>
      VALLALAR NATURALS FROM VILLAGE KANNAMA
      <br />
      No. 2, South Street, Abatharanapuram, Serakuppam Post,
      <br />
      Vadalur - 607303
      <br />
      Email: villagekannamavallalarnaturals@gmail.com
      <br />
      Phone: +91 63747 30489
    </p>
  </section>
));

TermsOfService.displayName = "TermsOfService";
