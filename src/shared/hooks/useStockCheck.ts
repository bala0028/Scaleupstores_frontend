import { useState, useCallback } from "react";

interface StockCheckResult {
  stockError: Record<number, boolean>;
  disabledQty: Record<number, boolean>;
  /** Returns true if stock limit reached (caller should NOT add to cart) */
  checkStock: (
    productId: number,
    currentQty: number,
    availableStock: number | undefined
  ) => boolean;
  clearStockError: (productId: number) => void;
}

export const useStockCheck = (): StockCheckResult => {
  const [stockError, setStockError] = useState<Record<number, boolean>>({});
  const [disabledQty, setDisabledQty] = useState<Record<number, boolean>>({});

  const checkStock = useCallback(
    (productId: number, currentQty: number, availableStock: number | undefined): boolean => {
      if (availableStock != null && currentQty >= availableStock) {
        setStockError((prev) => ({ ...prev, [productId]: true }));
        setDisabledQty((prev) => ({ ...prev, [productId]: true }));

        setTimeout(() => {
          setStockError((prev) => ({ ...prev, [productId]: false }));
          setDisabledQty((prev) => ({ ...prev, [productId]: false }));
        }, 2000);

        return true; // blocked
      }
      return false; // ok to add
    },
    []
  );

  const clearStockError = useCallback((productId: number) => {
    setStockError((prev) => ({ ...prev, [productId]: false }));
  }, []);

  return { stockError, disabledQty, checkStock, clearStockError };
};
