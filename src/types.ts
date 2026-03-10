export interface User {
  id: number;
  login: string;
  name: string;
  email: string;
  base_currency_code: string;
  time_zone: string;
  created_at: string;
  updated_at: string;
}

export interface Institution {
  id: number;
  title: string;
  currency_code: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: number;
  title: string;
  currency_code: string;
  current_balance: number;
  current_balance_date: string;
  type: string;
  is_net_worth: boolean;
  institution: {
    id: number;
    title: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionAccount {
  id: number;
  name: string;
  number: string;
  type: string;
  currency_code: string;
  current_balance: number;
  current_balance_date: string;
  starting_balance: number;
  starting_balance_date: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  payee: string;
  original_payee: string;
  date: string;
  amount: number;
  closing_balance: number;
  note: string | null;
  is_transfer: boolean;
  status: string;
  category: {
    id: number;
    title: string;
  } | null;
  transaction_account: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  title: string;
  colour: string | null;
  is_transfer: boolean;
  is_bill: boolean;
  parent_id: number | null;
  roll_up: boolean;
  children: Category[];
  created_at: string;
  updated_at: string;
}

export interface BudgetEvent {
  category: {
    id: number;
    title: string;
  };
  amount: number;
  currency_code: string;
  date: string;
  repeat_type: string;
}

export interface BudgetSummary {
  category: {
    id: number;
    title: string;
  };
  total_budgeted: number;
  total_actual: number;
  currency_code: string;
}

export interface TrendAnalysis {
  category: {
    id: number;
    title: string;
  };
  periods: {
    start_date: string;
    end_date: string;
    actual_amount: number;
    budgeted_amount: number;
  }[];
}

export interface Event {
  id: number;
  category: {
    id: number;
    title: string;
  };
  amount: string;
  repeat_type: string;
  repeat_interval: number;
  date: string;
  note: string | null;
  scenario: {
    id: number;
    title: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: number;
  title: string;
  file_name: string;
  type: string;
  content_type: string;
  original_url: string;
  created_at: string;
  updated_at: string;
}

export interface Currency {
  id: string;
  name: string;
  symbol: string;
  decimal_places: number;
}

export interface SavedSearch {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Label {
  name: string;
}
