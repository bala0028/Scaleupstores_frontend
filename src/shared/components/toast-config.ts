export const toastConfig = {
  style: {
    background: "#fff",
    color: "#363636",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    borderRadius: "8px",
    padding: "16px",
    border: "none",
  },
  classNames: {
    success:
      "!bg-[#10b981] !text-white !border-none [&_[data-icon]]:!text-white [&_svg]:!text-white",
    error: "!bg-[#ef4444] !text-white !border-none [&_[data-icon]]:!text-white [&_svg]:!text-white",
  },
} as const;
