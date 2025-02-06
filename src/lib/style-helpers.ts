import clsx from "clsx";

export const amountClass = (amount: string): string => {
  const numericAmount = parseFloat(amount);
  return clsx({
    "text-green-600": numericAmount >= 0,
    "text-red-600": numericAmount < 0,
  });
};
