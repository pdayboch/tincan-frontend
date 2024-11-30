"use client"
import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import Search from '@/components/Search';
import { AddTransactionButton } from './components/buttons';
import TransactionsTable from './components/table/TransactionsTable';
import { Account, Category, Transaction, TransactionMetaData, User } from '@/lib/definitions';
import { Inter } from "next/font/google";
import clsx from 'clsx';
import { fetchUsers } from '@/lib/api/user-api';
import { fetchAccounts } from '@/lib/api/account-api';
import { fetchCategories } from '@/lib/api/category-api';
import { fetchTransactions } from '@/lib/api/transaction-api';
import SubcategoryFilter from '@/components/filters/SubcategoryFilter';
import AccountFilter from '@/components/filters/AccountFilter';
import UserFilter from '@/components/filters/UserFilter';
import TransactionSplitsModal from './components/splits/TransactionSplitsModal';
const font = Inter({ weight: ["400"], subsets: ['latin'] });

function TransactionsContent() {
  const [activeTransactionSplitId, setActiveTransactionSplitId] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionMetaData, setTransactionMetaData] =
    useState<TransactionMetaData>({
      totalCount: 0,
      filteredCount: 0,
      prevPage: null,
      nextPage: null
    })

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete('startingAfter');
    params.delete('endingBefore');

    if (term) {
      params.set('searchString', term);
    } else {
      params.delete('searchString');
    }
    replace(`${pathname}?${params.toString()}`)
  }

  const fetchTransactionsData = useCallback(() => {
    fetchTransactions(searchParams)
      .then(data => {
        setTransactions(data.transactions);
        setTransactionMetaData({
          totalCount: data.meta.totalCount,
          filteredCount: data.meta.filteredCount,
          prevPage: data.meta.prevPage,
          nextPage: data.meta.nextPage
        });
      })
      .catch(error => {
        console.error(error);
        setTransactions([]);
      });
  }, [searchParams]);

  // fetch and store all users
  useEffect(() => {
    fetchUsers()
      .then(data => {
        setUsers(data);
      })
      .catch(error => {
        console.error(error);
        setUsers([]);
      });
  }, []);

  // fetch and store all accounts
  useEffect(() => {
    fetchAccounts()
      .then(data => {
        setAccounts(data);
      })
      .catch(error => {
        console.error(error);
        setAccounts([]);
      });
  }, []);

  // fetch and store all categories
  useEffect(() => {
    fetchCategories()
      .then(data => {
        setCategories(data.categories);
      })
      .catch(error => {
        console.error(error);
        setCategories([]);
      });
  }, []);

  // fetch and store filtered transactions
  useEffect(() => {
    fetchTransactionsData();
  }, [fetchTransactionsData]);

  const handleTransactionSplitsModalClose = (refresh: boolean) => {
    setActiveTransactionSplitId(null);
    if (refresh) {
      // Refresh transactions if splits were saved
      fetchTransactionsData();
    }
  };

  return (
    <div className={clsx("flex flex-col p-6 max-w-6xl mx-auto", font.className)}>
      <div className="flex-grow flex flex-col space-y-6">

        {/* Top Controls Bar */}
        <div className="flex items-center gap-10">
          <Search
            placeholder="Search transactions..."
            value={searchParams.get('searchString')?.toString()}
            onSearch={handleSearch}
          />
          <AddTransactionButton />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col w-1/3">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Subcategory Filter
            </label>
            <SubcategoryFilter
              categories={categories}
            />
          </div>
          <div className="flex flex-col w-1/3">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Account Filter
            </label>
            <AccountFilter
              accounts={accounts}
            />
          </div>
          <div className="flex flex-col w-1/3">
            <label className="text-sm font-medium text-gray-700 mb-1">
              User Filter
            </label>
            <UserFilter
              users={users}
            />
          </div>
        </div>

        {/* Transaction Count Display */}
        <div className="text-sm text-gray-600 px-4">
          {transactionMetaData.filteredCount < transactionMetaData.totalCount
            ? `Filter returning ${transactionMetaData.filteredCount} of ${transactionMetaData.totalCount} transactions`
            : `Total transactions: ${transactionMetaData.totalCount}`}
        </div>

        {/* Transactions Table */}
        <TransactionsTable
          transactions={transactions}
          transactionMetaData={transactionMetaData}
          categories={categories}
          accounts={accounts}
          setTransactions={setTransactions}
          onClickSplitTransaction={(transactionId) => setActiveTransactionSplitId(transactionId)}
        />
      </div>

      {/* Conditionally render the TransactionSplitsModal */}
      {activeTransactionSplitId && (
        <TransactionSplitsModal
          transactionId={activeTransactionSplitId}
          categories={categories}
          onClose={handleTransactionSplitsModalClose}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TransactionsContent />
    </Suspense>
  );
}