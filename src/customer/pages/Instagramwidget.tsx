import React, { useState, useEffect } from "react";
import { FaInstagram } from "react-icons/fa";

import config from "@/shared/config/clientConfig";
const INSTA_USERNAME = config.social.instagram?.username ?? "";

const InstagramWidget = ({ inNavbar }: { inNavbar?: boolean }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleOpenInstagram = () => {
    window.open(`https://instagram.com/${INSTA_USERNAME}`, "_blank");
  };

  return (
    <>
      {/* Floating Instagram FAB (Desktop only) */}
      {!inNavbar && !isMobile && (
        <button
          className="fixed right-[33px] bottom-[110px] z-[2061] bg-gradient-to-br from-[#fd1d1d] via-[#fcb045] to-[#e1306c] text-white border-none rounded-full w-[50px] h-[50px] shadow-[0_4px_16px_rgba(250,68,142,0.23)] flex items-center justify-center cursor-pointer transition-[box-shadow_0.21s,opacity_0.21s] hover:opacity-90 hover:shadow-[0_8px_24px_rgba(225,48,108,0.25)] focus:opacity-90 focus:shadow-[0_8px_24px_rgba(225,48,108,0.25)] max-[600px]:w-[44px] max-[600px]:h-[44px] max-[600px]:right-[14px] max-[600px]:bottom-[70px]"
          aria-label="Open Instagram"
          onClick={handleOpenInstagram}
        >
          <FaInstagram size={28} />
        </button>
      )}

      {/* Instagram icon in Navbar (Mobile only) */}
      {inNavbar && isMobile && (
        <button
          className="bg-transparent border-none p-[0_6px] cursor-pointer"
          aria-label="Open Instagram"
          onClick={handleOpenInstagram}
        >
          <FaInstagram size={22} className="text-[#e1306c]" />
        </button>
      )}
    </>
  );
};

export default InstagramWidget;
