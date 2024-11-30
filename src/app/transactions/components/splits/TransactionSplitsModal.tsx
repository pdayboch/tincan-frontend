import { isValid, parseISO } from 'date-fns';
import { ArrowUturnLeftIcon, CheckIcon, PlusIcon } from '@heroicons/react/24/solid';
import { fetchTransactionSplits, syncTransactionSplits } from '@/lib/api/transaction-splits-api';
import { Category, Transaction, TransactionUpdate } from '@/lib/definitions';
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import TransactionRow from '../table/TransactionRow';
import TransactionsHeader from '../table/TransactionsHeader';
import EditableTransactionSplit from './EditableTransactionSplit';
import { calculateTotalSplitAmount, convertTransactionToTransactionUpdate, emptyTransactionWithId } from '../../transaction-helpers';
import { formatCurrency } from '@/lib/helpers';

interface TransactionSplitsModalProps {
  transactionId: number;
  categories: Category[];
  onClose: (refresh: boolean) => void;
}

export default function TransactionSplitsModal({
  transactionId,
  categories,
  onClose
}: TransactionSplitsModalProps) {
  const [originalTransaction, setOriginalTransaction] = useState<Transaction | null>(null);
  const [baseOriginalAmount, setBaseOriginalAmount] = useState<number>(0);
  const [splits, setSplits] = useState<Transaction[]>([]);
  const [newSplitIndex, setNewSplitIndex] = useState<number>(-1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch split data
  useEffect(() => {
    const fetchSplitData = async () => {
      try {
        const data = await fetchTransactionSplits(transactionId);
        setOriginalTransaction(data.original);
        setSplits(data.splits);

        // Calculate the base original amount
        const existingSplitTotal = calculateTotalSplitAmount(data.splits);
        const originalAmount = parseFloat(data.original.amount);
        setBaseOriginalAmount(originalAmount + existingSplitTotal);
      } catch (error) {
        console.error('Failed to fetch split data:', error);
      }
    };
    fetchSplitData();
  }, [transactionId]);

  // Recalculate remaining amount on splits change
  useEffect(() => {
    if (!originalTransaction) return;

    const splitTotal = calculateTotalSplitAmount(splits);
    const calculatedRemainingAmount = baseOriginalAmount - splitTotal;

    // Check split total exceeds allowed amount
    if (Math.abs(splitTotal) > Math.abs(baseOriginalAmount)) {
      const amountStr = formatCurrency(baseOriginalAmount);
      setErrorMessage(`The total split amounts cannot exceed the original transaction amount of ${amountStr}`);
      // Only update if the amount is not already "0.00"
      if (originalTransaction.amount !== "0.00") {
        setOriginalTransaction((transaction) =>
          transaction ? { ...transaction, amount: "0.00" } : transaction
        );
      }
    } else {
      setErrorMessage(null);

      // Update originalTransaction.amount if it differs
      if (originalTransaction.amount !== calculatedRemainingAmount.toFixed(2)) {
        setOriginalTransaction((transaction) =>
          transaction ? { ...transaction, amount: calculatedRemainingAmount.toFixed(2) } : transaction
        );
      }
    }
  }, [splits, baseOriginalAmount, originalTransaction]);

  // Pagination logic
  const splitsPerPage = 5;

  const paginatedSplits = () => {
    const startIndex = (currentPage - 1) * splitsPerPage;
    return splits.slice(startIndex, startIndex + splitsPerPage);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(splits.length / splitsPerPage);

  const isNewSplit = (split: Transaction) => split.id < 0;

  const handleUpdateSplit = (id: number, data: TransactionUpdate) => {
    setSplits((splits) =>
      splits.map((split) => (id === split.id ? { ...split, ...data } : split))
    );
  };

  const handleSubcategoryUpdateSplit = (id: number, subcategory: { id: number, name: string }) => {
    setSplits((splits) =>
      splits.map((split) =>
        id === split.id ? { ...split, subcategory } : split
      )
    );
  };

  const handleRemoveSplit = (id: number) => {
    setSplits((splits) => {
      const updatedSplits = splits.filter((split) => id !== split.id);

      // Adjust the page if necessary
      const totalPagesAfterRemoval = Math.ceil(updatedSplits.length / splitsPerPage);
      if (currentPage > totalPagesAfterRemoval) {
        setCurrentPage(totalPagesAfterRemoval);
      }

      return updatedSplits;
    });
  };

  const handleAddSplit = () => {
    if (!originalTransaction) return;

    setSplits((splits) => {
      const updatedSplits = [
        ...splits,
        {
          ...emptyTransactionWithId(newSplitIndex),
          // override split date with original transaction date
          transactionDate: originalTransaction.transactionDate
        }
      ];

      // Automatically set the page to the last page
      const lastPage = Math.ceil(updatedSplits.length / splitsPerPage);
      setCurrentPage(lastPage);

      return updatedSplits;
    });

    setNewSplitIndex((index) => index - 1)
  };

  // Combine existing splits and new splits into an object for the sync API call
  const mergeSplitsData = (): TransactionUpdate[] => {
    return splits.map((split) => {
      if (isNewSplit(split)) {
        // New splits should not include an ID
        return convertTransactionToTransactionUpdate(split)
      } else {
        // Existing splits need to include their ID
        return {
          id: split.id,
          ...convertTransactionToTransactionUpdate(split)
        }
      }
    })
  };

  const validateSplitDates = (): boolean => {
    const allValid = splits.every(split => {
      return split.transactionDate &&
        isValid(parseISO(split.transactionDate));
    });

    if (!allValid) {
      setErrorMessage("All splits must have a valid date");
      return false;
    }

    return true
  };

  const validateSplitDescriptions = (): boolean => {
    const allValid = splits.every(split =>
      split.description && split.description.length >= 3
    );
    if (!allValid) {
      setErrorMessage("All splits must have a description with at least 3 characters");
      return false;
    }

    return true;
  };

  const validateSplitSubcategories = (): boolean => {
    const allValid = splits.every(split =>
      split.subcategory.id !== 0
    );

    if (!allValid) {
      setErrorMessage("All splits must have a subcategory");
      return false;
    }

    return true;
  };

  const validateSplitAmounts = (): boolean => {
    const allValid = splits.every(split => {
      return split.amount &&
        !isNaN(parseFloat(split.amount)) &&
        parseFloat(split.amount) !== 0
    })

    if (!allValid) {
      setErrorMessage("Splits must have a non-zero amount")
      return false;
    }

    return true;
  };

  // Validate sum of splits less than original amount
  const validateSplitTotalAmount = (): boolean => {
    const splitTotal = calculateTotalSplitAmount(splits);

    if (Math.abs(splitTotal) <= Math.abs(baseOriginalAmount)) return true;

    const amountStr = formatCurrency(baseOriginalAmount);
    setErrorMessage(`Total split amounts cannot exceed the original transaction amount of ${amountStr}`);
    return false;
  };

  // Parent validation function
  const validateAndSetErrorMessages = (): boolean => {
    if (!validateSplitDates()) return false;
    if (!validateSplitDescriptions()) return false;
    if (!validateSplitSubcategories()) return false;
    if (!validateSplitAmounts()) return false;
    if (!validateSplitTotalAmount()) return false;

    setErrorMessage(null);
    return true;
  };

  // Persist splits to the backend and close modal
  const handleSave = async () => {
    if (!validateAndSetErrorMessages()) return;

    setIsSaving(true);
    try {
      await syncTransactionSplits(transactionId, mergeSplitsData());
      onClose(true);
    } catch (error) {
      console.error('Failed to save split data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel all changes and close modal
  const handleCancel = () => {
    onClose(false)
  };

  if (!originalTransaction) {
    return <div>Loading...</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Edit Transaction Splits</h2>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-5 p-3 text-red-800 bg-red-100 border border-red-200 rounded-md flex justify-between items-center">
            <span>{errorMessage}</span>
            <button
              className="rounded-full p-1 text-red-800 hover:text-red-600 hover:bg-red-200"
              onClick={() => setErrorMessage(null)}
            >
              &#10005;
            </button>
          </div>
        )}

        {/* Original Transaction */}
        <div className="mb-4 p-3 bg-gray-100 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Original Transaction</h3>
          <table className="w-full">
            <TransactionsHeader />
            <tbody>
              <TransactionRow
                transaction={originalTransaction}
                isInteractive={false}
              />
            </tbody>
          </table>
        </div>

        {/* Splits */}
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Splits</h3>
          <div className="mb-4 p-2 h-64 bg-white rounded-lg border">
            <table className="w-full">
              <tbody>
                {paginatedSplits().map((split) => (
                  <EditableTransactionSplit
                    key={split.id}
                    transaction={split}
                    baseOriginalAmount={baseOriginalAmount}
                    categories={categories}
                    onUpdate={(data) => handleUpdateSplit(split.id, data)}
                    onDelete={() => handleRemoveSplit(split.id)}
                    onSubcategoryUpdate={(subcategory) => handleSubcategoryUpdateSplit(split.id, subcategory)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination buttons */}
          {totalPages > 1 && (
            <div className="mb-2 flex items-center justify-center space-x-4">
              <button
                className={clsx(
                  "px-4 py-2 rounded-md transition-colors duration-150",
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                )}
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </button>

              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

              <button
                className={clsx(
                  "px-4 py-2 rounded-md transition-colors duration-150",
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                )}
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-between">

          {/* Add Split Button */}
          <button
            className="px-4 py-2 rounded-lg
                      flex items-center
                      bg-theme-lgt-green hover:bg-theme-drk-green
                      active:bg-theme-pressed-green active:shadow-inner
                      transition-transform duration-150"
            onClick={handleAddSplit}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Split
          </button>

          <div className="flex space-x-6">
            {/* Cancel Button */}
            <button
              className="flex items-center text-gray-500 hover:text-gray-700 px-4 py-2"
              onClick={handleCancel}
            >
              <ArrowUturnLeftIcon className="w-5 h-5 mr-1" />
              Cancel
            </button>

            {/* Save Button */}
            <button
              className={clsx(
                "flex items-center rounded-md px-4 py-2",
                isSaving ?
                  "bg-gray-300 cursor-not-allowed opacity-50" :
                  "bg-blue-500 text-white hover:bg-blue-600"
              )}
              onClick={handleSave}
              disabled={isSaving}
            >
              <CheckIcon className="w-5 h-5 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

