import { findUserName } from "@/lib/helpers";
import AccountsTableAccountRow from "./AccountsTableAccountRow";
import { Account, User } from "@/lib/definitions";

interface AccountsTableSubtypeSectionProps {
  subtype: string;
  accounts: Account[];
  users: User[];
}

export default function AccountsTableSubtypeSection({
  subtype,
  accounts,
  users,
}: AccountsTableSubtypeSectionProps) {
  return (
    <div className="rounded-lg border">
      <div className="bg-gray-50 px-4 py-2 rounded-t-lg border-b">
        <h3 className="text-md font-medium text-gray-700">{subtype}</h3>
      </div>

      {accounts.map((account) => (
        <AccountsTableAccountRow
          key={account.id}
          account={account}
          userName={findUserName(users, account.userId)}
        />
      ))}
    </div>
  );
}
