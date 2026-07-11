import type { Category } from "@/shared/api/services/types";
import React, { useEffect, useRef } from "react";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

const CategorySidebar = ({
  categories,
  selectedCat,
  handleCategory,
}: {
  categories: Category[];
  selectedCat: number | null;
  handleCategory: (id: number) => void;
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current || selectedCat === null) return;
    const activeItem = listRef.current.querySelector("[data-active='true']");
    if (activeItem) activeItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedCat]);

  return (
    <div className="hidden lg:flex w-[260px] sticky top-[80px] self-start z-10">
      <div className="flex flex-col h-[calc(100vh-100px)] w-full overflow-hidden rounded-3xl border border-brand-border-light bg-brand-cream shadow-[0_4px_24px_rgba(25,135,84,0.08)]">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-brand-border-light/70">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Leaf className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Categories</h3>
        </div>

        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 [scrollbar-width:thin] [scrollbar-color:#d8c6b2_transparent] scroll-smooth"
        >
          {categories.map((cat: Category) => {
            const isActive = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                data-active={isActive}
                onClick={() => handleCategory(cat.id)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-300",
                  isActive
                    ? "bg-brand text-white shadow-md shadow-brand/20"
                    : "text-gray-700 hover:bg-white hover:shadow-sm"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors",
                    isActive ? "bg-white/20" : "bg-brand/10 group-hover:bg-brand/15"
                  )}
                >
                  <Leaf className={cn("h-3.5 w-3.5", isActive ? "text-white" : "text-brand")} />
                </span>
                {cat.categoryName}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategorySidebar;
