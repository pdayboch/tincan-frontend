import { getBaseApiUrl } from "@/utils/api-utils";

export type PlaidSetAccessTokenResponse = {
  detailsJobId: string;
  syncAccountsJobId: string;
};

export type PlaidItemInitializationJobStatusesResponse = {
  detailsJobStatus: "pending" | "completed" | "failed";
  syncAccountsJobStatus: "pending" | "completed" | "failed";
};

export async function plaidCreateLinkToken(userId: string): Promise<string> {
  const url = `${getBaseApiUrl()}/api/v1/plaid/create-link-token`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId: userId }),
  });

  if (!response.ok) {
    throw new Error(`Error creating plaid link token: ${response.status}`);
  }
  const data: { linkToken: string } = await response.json();
  return data.linkToken;
}

export async function plaidSetAccessToken(
  public_token: string,
  userId: string
): Promise<PlaidSetAccessTokenResponse> {
  const url = `${getBaseApiUrl()}/api/v1/plaid/set-access-token`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ public_token: public_token, userId: userId }),
  });

  if (!response.ok) {
    throw new Error(`Error storing plaid access token: ${response.status}`);
  }
  const data: PlaidSetAccessTokenResponse = await response.json();
  return data;
}

export async function plaidFetchItemInitializationJobStatuses(
  jobIds: PlaidSetAccessTokenResponse
): Promise<PlaidItemInitializationJobStatusesResponse> {
  const queryParams = new URLSearchParams(
    jobIds as Record<string, string>
  ).toString();
  const url = `${getBaseApiUrl()}/api/v1/plaid/item-initialization-job-statuses?${queryParams}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Error fetching Plaid initialization job statuses: ${response.status}`
    );
  }

  const data: PlaidItemInitializationJobStatusesResponse =
    await response.json();
  return data;
}
