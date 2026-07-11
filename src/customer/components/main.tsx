import React, { useEffect, useState } from "react";

const images = [
  {
    src: "/assets/main.webp",
    alt: "New Season Arrivals",
    title: "New Season Arrivals",
    description: "Discover our latest collection crafted with care and style.",
  },
  {
    src: "/assets/second-image.webp",
    alt: "Exclusive Offers",
    title: "Exclusive Offers",
    description: "Grab limited-time deals on your favorite products today!",
  },
  {
    src: "/assets/third-image.webp",
    alt: "Exclusive Offers",
    title: "Exclusive Offers",
    description: "Grab limited-time deals on your favorite products today!",
  },
];

const Home = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="relative rounded-[var(--radius-card)] shadow-[0_5px_16px_rgba(122,86,58,0.2)] mx-3 mt-3 overflow-hidden">
        <div className="relative">
          {images.map((img, idx) => (
            <div key={idx} className={`${idx === activeIndex ? "block" : "hidden"}`}>
              <img
                src={img.src}
                className="block w-full h-[500px] object-cover rounded-[var(--radius-card)] brightness-[0.7] max-md:h-[300px]"
                alt={img.alt}
                loading="lazy"
              />
              <div className="absolute top-1/2 -translate-y-1/2 left-[10%] max-w-[40%] flex flex-col justify-center items-start text-left">
                <h5 className="text-5xl font-light text-brand-cream [text-shadow:2px_2px_4px_rgba(122,86,58,0.9),0_0_10px_rgba(122,86,58,0.7)] max-md:text-2xl">
                  {img.title}
                </h5>
                <p className="text-xl text-brand-cream [text-shadow:1px_1px_3px_rgba(122,86,58,0.8)] font-normal max-md:text-base">
                  {img.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
