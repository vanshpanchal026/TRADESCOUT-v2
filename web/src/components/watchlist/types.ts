export interface WatchlistSummary {
  id: string;
  name: string;
  description?: string | null;
  is_default: boolean;
  sort_order: number;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface WatchlistItem {
  id: string;
  watchlist_id: string;
  symbol: string;
  name: string;
  company_name?: string | null;
  cmp: number;
  change_pct: number;
  day_change?: number;
  rsi?: number | null;
  rs_rating?: number | null;
  from_52w_high?: number | null;
  stage?: number | null;
  stage_name?: string | null;
  notes?: string | null;
  added_price?: number | null;
  sparkline?: number[];
  added_at: string;
  sort_order: number;
}

export interface WatchlistDetail {
  status: string;
  id: string;
  name: string;
  description?: string | null;
  is_default: boolean;
  sort_order: number;
  items: WatchlistItem[];
  total_items: number;
  created_at: string;
  updated_at: string;
}
