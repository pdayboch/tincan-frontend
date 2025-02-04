import { Account, Transaction } from "@/lib/definitions";
import { formatAccountLabel } from "@/lib/helpers";
import { ChevronDoubleUpIcon } from "@heroicons/react/24/outline";

interface ExpandedTransactionRowProps {
  transaction: Transaction;
  accounts: Account[];
  userName: string;
  setExpandedRowTransactionId: React.Dispatch<React.SetStateAction<number | null>>;
  onClickSplitTransaction: (transactionId: number) => void;
};

export default function ExpandedTransactionRow({
  transaction,
  accounts,
  userName,
  setExpandedRowTransactionId,
  onClickSplitTransaction
}: ExpandedTransactionRowProps) {

  const account = accounts.find(a =>
    a.id === transaction.accountId
  );

  const isPartOfSplit = transaction.hasSplits || transaction.splitFromId !== null;
  const originalSplitId = transaction.splitFromId ?? transaction.id;

  return (
    <tr className="expanded-row bg-neutral-50" >
      <td colSpan={5}>
        <div className="flex justify-between w-full h-40">
          <div className="flex-none content-start mt-2 pl-2 flex flex-col text-sm">

            <p>
              <b>Custodian: </b>
              {userName}
            </p>
            <p>
              <b>Account: </b>
              {formatAccountLabel(account)}
            </p>
            <p>
              <b>Appears on statement as </b>
              {transaction.statementDescription}
            </p>
            <button
              className="text-blue-600 hover:underline cursor-pointer"
              onClick={() => onClickSplitTransaction(originalSplitId)}
            >
              <span>{isPartOfSplit ? "Manage transaction split" : "Split transaction"}</span>
            </button>
          </div>

          {/* Collapse Button */}
          <div
            className="w-7 h-full whitespace-nowrap order-last flex-none flex
              justify-self-end justify-center items-center cursor-pointer"
            onClick={() => setExpandedRowTransactionId(null)}
          >
            <ChevronDoubleUpIcon className="w-4 h-4" />
          </div>
        </div>
        <hr />
      </td>
    </tr >
  );
}
