import AccountsTableTypeSection from "./AccountsTableTypeSection";
import { Account, AccountUpdate, User } from "@/lib/definitions";
import { deleteAccount, updateAccount } from "@/lib/api/account-api";

interface AccountsTableProps {
  accounts: Account[];
  users: User[];
}

export default function AccountsTable({ accounts, users }: AccountsTableProps) {
  const updateAccountInState = (updatedAccount: Account) => {
    const updatedAccounts = accounts.map((account) => {
      if (account.id === updatedAccount.id) {
        return updatedAccount;
      }
      return account;
    });

    //setAccounts(updatedAccounts);
  };

  const handleUpdateAccount = async (
    accountId: string,
    data: AccountUpdate
  ): Promise<boolean> => {
    try {
      const updatedAccount = await updateAccount(accountId, data);
      updateAccountInState(updatedAccount);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error updating account data: ${error.message}`);
      } else {
        console.log("Error updating account: An unknown error occurred");
      }
      return false;
    }
  };

  const handleDeleteAccount = async (accountId: string): Promise<boolean> => {
    try {
      const success = await deleteAccount(accountId);
      if (success) {
        const updatedAccounts = accounts.filter(
          (account) => account.id != accountId
        );
        // setAccounts(updatedAccounts);
      }
      return success;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error deleting account data: ${error.message}`);
      } else {
        console.log("Error deleting account: An unknown error occurred");
      }
      return false;
    }
  };

  const accountsByType = accounts.reduce((acc, account) => {
    if (!acc[account.accountType]) {
      acc[account.accountType] = [];
    }

    acc[account.accountType].push(account);
    return acc;
  }, {} as Record<string, Account[]>);

  return (
    <div className="space-y-6 w-full">
      {Object.entries(accountsByType).map(([accountType, accounts]) => (
        <AccountsTableTypeSection
          key={accountType}
          accountType={accountType}
          accounts={accounts}
          users={users}
        />
      ))}
    </div>
  );
}
