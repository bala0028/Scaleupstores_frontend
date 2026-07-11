import type { Category } from "@/shared/api/services/types";
import { getImageUrl } from "@/shared/utils";

const CategoryGrid = ({
  categories,
  onCategoryClick,
}: {
  categories: Category[];
  onCategoryClick: (id: number) => void;
}) => {
  return (
    <div className="px-5 pt-[30px] pb-10 mb-10 bg-brand-cream rounded-2xl">
      <h2 className="text-center font-bold text-2xl mb-[30px] uppercase text-black">
        Shop By Category
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
        {categories.map((cat: Category) => {
          const categoryName = cat.categoryName || cat.category_name || cat.name || "Category";
          const imgSrc =
            getImageUrl(cat.categoryImage || cat.category_image || cat.image) || "/img/No-image.jpg";

          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => onCategoryClick(cat.id)}
              className="group flex flex-col items-center text-center gap-2 rounded-3xl py-4 px-3 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative flex items-center justify-center w-[110px] h-[110px] rounded-full overflow-hidden border border-brand-border bg-brand-cream">
                <img
                  src={imgSrc}
                  alt={categoryName}
                  onError={(e) => {
                    e.currentTarget.src = "/img/No-image.jpg";
                  }}
                  className="w-full h-full object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-110"
                />
              </div>
              <span className="text-[13px] sm:text-sm font-semibold uppercase tracking-[0.02em] text-black">
                {categoryName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryGrid;
