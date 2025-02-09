import React, { useState, useEffect } from "react";
import { SupportedAccount, User } from "../../../lib/definitions";
import ManualAccountPickerScreen from "./screens/ManualAccountPickerScreen";
import ManualAccountDetailsScreen from "./screens/ManualAccountDetailsScreen";
import { fetchSupportedAccounts } from "@/lib/api/account-api";
import HowToAddAccountScreen from "./screens/HowToAddAccountScreen";
import { XMarkIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

enum ModalScreen {
  HOW_TO_ADD = "HOW_TO_ADD",
  ACCOUNT_PICKER = "ACCOUNT_PICKER",
  ACCOUNT_DETAILS = "ACCOUNT_DETAILS",
  PLAID_LINK = "PLAID_LINK",
}

export type AccountAddMethod = "manual" | "plaid" | null;

interface AddAccountModalProps {
  users: User[];
  onAddManualAccount: (
    accountProvider: SupportedAccount,
    userId: string,
    statementDirectory: string
  ) => void;
  onCloseModal: () => void;
}

export default function AddAccountModal({
  users,
  onAddManualAccount,
  onCloseModal,
}: AddAccountModalProps) {
  const [currentScreen, setCurrentScreen] = useState<ModalScreen>(
    ModalScreen.HOW_TO_ADD
  );
  const [supportedManualAccounts, setSupportedManualAccounts] = useState<
    SupportedAccount[]
  >([]);
  const [selectedManualAccount, setSelectedManualAccount] =
    useState<SupportedAccount | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch Supported Accounts on component load.
  useEffect(() => {
    fetchSupportedAccounts()
      .then((data) => {
        setSupportedManualAccounts(data);
      })
      .catch((error) => {
        console.error(error);
        setSupportedManualAccounts([]);
      });
  }, []);

  const showBackButton = [
    ModalScreen.ACCOUNT_DETAILS,
    ModalScreen.ACCOUNT_PICKER,
  ].includes(currentScreen);

  const handleAddMethodSelection = (method: AccountAddMethod) => {
    if (method === "manual") {
      setCurrentScreen(ModalScreen.ACCOUNT_PICKER);
    } else if (method === "plaid") {
      setCurrentScreen(ModalScreen.PLAID_LINK);
    }
  };

  const handleManualAccountSelect = (account: SupportedAccount) => {
    setSelectedManualAccount(account);
    setCurrentScreen(ModalScreen.ACCOUNT_DETAILS);
  };

  const handleAddManualAccount = (
    userId: string,
    statementDirectory: string
  ) => {
    if (selectedManualAccount) {
      onAddManualAccount(selectedManualAccount, userId, statementDirectory);
      handleCloseModal();
    }
  };

  const handleBack = () => {
    switch (currentScreen) {
      case ModalScreen.ACCOUNT_PICKER:
        setCurrentScreen(ModalScreen.HOW_TO_ADD);
        break;
      case ModalScreen.ACCOUNT_DETAILS:
        setCurrentScreen(ModalScreen.ACCOUNT_PICKER);
        setSelectedManualAccount(null);
        break;
      default:
        break;
    }
  };

  const handleCloseModal = () => {
    setCurrentScreen(ModalScreen.HOW_TO_ADD);
    setSelectedManualAccount(null);
    setSearchQuery("");
    onCloseModal();
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case ModalScreen.HOW_TO_ADD:
        return <HowToAddAccountScreen onSelection={handleAddMethodSelection} />;
      case ModalScreen.ACCOUNT_PICKER:
        return (
          <ManualAccountPickerScreen
            supportedAccounts={supportedManualAccounts}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAccountSelect={handleManualAccountSelect}
          />
        );
      case ModalScreen.ACCOUNT_DETAILS:
        return (
          <ManualAccountDetailsScreen
            users={users}
            selectedAccount={selectedManualAccount}
            onAddAccount={handleAddManualAccount}
          />
        );
      case ModalScreen.PLAID_LINK:
        return <div>Todo</div>;
    }
  };
  return (
    <div className="fixed inset-0 bg-gray-700/50 flex justify-center items-center">
      <div className="flex flex-col bg-white rounded-lg shadow-xl w-[700px] h-[700px] relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-color"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
              </button>
            )}
            <h2 className="text-xl font-semibold">Add Account</h2>
          </div>
          {/* X (close) button */}
          <button
            onClick={handleCloseModal}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{renderScreen()}</div>
      </div>
    </div>
  );
}
