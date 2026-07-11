import React, { useCallback, useEffect, useState } from "react";
import { reviewService } from "@/shared/api/services";
import { toast } from "sonner";
import type { Review } from "@/shared/api/services/types";
import RatingSummary from "./review/RatingSummary";
import ReviewList from "./review/ReviewList";

interface RatingSummaryData {
  average: number;
  total: number;
  percentage: Record<number, number>;
  counts: Record<number, number>;
}

const ReviewBox = ({ productId }: { productId: number }) => {
  const [summary, setSummary] = useState<RatingSummaryData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeStar, setActiveStar] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await reviewService.customer.ratingSummary(productId);
      const raw = res.data as any;
      const counts = raw?.counts || raw?.rating_counts || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      const percentage = raw?.percentage || raw?.rating_percentages || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      const average = Number(raw?.average ?? raw?.averageRating ?? raw?.average_rating ?? 0);
      const total = Number(raw?.total ?? raw?.totalReviews ?? raw?.total_reviews ?? raw?.totalReviewsCount ?? 0);

      setSummary({
        average,
        total,
        percentage,
        counts,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load rating summary");
    }
  }, [productId]);

  const fetchReviews = useCallback(
    async (pageNum = 1, starFilter?: number) => {
      try {
        setLoading(true);
        const res = await reviewService.customer.paginated(productId, pageNum, starFilter);
        const raw = res.data as any;
        const db = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.results)
          ? raw.results
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.results?.data)
          ? raw.results.data
          : [];

        if (pageNum === 1) setReviews(db);
        else setReviews((prev) => [...prev, ...db]);

        const hasNext = raw && raw.next !== undefined ? raw.next !== null : false;
        setHasMore(hasNext);
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load reviews");
        setLoading(false);
      }
    },
    [productId]
  );

  useEffect(() => {
    fetchSummary();
    fetchReviews(1);
  }, [fetchSummary, fetchReviews]);

  const handleFilter = (star: number | null) => {
    setActiveStar(star);
    setPage(1);
    fetchReviews(1, star ?? undefined);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage);
  };

  if (!summary) return <p>Loading reviews…</p>;

  return (
    <div className="flex flex-col md:flex-row gap-10 p-4 md:p-8 bg-[var(--color-brand-cream)] rounded-[var(--radius-card)] mt-2.5">
      <RatingSummary summary={summary} activeStar={activeStar} onFilter={handleFilter} />
      <ReviewList reviews={reviews} loading={loading} hasMore={hasMore} onLoadMore={loadMore} />
    </div>
  );
};

export default ReviewBox;
