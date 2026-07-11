import { useEffect, useState } from "react";
import { categoryService } from "@/shared/api/services";
import config from "@/shared/config/clientConfig";
import type { Category } from "@/shared/api/services/types";

const Footer = ({ categories = [] as Category[] }) => {
  const [_footerCategories, setFooterCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (categories.length > 0) {
      setFooterCategories(categories);
      return;
    }
    categoryService.customer
      .all()
      .then((res) => {
        if (!cancelled && res.data?.status && Array.isArray(res.data.data))
          setFooterCategories(res.data.data);
      })
      .catch((err) => {
        if (!cancelled) console.error("Error fetching footer categories:", err);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <footer className="bg-brand-cream border-t-2 border-brand-border text-foreground">
      <div className="relative w-full h-[300px] overflow-hidden group">
        <iframe
          title="Shop Location"
          src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3908.817881178193!2d79.56427387505359!3d11.564909888635887!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTHCsDMzJzUzLjciTiA3OcKwMzQnMDAuNyJF!5e0!3m2!1sen!2sin!4v1763051572292!5m2!1sen!2sin"
          width="100%"
          height="300"
          className="border-0"
          allowFullScreen
          loading="lazy"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black/50 text-white flex items-center justify-center text-xl font-medium tracking-wide transition-opacity duration-300 pointer-events-none group-hover:opacity-0">
          <span>Find Us Here</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 [&_a]:text-brand [&_a]:no-underline [&_a:hover]:underline">
        <div className="flex flex-wrap -mx-2">
          <div className="w-full md:w-1/3 px-2 mb-4 text-center md:text-left">
            <h5 className="font-bold text-success mb-2">{config.brand.name}</h5>
            <p className="small mb-1">No. 2, South Street Abatharanapuram Serakuppam Post,</p>
            <p className="small mb-1">Vadalur - 607303</p>
            <p className="small mb-1">📞 +91 7639157615</p>
            <p className="small">📧 vallalarnaturalsvillagekannama@gmail.com</p>
          </div>
          <div className="w-full md:w-1/3 px-2 mb-4 text-center">
            <h6 className="font-bold text-success mb-2">Quick Links</h6>
            <ul className="list-none pl-0 text-sm">
              <li>
                <a href="/policies#terms">Terms & Conditions</a>
              </li>
              <li>
                <a href="/policies#privacy">Privacy Policy</a>
              </li>
              <li>
                <a href="/policies#refund">Return & Refund Policy</a>
              </li>
              <li>
                <a href="/policies#shipping">Shipping & Payment Policy</a>
              </li>
            </ul>
          </div>
          <div className="w-full md:w-1/3 px-2 text-center">
            <h6 className="font-bold text-success mb-3">Follow Us</h6>
            <div className="flex justify-center items-center w-full">
              <a
                href="https://www.instagram.com/village_kannama/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-[45px] h-[45px] rounded-full bg-white transition-all duration-300 hover:scale-110"
                title="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="url(#instaGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="block"
                >
                  <defs>
                    <linearGradient id="instaGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fdf497" />
                      <stop offset="45%" stopColor="#fd5949" />
                      <stop offset="60%" stopColor="#d6249f" />
                      <stop offset="90%" stopColor="#285AEB" />
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-brand-cream text-foreground border-t border-brand-border text-center py-3">
        <small>
          © {new Date().getFullYear()} {config.brand.name}. Powered by{" "}
          <a
            href="https://www.instagram.com/scaleupstores"
            target="_blank"
            rel="noopener noreferrer"
          >
            Scaleup Stores
          </a>
        </small>
      </div>
    </footer>
  );
};

export default Footer;
