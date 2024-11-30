import { getBaseApiUrl } from "@/utils/api-utils";
import { TransactionSplit, TransactionUpdate } from "../definitions";

export async function fetchTransactionSplits(
  transactionId: number
): Promise<TransactionSplit> {
  const url = `${getBaseApiUrl()}/transactions/${transactionId}/splits`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching transaction splits: ${response.status}`);
  }
  const data: TransactionSplit = await response.json();
  return data;
}

export async function syncTransactionSplits(
  transactionId: number,
  splits: TransactionUpdate[]
): Promise<TransactionSplit> {
  const url = `${getBaseApiUrl()}/transactions/${transactionId}/sync-splits`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({splits: splits})
  });
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Error syncing transaction splits: ${errorMessage}`)
  }
  const data: TransactionSplit = await response.json();
  return data;
}