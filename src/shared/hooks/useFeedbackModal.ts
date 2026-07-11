import { useState } from "react";
import { reviewService } from "@/shared/api/services";
import { toast } from "sonner";

interface FeedbackProduct {
  id: number;
  name: string;
}

export const useFeedbackModal = (maxLength = 200) => {
  const [showModal, setShowModal] = useState(false);
  const [feedbackProduct, setFeedbackProduct] = useState<FeedbackProduct | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const openFeedbackModal = async (item: any, onSubmitted?: () => void) => {
    const productId = item?.product || item?.product_id || item?.id;
    if (!productId) return toast.error("Invalid product");

    const productName = item?.product_name || item?.product?.product_name || "Product";

    setPendingCallback(() => onSubmitted || null);
    setFeedbackProduct({ id: productId, name: productName });
    setRating(0);
    setComment("");
    setShowModal(true);

    try {
      const res = await reviewService.customer.getByProduct(productId);
      if (res.data?.data) {
        setRating(Number(res.data.data.rating));
        setComment(res.data.data.comment || "");
      }
    } catch (err: any) {
      if (err.response?.status !== 404) console.warn(err);
    }
  };

  const submitFeedback = async () => {
    if (!feedbackProduct?.id) return toast.error("Invalid product");
    if (!rating) return toast.error("Please select a star rating");
    if (comment.trim().length > maxLength)
      return toast.error(`Comment can't exceed ${maxLength} characters`);

    try {
      await reviewService.customer.create(feedbackProduct.id, { rating, comment });
      toast.success("Feedback submitted successfully!");

      if (pendingCallback) {
        pendingCallback();
        setPendingCallback(null);
      }

      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit feedback");
    }
  };

  return {
    showModal,
    setShowModal,
    feedbackProduct,
    rating,
    setRating,
    hover,
    setHover,
    comment,
    setComment,
    maxLength,
    openFeedbackModal,
    submitFeedback,
  };
};
