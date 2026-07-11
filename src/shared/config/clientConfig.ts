export interface ClientConfig {
  brand: { name: string; tagline?: string };
  logo: { customer: string; admin: string };
  social: {
    whatsapp?: { number: string; defaultMessage: string };
    instagram?: { username: string };
  };
  payment: {
    razorpayKey: string;
    razorpayName: string;
    razorpayDescription: string;
    /** Which payment methods to offer. Single item = no selector shown, method is auto-used. */
    methods: ("online" | "cod")[];
  };
  couriers: { value: string; label: string }[];
  admin: { brandName: string };
  theme?: {
    brand?: string;
    brandAction?: string;
    brandHover?: string;
    brandCream?: string;
    brandBorder?: string;
    brandBorderLight?: string;
    fonts?: {
      /** CSS font-family string, e.g. "'Poppins', sans-serif" */
      body?: string;
      /** CSS font-family string, e.g. "'Lora', serif" */
      heading?: string;
      /** CSS font-family string for brand name in navbar, e.g. "'Playfair Display', serif" */
      brand?: string;
      /** Full Google Fonts URL to inject — include all families needed */
      googleFontsUrl?: string;
    };
  };
}

const config: ClientConfig = {
  brand: { name: "Vallalar Natural's" },
  logo: { customer: "/Logo.png", admin: "/Logo.png" },
  social: {
    whatsapp: {
      number: "916374730489",
      defaultMessage: "Hi, I'm visiting your online store and need some help",
    },
    instagram: { username: "village_kannama" },
  },
  payment: {
    razorpayKey: import.meta.env.VITE_RAZORPAY_KEY || "",
    razorpayName: "Vallalar Natural's",
    razorpayDescription: "Order Payment",
    methods: ["online"] as ("online" | "cod")[],
  },
  couriers: [
    { value: "Professional courier", label: "Professional Courier" },
    { value: "ST courier", label: "ST Courier" },
    { value: "DTDC courier", label: "DTDC Courier" },
  ],
  admin: { brandName: "Vallalar Natural's Admin" },
};

export default config;
