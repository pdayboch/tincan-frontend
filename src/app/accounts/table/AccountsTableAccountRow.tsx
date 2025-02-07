import { Account } from "@/lib/definitions";
import { amountClass } from "@/lib/style-helpers";
import clsx from "clsx";

interface AccountsTableAccountRowProps {
  account: Account;
  userName?: string | null;
}

export default function AccountsTableAccountRow({
  account,
  userName,
}: AccountsTableAccountRowProps) {
  const balance = parseFloat(account.currentBalance).toLocaleString("en-US", {
    minimumFractionDigits: 2,
  });

  return (
    <div className="flex justify-between p-3 border rounded-m">
      <div className="flex flex-col">
        <div className="font-medium">{account.institutionName}</div>
        <div>{account.name}</div>
        {userName && <div className="text-xs text-gray-500">{userName}</div>}
      </div>

      <div className="flex flex-col justify-end">
        <div className={clsx("text-right", amountClass(balance))}>
          ${balance}
        </div>
      </div>
    </div>
  );
}
