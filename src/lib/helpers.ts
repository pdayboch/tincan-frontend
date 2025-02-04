import { Account, User } from "./definitions";

// Helper function to format amount as dollar value
export const formatCurrency = (amount: string | number): string => {
  // Convert input to a number
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount);

  // Return string as is for NaN cases
  if (isNaN(numericAmount)) {
    return amount.toString();
  }

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(numericAmount));

  return numericAmount < 0 ? `-${formattedAmount}` : formattedAmount;
};

export const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-');
  return `${month}-${day}-${year}`;
};

export function dateToString(date: Date): string {
  const year = date.getFullYear();
  // Months are 0-indexed, so add 1
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export const formatAccountLabel = (
  account: Account | undefined
): string => {
  if (!account) return '';

  if (account.institutionName) return `${account.institutionName} ${account.name}`;
  return `${account.name}`;
};

export const findUserName = (users: User[], userId: string): string => {
  return users.find(user => user.id === userId)?.name ?? '';
};
