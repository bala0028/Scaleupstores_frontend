interface FeedbackModalProps {
  show: boolean;
  onClose: () => void;
  productName?: string;
  rating: number;
  setRating: (r: number) => void;
  hover: number;
  setHover: (h: number) => void;
  comment: string;
  setComment: (c: string) => void;
  maxLength: number;
  onSubmit: () => void;
}

export function FeedbackModal({
  show,
  onClose,
  productName,
  rating,
  setRating,
  hover,
  setHover,
  comment,
  setComment,
  maxLength,
  onSubmit,
}: FeedbackModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white w-[90%] max-w-[450px] rounded-xl p-4 shadow animate-[fadeIn_0.3s_ease]">
        <h5 className="font-bold mb-3 text-brand">Feedback for {productName}</h5>
        <div className="flex justify-center text-3xl text-muted-foreground cursor-pointer mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={
                star <= (hover || rating)
                  ? "text-yellow-400 scale-110 transition-transform duration-200"
                  : ""
              }
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(rating)}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] mb-3"
          rows={3}
          maxLength={maxLength}
          placeholder={`Write your feedback (max ${maxLength} characters)`}
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, maxLength))}
        />
        <div className="flex justify-center gap-2">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded font-semibold hover:bg-gray-600"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-brand text-white px-4 py-2 rounded font-semibold hover:bg-brand-action"
            onClick={onSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
