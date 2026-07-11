import React, { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

import config from "@/shared/config/clientConfig";
const WHATSAPP_NUMBER = config.social.whatsapp?.number ?? ""; // no + sign
const DEFAULT_MSG = config.social.whatsapp?.defaultMessage ?? "";

const WhatsAppWidget = ({ inNavbar }: { inNavbar?: boolean }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const openWhatsApp = () => {
    const msg = encodeURIComponent(DEFAULT_MSG);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
    window.open(url, "_blank");
  };

  return (
    <>
      {/* Desktop Floating Button */}
      {!inNavbar && !isMobile && (
        <button
          className="fixed right-[33px] bottom-[38px] z-[2061] bg-[#25d366] text-white border-none rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.13)] flex items-center justify-center cursor-pointer transition-[box-shadow_0.21s,background_0.23s] w-[50px] h-[50px] hover:bg-[#128c7e] hover:shadow-[0_8px_24px_rgba(39,187,94,0.22)]"
          aria-label="Chat on WhatsApp"
          onClick={openWhatsApp}
        >
          <FaWhatsapp size={27} />
        </button>
      )}

      {/* Mobile Navbar Icon */}
      {inNavbar && isMobile && (
        <button
          className="bg-transparent border-none p-[0_6px] cursor-pointer"
          aria-label="Chat on WhatsApp"
          onClick={openWhatsApp}
        >
          <FaWhatsapp size={23} className="text-[#25d366]" />
        </button>
      )}
    </>
  );
};

export default WhatsAppWidget;
