
export type Currency = 'PHP' | 'USD';

export type Store =
  | 'Shopee'
  | 'Lazada'
  | 'TikTok Shop'
  | 'Etsy'
  | 'Shopify Local'
  | 'Shopify International';

export interface Transaction {
  id: string;
  date: string; // ISO
  store: Store;
  amount: number; // sale amount in its currency
  currency: Currency;
  factory_price: number; // in same currency as amount
  notes: string | null;
  created_at?: string;
}

export interface Settings {
  id: number; // always 1 row
  usd_to_php: number;
  monthly_goal_amount: number;
  monthly_goal_currency: Currency;
  updated_at?: string;
}
