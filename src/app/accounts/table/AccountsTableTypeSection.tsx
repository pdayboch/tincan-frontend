import { Account, User } from "@/lib/definitions";
import AccountsTableSubtypeSection from "./AccountsTableSubtypeSection";
import { capitalizeFirstLetter } from "@/lib/helpers";
import { amountClass } from "@/lib/style-helpers";
import clsx from "clsx";

interface AccountsTableTypeSectionProps {
  accountType: string;
  accounts: Account[];
  users: User[];
}

export default function AccountsTableTypeSection({
  accountType,
  accounts,
  users,
}: AccountsTableTypeSectionProps) {
  // Group accounts by subtype
  const accountsBySubtype = accounts.reduce((acc, account) => {
    if (!acc[account.accountSubtype]) {
      acc[account.accountSubtype] = [];
    }

    acc[account.accountSubtype].push(account);
    return acc;
  }, {} as Record<string, Account[]>);

  const totalBalance = accounts
    .reduce((sum, account) => sum + parseFloat(account.currentBalance), 0)
    .toLocaleString("en-US", { minimumFractionDigits: 2 });

  return (
    <div className="space-y-2 border border-2 p-5 rounded-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {capitalizeFirstLetter(accountType)}
        </h2>
        <div
          className={clsx(
            "text-lg font-medium text-gray-700",
            amountClass(totalBalance)
          )}
        >
          ${totalBalance}
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(accountsBySubtype).map(([subtype, accounts]) => (
          <AccountsTableSubtypeSection
            key={subtype}
            subtype={subtype}
            accounts={accounts}
            users={users}
          />
        ))}
      </div>
    </div>
  );
}
