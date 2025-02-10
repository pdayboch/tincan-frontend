"use client";
import { Suspense, useEffect, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { Account, SupportedAccount, User } from "../../lib/definitions";
import AccountsTable from "./table/AccountsTable";
import { Inter } from "next/font/google";
import clsx from "clsx";
import AddAccountModal from "./add-account-modal/AddAccountModal";
import { fetchUsers } from "@/lib/api/user-api";
import { createAccount, fetchAccounts } from "@/lib/api/account-api";
const font = Inter({ weight: ["400"], subsets: ["latin"] });

function AccountsContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetch and store all users
  useEffect(() => {
    fetchUsers()
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        console.error(error);
        setUsers([]);
      });
  }, []);

  // fetch and store all accounts
  useEffect(() => {
    fetchAndSetAccounts();
  }, []);

  const fetchAndSetAccounts = async () => {
    try {
      const updatedAccounts = await fetchAccounts();
      setAccounts(updatedAccounts);
    } catch (error) {
      setAccounts([]);
      setError("Error fetching accounts");
    }
  };

  const handleAddAccountClick = () => {
    setIsAddModalOpen(true);
  };

  const handleAddManualAccount = async (
    accountProvider: SupportedAccount,
    userId: string,
    statementDirectory: string
  ): Promise<boolean> => {
    try {
      const createdAccount = await createAccount(
        accountProvider.accountProvider,
        userId,
        statementDirectory
      );
      const updatedAccounts = [...accounts, createdAccount];
      setAccounts(updatedAccounts);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error adding account ${error.message}`);
      } else {
        console.log("Error adding account: An unknown error occurred");
      }
      return false;
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };

  if (error) {
    return (
      <div className="flex justify-center">
        <div className="px-7 py-3 border border-red-700 rounded-xl max-w-3xl bg-red-100/50 text-center">
          <span className="text-red-700 text-lg">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("flex", font.className)}>
      <div className="flex-grow flex flex-col items-center w-full mx-auto max-w-4xl">
        <button
          className="flex flex-none items-center justify-center h-10 w-64 mb-5 \
                    rounded-lg cursor-pointer border bg-theme-lgt-green \
                    hover:bg-theme-drk-green active:bg-theme-pressed-green \
                    active:scale-95 active:shadow-inner"
          onClick={handleAddAccountClick}
        >
          <PlusIcon className="h-5 w-5" />
          <span className="text-m">Add Account</span>
        </button>

        {isAddModalOpen && (
          <AddAccountModal
            users={users}
            onAddManualAccount={handleAddManualAccount}
            onAddPlaidAccount={fetchAndSetAccounts}
            onCloseModal={handleCloseModal}
          />
        )}

        <AccountsTable accounts={accounts} users={users} />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccountsContent />
    </Suspense>
  );
}
