import clsx from "clsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isValid, parseISO, format } from "date-fns";
import { Category, Transaction, TransactionUpdate } from "@/lib/definitions";
import SubcategorySelector from "@/components/category/SubcategorySelector";
import { useEffect, useState } from "react";
import ErrorBadge from "@/components/errors/ErrorBadge";
import { amountClass } from "@/lib/style-helpers";

interface EditableTransactionSplitProps {
  transaction: Transaction;
  baseOriginalAmount: number;
  categories: Category[];
  onUpdate: (data: TransactionUpdate) => void;
  onDelete: () => void;
  onSubcategoryUpdate: (subcategory: { id: number; name: string }) => void;
}

export default function EditableTransactionSplit({
  transaction,
  baseOriginalAmount,
  categories,
  onUpdate,
  onDelete,
  onSubcategoryUpdate,
}: EditableTransactionSplitProps) {
  const [dateErrorMessage, setDateErrorMessage] = useState<string | null>(null);
  const [descriptionErrorMessage, setDescriptionErrorMessage] = useState<
    string | null
  >(null);
  const [subcategoryErrorMessage, setSubcategoryErrorMessage] = useState<
    string | null
  >(null);
  const [amountErrorMessage, setAmountErrorMessage] = useState<string | null>(
    null
  );

  // Validation Logic
  const validateDate = (dateString: string | null): boolean => {
    if (!dateString) {
      setDateErrorMessage("Transaction date is required");
      return false;
    }

    const date = parseISO(dateString);
    if (!isValid(date)) {
      setDateErrorMessage("Invalid date format");
      return false;
    } else {
      setDateErrorMessage(null);
      return true;
    }
  };

  const validateDescription = (description: string) => {
    if (!description || description.trim().length < 3) {
      setDescriptionErrorMessage("Description must be at least 3 characters");
    } else {
      setDescriptionErrorMessage(null);
    }
  };

  const validateSubcategory = (subcategory: { id: number; name: string }) => {
    if (subcategory.id === 0) {
      setSubcategoryErrorMessage("Category selection required");
    } else {
      setSubcategoryErrorMessage(null);
    }
  };

  const validateAmount = (amount: string) => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) === 0) {
      setAmountErrorMessage("Enter a valid, non-zero amount");
    } else {
      setAmountErrorMessage(null);
    }
  };

  // Formatting Logic
  const formatAmount = (amount: string): string => {
    const parsedValue = parseFloat(amount);
    if (isNaN(parsedValue)) return "0.00";

    // Adjust the value to match the sign of the original amount
    const signedValue =
      baseOriginalAmount < 0 ? -Math.abs(parsedValue) : Math.abs(parsedValue);
    // Format and update the input value
    return signedValue.toFixed(2);
  };

  // Event Handlers
  const handleDateSelect = (date: Date | null) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      if (validateDate(formattedDate)) {
        onUpdate({ transactionDate: formattedDate });
      } else {
        onUpdate({ transactionDate: "" });
      }
    }
  };

  // Event handler for when clicking off of amount input
  const handleAmountBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedAmount = formatAmount(e.target.value.trim());
    if (transaction.amount !== formattedAmount)
      onUpdate({ amount: formattedAmount });
  };

  const parsedDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    const date = parseISO(dateString);
    return isValid(date) ? date : null;
  };

  useEffect(() => {
    validateDate(transaction.transactionDate);
    validateDescription(transaction.description);
    validateSubcategory(transaction.subcategory);
    validateAmount(transaction.amount);
  }, [transaction]);

  return (
    <tr
      key={transaction.id}
      className="bg-white mb-2 text-sm last-of-type:border-none"
    >
      {/* Date */}
      <td className="w-24 h-9 px-2 py-1 align-top whitespace-nowrap">
        <ErrorBadge errorMessage={dateErrorMessage}>
          <DatePicker
            className={clsx(
              "w-full h-full border px-1 py-2 rounded-md",
              dateErrorMessage ? "border-red-500" : "border-gray-300"
            )}
            selected={parsedDate(transaction.transactionDate)}
            isClearable={false}
            onChange={(date) => handleDateSelect(date)}
            fixedHeight
            popperPlacement="bottom-end"
            dateFormat="MM-dd-yyyy"
          />
        </ErrorBadge>
      </td>

      {/* Description */}
      <td className="w-64 h-9 px-2 py-1 align-top whitespace-nowrap">
        <ErrorBadge errorMessage={descriptionErrorMessage}>
          <input
            type="text"
            value={transaction.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className={clsx(
              "h-full w-full border p-1 rounded-md",
              descriptionErrorMessage ? "border-red-500" : "border-gray-300"
            )}
          />
        </ErrorBadge>
      </td>

      {/* Subcategory */}
      <td className="w-48 h-9 px-2 py-1 align-top whitespace-nowrap">
        <ErrorBadge errorMessage={subcategoryErrorMessage}>
          <SubcategorySelector
            categories={categories}
            currentSubcategory={transaction.subcategory}
            onChange={(subcategory) =>
              onSubcategoryUpdate({
                id: subcategory.id,
                name: subcategory.name,
              })
            }
            hasError={subcategoryErrorMessage !== null}
          />
        </ErrorBadge>
      </td>

      {/* Amount */}
      <td
        className={clsx(
          "w-24 h-9 px-2 py-1 align-center whitespace-nowrap font-mono",
          amountClass(transaction.amount)
        )}
      >
        <ErrorBadge errorMessage={amountErrorMessage}>
          <input
            type="text"
            value={transaction.amount}
            onChange={(e) => onUpdate({ amount: e.target.value })}
            onBlur={handleAmountBlur}
            className={clsx(
              "w-full h-full px-1 py-2 border rounded-md text-right",
              amountErrorMessage ? "border-red-500" : "border-gray-300"
            )}
            placeholder={"0.00"}
          />
        </ErrorBadge>
      </td>

      {/* x delete button */}
      <td className="w-4 whitespace-nowrap">
        <button
          onClick={onDelete}
          className="text-xl rounded-full text-gray-500
            hover:text-gray-700 hover:bg-gray-200 transition-colors"
        >
          &times;
        </button>
      </td>
    </tr>
  );
}
