import { format } from 'date-fns';
import { Transaction, TransactionUpdate } from "@/lib/definitions";
import clsx from "clsx";

export const EMPTY_TRANSACTION: Transaction = {
  id: 0,
  amount: '0.00',
  description: '',
  notes: null,
  transactionDate: format(new Date(), 'yyyy-MM-dd'),
  statementTransactionDate: null,
  statementDescription: null,
  splitFromId: null,
  hasSplits: false,
  accountId: '0',
  userId: '0',
  pending: false,
  category: { id: 0, name: '' },
  subcategory: { id: 0, name: '' }
}

export const emptyTransactionWithId = (id: number): Transaction => {
  return { ...EMPTY_TRANSACTION, id: id };
};

export const convertTransactionToTransactionUpdate = (
  transaction: Transaction
): TransactionUpdate => {
  return {
    transactionDate: transaction.transactionDate,
    amount: transaction.amount,
    description: transaction.description,
    notes: transaction.notes ?? undefined,
    subcategoryId: transaction.subcategory.id
  };
}

export const calculateTotalSplitAmount = (splits: Transaction[]): number => {
  return splits.reduce((sum, split) => {
    // Convert string to float, default to 0 if NaN
    const amount = parseFloat(split.amount) || 0;
    // Ensure 2 decimal places
    return sum + parseFloat(amount.toFixed(2));
  }, 0);
};

export const amountClass = (amount: string): string => {
  const numericAmount = parseFloat(amount);
  return clsx({
    'text-green-600': numericAmount >= 0,
    'text-red-600': numericAmount < 0,
  })
};
