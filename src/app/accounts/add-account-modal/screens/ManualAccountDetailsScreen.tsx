import React, { useState } from "react";
import { PlusCircleIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import { SupportedAccount, User } from "@/lib/definitions";

interface ManualAccountDetailsScreenProps {
  users: User[];
  selectedAccount: SupportedAccount | null;
  onAddAccount: (userId: string, statementDirectory: string) => void;
}

export default function ManualAccountDetailsScreen({
  users,
  selectedAccount,
  onAddAccount,
}: ManualAccountDetailsScreenProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [statementDirectory, setStatementDirectory] = useState<string>("");

  const handleAddAccount = () => {
    if (selectedUserId) {
      onAddAccount(selectedUserId, statementDirectory);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-600">
        Enter Account Details
      </h2>

      {selectedAccount && (
        <p className="text-md font-semibold text-gray-500">
          {selectedAccount.institutionName || ""} {selectedAccount.accountName}
        </p>
      )}

      <div>
        <label
          htmlFor="user-select"
          className="block text-md font-medium text-gray-700 mb-2"
        >
          User:
        </label>
        <select
          id="user-select"
          value={selectedUserId ? selectedUserId : ""}
          onChange={(e) => {
            const userId = e.target.value;
            setSelectedUserId(userId);
          }}
        >
          <option value="" disabled>
            Select a user
          </option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="statement-directory"
          className="block text-sm font-medium text-gray-700"
        >
          Statement Directory (optional):
        </label>
        <input
          type="text"
          id="statement-directory"
          value={statementDirectory}
          onChange={(e) => setStatementDirectory(e.target.value)}
          placeholder=""
          className="mt-1 block w-3/4 py-2 px-3 border border-gray-300 \
                  rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 \
                  focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleAddAccount}
          disabled={!selectedUserId}
          className={clsx(
            "px-4 py-2 rounded-lg shadow-sm flex items-center space-x-2",
            "transition duration-300 ease-in-out",
            selectedUserId
              ? "bg-theme-lgt-green hover:bg-theme-drk-green active:bg-theme-pressed-green"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
        >
          <PlusCircleIcon className="h-5 w-5" />
          <span>Add Account</span>
        </button>
      </div>
    </div>
  );
}
