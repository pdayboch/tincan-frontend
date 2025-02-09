import { AccountAddMethod } from "../AddAccountModal";
import { CreditCardIcon, ArrowUpTrayIcon } from "@heroicons/react/24/solid";

interface HowToAddAccountScreenProps {
  onSelection: (method: AccountAddMethod) => void;
}

export default function HowToAddAccountScreen({
  onSelection,
}: HowToAddAccountScreenProps) {
  return (
    <div className="w-full mx-auto p-6">
      <h2 className="text-xl font-semibold mb-6 text-center">
        Choose how to add your account
      </h2>

      <div className="flex gap-6">
        {/* Plaid Option */}
        <button
          onClick={() => onSelection("plaid")}
          className="group flex-1 flex flex-col items-center p-6 rounded-lg border-2 border-theme-lgt-green hover:border-theme-drk-green hover:bg-theme-lgt-green/20 active:bg-theme-pressed-green/20 transition-all-duration-200"
        >
          <div className="h-12 w-12 mb-4 text-gray-700 group-hover:text-theme-pressed-green">
            <CreditCardIcon className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium mb-2">Link to Bank</h3>
          <div className="text-sm text-gray-500">
            <span className="bg-theme-orange/20 px-2 py-1 rounded">
              Recommended
            </span>
          </div>
          <p className="mt-4 text-sm text-gray-600 text-center">
            Securely connect your bank account for automatic updates
          </p>
        </button>

        {/* Manual Option */}
        <button
          onClick={() => onSelection("manual")}
          className="group flex-1 flex flex-col items-center p-6 rounded-lg border-2 border-theme-lgt-green 
                   hover:border-theme-drk-green hover:bg-theme-lgt-green/20 
                   active:bg-theme-pressed-green/20 transition-all duration-200"
        >
          <div className="h-12 w-12 mb-4 text-theme-drk-green group-hover:text-theme-pressed-green">
            <ArrowUpTrayIcon className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium mb-2">Manual Upload</h3>
          <p className="mt-4 text-sm text-gray-600 text-center">
            Upload statement PDFs, CSVs or enter transactions manually
          </p>
        </button>
      </div>
    </div>
  );
}
