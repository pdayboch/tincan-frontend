export type Account = {
  id: string;
  name: string;
  institutionName: string;
  accountType: string;
  accountSubtype: string;
  currentBalance: string;
  active: boolean;
  deletable: boolean;
  userId: string;
  statementDirectory: string;
};

export type AccountUpdate = Partial<{
  // Include only the fields that can be updated
  active: boolean;
  statementDirectory: string;
}>;

export type CategorizationRule = {
  id: number;
  category: { id: number; name: string };
  subcategory: { id: number; name: string };
  conditions: CategorizationCondition[];
};

export type CategorizationRuleUpdate = Partial<{
  subcategoryId: number;
  conditions: CategorizationConditionUpdate[];
}>;

export type CategorizationCondition = {
  id: number;
  categorizationRuleId: number;
  transactionField: string;
  matchType: string;
  matchValue: string;
};

export type CategorizationConditionUpdate = Partial<{
  transactionField: string;
  matchType: string;
  matchValue: string;
}>;

export type Category = {
  id: number;
  name: string;
  categoryType: string;
  hasTransactions: boolean;
  subcategories: Subcategory[];
};

export type CategoryResponse = {
  totalItems: number;
  filteredItems: number;
  categories: Category[];
};

export type Subcategory = {
  id: number;
  name: string;
  categoryId: number;
  hasTransactions: boolean;
};

export type SupportedAccount = {
  accountProvider: string;
  institutionName: string;
  accountName: string;
  accountType: string;
};

export type Transaction = {
  id: number;
  amount: string;
  description: string;
  notes: string | null;
  pending: boolean;
  accountId: string;
  transactionDate: string;
  statementTransactionDate: string | null;
  statementDescription: string | null;
  splitFromId: number | null;
  hasSplits: boolean;
  userId: string;
  category: {
    id: number;
    name: string;
  };
  subcategory: {
    id: number;
    name: string;
  };
};

export type TransactionMetaData = {
  totalCount: number;
  filteredCount: number;
  prevPage: string | null;
  nextPage: string | null;
};

export type TransactionsResponse = {
  meta: TransactionMetaData;
  transactions: Transaction[];
};

export type TransactionUpdate = Partial<{
  // Include only the fields that can be updated
  transactionDate: string;
  amount: string;
  description: string;
  notes: string;
  subcategoryId: number;
}>;

export type TransactionSplit = {
  original: Transaction;
  splits: Transaction[];
};

export type TransactionTrendOverTime = {
  date: string;
  amount: number;
}[];

export type User = {
  id: string;
  name: string;
  email: string;
};
