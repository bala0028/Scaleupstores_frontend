import React from "react";
import StarRating from "./StarRating";
import type { Review } from "@/shared/api/services/types";
import { MessageCircle } from "lucide-react";

interface ReviewListProps {
  reviews: Review[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews = [], loading, hasMore, onLoadMore }) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center border border-[var(--color-brand)] rounded-[var(--radius-card)] p-8 bg-brand-cream text-[var(--color-brand)]">
        <MessageCircle size={48} className="mb-2" />
        <p className="m-0">No reviews yet</p>
        <small>Be the first to share your experience</small>
      </div>
    );
  }

  return (
    <div className="w-full md:w-[70%]">
      {reviews.map((rev) => (
        <div
          key={rev.id}
          className="bg-white p-4 rounded-[var(--radius-card)] border border-[var(--color-brand-border)] mb-4"
        >
          <StarRating rating={rev.rating || 0} size="md" />
          <div className="font-bold text-foreground mt-1">{rev.user_name}</div>
          <div className="my-2.5 break-words">{rev.comment}</div>
          <div className="text-sm text-gray-500">
            {new Date(rev.created_at || "").toLocaleDateString()}
          </div>
        </div>
      ))}

      {hasMore && !loading && (
        <div className="flex justify-center mt-5">
          <button
            className="bg-[var(--color-brand)] text-white px-7 py-2.5 border-none rounded-[var(--radius-pill)] cursor-pointer font-semibold text-base transition-all shadow-[0px_4px_10px_rgba(25,135,84,0.2)] hover:bg-[var(--color-brand-action)] hover:scale-105"
            onClick={onLoadMore}
          >
            Load More
          </button>
        </div>
      )}

      {loading && <p className="text-center">Loading...</p>}
    </div>
  );
};

export default ReviewList;
