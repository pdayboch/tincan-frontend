import {
  PlaidLinkError,
  PlaidLinkOnExitMetadata,
  usePlaidLink,
} from "react-plaid-link";
import { useEffect, useRef, useState } from "react";
import {
  plaidCreateLinkToken,
  plaidFetchItemInitializationJobStatuses,
  plaidSetAccessToken,
  PlaidSetAccessTokenResponse,
} from "@/lib/api/plaid-api";
import { useSearchParams, usePathname } from "next/navigation";
import {
  CheckCircleIcon,
  ArrowPathIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

type PlaidLinkProps = {
  userId: string;
  onAccountAdd: () => void;
  onCancel: () => void;
  onClose: () => void;
};

type JobStatuses = {
  detailsJobStatus: "pending" | "completed" | "failed";
  syncAccountsJobStatus: "pending" | "completed" | "failed";
};

export default function PlaidLink({
  userId,
  onAccountAdd,
  onCancel,
  onClose,
}: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string>("");
  const [isPolling, setIsPolling] = useState(false);
  const [jobStatuses, setJobStatuses] = useState<JobStatuses | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const pathname = usePathname();

  // Cleanup to clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Fetch the Plaid Link token
  useEffect(() => {
    plaidCreateLinkToken(userId)
      .then((data) => {
        setLinkToken(data);
      })
      .catch((error) => {
        setError("Error initializing Plaid. Please close and try again.");
      });
  }, []);

  const pollJobStatus = async (jobs: PlaidSetAccessTokenResponse) => {
    setIsPolling(true);

    intervalRef.current = setInterval(async () => {
      try {
        const statuses = await plaidFetchItemInitializationJobStatuses(jobs);
        setJobStatuses(statuses);

        if (
          statuses.detailsJobStatus === "failed" ||
          statuses.syncAccountsJobStatus == "failed"
        ) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          setIsPolling(false);
          setError(
            "Failed to sync account information. This will be resolved shortly. You may close this window."
          );
        }

        if (
          statuses.detailsJobStatus === "completed" &&
          statuses.syncAccountsJobStatus === "completed"
        ) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          setIsPolling(false);
          onAccountAdd(); // callback to page to refetch accounts.
        }
      } catch (error) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsPolling(false);
        setError("Failed to check sync status. Please refresh the page");
      }
    }, 1500);
  };

  const onLinkSuccess = async (public_token: string) => {
    try {
      const resp = await plaidSetAccessToken(public_token, userId);
      pollJobStatus(resp);
    } catch (error) {
      setError("Failed to save account. Please try again.");
    }
  };

  const onLinkExit = (
    err: PlaidLinkError | null,
    metadata: PlaidLinkOnExitMetadata
  ) => {
    onCancel();
  };

  let isOauth = false;
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: linkToken,
    onSuccess: onLinkSuccess,
    onExit: onLinkExit,
  };

  if (params.toString().includes("oauth_state_id")) {
    config.receivedRedirectUri = `${pathname}?${params.toString()}`;
    isOauth = true;
  }

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (ready) {
      open();
    }
  }, [ready, open]);

  if (error) {
    return (
      <div className="flex items-center space-x-2 p-4 border border-red-700 rounded-xl">
        <XCircleIcon className="h-7 w-7 text-red-700" />
        <div className="text-red-700">{error}</div>
      </div>
    );
  }

  if (isPolling || jobStatuses) {
    return (
      <div className="flex flex-col items-center space-y-6 p-6">
        <div className="space-y-4 w-full max-w-md">
          {/* Bank Information Status */}
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Pulling bank information</span>
            {jobStatuses?.detailsJobStatus === "completed" ? (
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            ) : (
              <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-500" />
            )}
          </div>

          {/* Account Sync Status */}
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Syncing account information</span>
            {jobStatuses?.syncAccountsJobStatus === "completed" ? (
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            ) : (
              <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-500" />
            )}
          </div>
        </div>

        {jobStatuses?.detailsJobStatus === "completed" &&
          jobStatuses?.syncAccountsJobStatus === "completed" && (
            <div className="flex flex-col items-center space-y-4">
              <p className="text-green-600 font-medium">
                Institution linked successfully
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          )}
      </div>
    );
  }
  return <div>Connecting via Plaid...</div>;
}
