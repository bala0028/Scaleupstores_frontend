import React from "react";

export const AboutValues = () => (
  <section className="max-w-[820px] mx-auto mb-10 leading-relaxed bg-gradient-to-br from-[#f1fbf4] to-white rounded-[var(--radius-card)] p-8 shadow-[0_10px_25px_rgba(0,0,0,0.04)]">
    <p className="text-base text-foreground mb-5">
      At Vallalar Naturals, we do not chase trends or shortcuts.
    </p>
    <ul className="list-none p-0 my-6">
      <li className="text-base py-1.5 text-foreground pl-[22px] relative before:content-['✓'] before:absolute before:left-0 before:text-[var(--color-brand)] before:font-semibold">
        No harmful chemicals
      </li>
      <li className="text-base py-1.5 text-foreground pl-[22px] relative before:content-['✓'] before:absolute before:left-0 before:text-[var(--color-brand)] before:font-semibold">
        No parabens or sulphates
      </li>
      <li className="text-base py-1.5 text-foreground pl-[22px] relative before:content-['✓'] before:absolute before:left-0 before:text-[var(--color-brand)] before:font-semibold">
        No artificial colours
      </li>
      <li className="text-base py-1.5 text-foreground pl-[22px] relative before:content-['✓'] before:absolute before:left-0 before:text-[var(--color-brand)] before:font-semibold">
        No synthetic fragrances
      </li>
    </ul>
    <p className="text-base text-foreground mb-5">
      Every product is made in small batches, maintaining purity, hygiene, and authenticity.
    </p>
  </section>
);
