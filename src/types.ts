export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  uid: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
}

export interface Category {
  id: string;
  uid: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Budget {
  id: string;
  uid: string;
  category: string;
  amount: number;
  month: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  currency: string;
  createdAt: string;
}
