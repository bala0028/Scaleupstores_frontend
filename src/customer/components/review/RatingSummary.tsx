import React from "react";
import StarRating from "./StarRating";
import { Button } from "@/components/ui/button";

interface RatingSummaryData {
  average: number;
  total: number;
  percentage: Record<number, number>;
  counts: Record<number, number>;
}

interface RatingSummaryProps {
  summary: RatingSummaryData;
  activeStar: number | null;
  onFilter: (star: number | null) => void;
}

const RatingSummary: React.FC<RatingSummaryProps> = ({ summary, activeStar, onFilter }) => {
  return (
    <div className="w-full md:w-[30%]">
      <h3 className="font-bold text-foreground mb-4">Customer Reviews</h3>

      <div className="py-1 mb-2 leading-tight">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-2xl font-bold text-black leading-none">{summary.average}</span>
          <span className="text-base text-black leading-none">out of 5</span>
        </div>
        <StarRating rating={summary.average} size="lg" />
        <div className="text-base text-foreground mb-2">{summary.total} global ratings</div>
      </div>

      <div className="mt-5">
        {[5, 4, 3, 2, 1].map((star) => (
          <div key={star} className="flex items-center gap-2.5 mb-2">
            <span className="w-10">{star} ★</span>
            <div className="h-2 bg-muted w-full rounded overflow-hidden">
              <div
                className="h-2 bg-[var(--color-brand)]"
                style={{ width: `${(summary.percentage || {})[star] ?? 0}%` }}
              />
            </div>
            <span className="w-6 text-right text-foreground">{(summary.counts || {})[star] ?? 0}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          variant={!activeStar ? "brand" : "outline"}
          className="rounded-pill"
          onClick={() => onFilter(null)}
        >
          All Reviews
        </Button>
        {[5, 4, 3, 2, 1].map((star) => (
          <Button
            key={star}
            variant={activeStar === star ? "brand" : "outline"}
            className="rounded-pill"
            onClick={() => onFilter(star)}
          >
            {star} ★
          </Button>
        ))}
      </div>
    </div>
  );
};

export default RatingSummary;
