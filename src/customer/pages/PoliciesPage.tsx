import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { TermsOfService } from "./policies/TermsOfService";
import { PrivacyPolicy } from "./policies/PrivacyPolicy";
import { RefundPolicy } from "./policies/RefundPolicy";
import { ShippingPolicy } from "./policies/ShippingPolicy";

const PoliciesPage = () => {
  const termsRef = useRef<HTMLDivElement>(null);
  const privacyRef = useRef<HTMLDivElement>(null);
  const refundRef = useRef<HTMLDivElement>(null);
  const shippingRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    const navbarHeight = 100;
    const y = ref.current.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (hash === "#terms") scrollToSection(termsRef);
    if (hash === "#privacy") scrollToSection(privacyRef);
    if (hash === "#refund") scrollToSection(refundRef);
    if (hash === "#shipping") scrollToSection(shippingRef);
  }, [location]);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 my-4 py-3 min-h-[80vh]">
        <h1 className="text-center text-[var(--color-brand)] font-bold">
          Policies & Legal Information
        </h1>
        <hr />
        <div className="flex flex-wrap -mx-2 mt-4">
          <div className="w-full md:w-1/4 px-2">
            <div className="bg-[var(--color-brand-cream)] border border-[var(--color-brand-border)] p-4 rounded-[var(--radius-card)]">
              <h5 className="text-[var(--color-brand)] font-bold mb-2.5">Policies</h5>
              <button
                onClick={() => scrollToSection(termsRef)}
                className="w-full bg-white border border-[var(--color-brand)] text-[var(--color-brand)] py-2.5 px-4 rounded-lg font-semibold mb-2.5 cursor-pointer transition-all duration-300 hover:bg-[var(--color-brand)] hover:text-white"
              >
                Terms & Conditions
              </button>
              <button
                onClick={() => scrollToSection(privacyRef)}
                className="w-full bg-white border border-[var(--color-brand)] text-[var(--color-brand)] py-2.5 px-4 rounded-lg font-semibold mb-2.5 cursor-pointer transition-all duration-300 hover:bg-[var(--color-brand)] hover:text-white"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => scrollToSection(refundRef)}
                className="w-full bg-white border border-[var(--color-brand)] text-[var(--color-brand)] py-2.5 px-4 rounded-lg font-semibold mb-2.5 cursor-pointer transition-all duration-300 hover:bg-[var(--color-brand)] hover:text-white"
              >
                Return & Refund Policy
              </button>
              <button
                onClick={() => scrollToSection(shippingRef)}
                className="w-full bg-white border border-[var(--color-brand)] text-[var(--color-brand)] py-2.5 px-4 rounded-lg font-semibold mb-2.5 cursor-pointer transition-all duration-300 hover:bg-[var(--color-brand)] hover:text-white"
              >
                Shipping & Payment Policy
              </button>
            </div>
          </div>
          <div className="w-full md:w-3/4 px-2">
            <TermsOfService ref={termsRef} />
            <PrivacyPolicy ref={privacyRef} />
            <RefundPolicy ref={refundRef} />
            <ShippingPolicy ref={shippingRef} />
          </div>
        </div>
      </div>
    </>
  );
};

export default PoliciesPage;
