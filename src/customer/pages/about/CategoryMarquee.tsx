import type { Category } from "@/shared/api/services/types";
import { getImageUrl } from "@/shared/utils/customer";
import React from "react";

interface CategoryMarqueeProps {
  categories: Category[];
  onCategoryClick: (categoryId: number) => void;
}

export const CategoryMarquee = ({ categories, onCategoryClick }: CategoryMarqueeProps) => {
  const repeatedCategories = [...categories, ...categories, ...categories];

  return (
    <>
      <h2 className="text-center py-4 text-[var(--color-brand)] font-semibold">Our Categories</h2>
      <div className="relative overflow-hidden w-full py-2.5 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex gap-5 animate-[scrollLeft_10s_linear_infinite] [will-change:transform] hover:[animation-play-state:paused]">
          {repeatedCategories.map((cat, index) => (
            <div
              key={index}
              onClick={() => onCategoryClick(cat.id)}
              className="bg-white rounded-2xl w-60 h-[310px] flex-shrink-0 border border-[rgba(25,135,84,0.15)] shadow-[0_6px_18px_rgba(0,0,0,0.06)] overflow-hidden cursor-pointer transition-all duration-[350ms] hover:-translate-y-1.5 hover:shadow-[0_14px_32px_rgba(25,135,84,0.22)]"
            >
              <div className="bg-gradient-to-br from-[#edf8f1] to-white h-[150px] flex items-center justify-center">
                <img
                  src={getImageUrl(cat.category_image) || "https://via.placeholder.com/300x200?text=No+Image"}
                  alt={cat.category_name}
                  className="w-3/4 h-full object-contain transition-transform duration-[350ms] hover:scale-110"
                />
              </div>
              <div className="py-3.5 px-3 text-center">
                <h5 className="text-base font-semibold text-brand mb-1.5">{cat.category_name}</h5>
                <p className="text-sm text-foreground leading-snug line-clamp-3">
                  {cat.description || "No description"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
