export interface ScannerStock {
  symbol: string;
  name?: string | null;
  company_name?: string | null;
  cmp?: number | null;
  close?: number | null;
  prev_close?: number | null;
  day_change?: number | null;
  change_pct?: number | null;
  rvol?: number | null;
  rs_rating?: number | null;
  stage?: number | null;
  stage_name?: string | null;
  conditions_met?: number | null;
  sma_10?: number | null;
  sma_20?: number | null;
  sma_50?: number | null;
  sma_150?: number | null;
  sma_200?: number | null;
  from_52w_high?: number | null;
  from_52w_low?: number | null;
  above_52w_low?: number | null;
  high_52w?: number | null;
  low_52w?: number | null;
  volume?: number | null;
  rsi?: number | null;
  delivery_pct?: number | null;
  industry?: string | null;
  sector?: string | null;
  sparkline?: number[] | null;
  market_cap?: number | null;
  pe?: number | null;
  [key: string]: unknown;
}

export interface ScannerMetadata {
  slug: string;
  title: string;
  description: string;
  last_updated: string;
  total_matches: number;
  returned: number;
  offset: number;
  limit: number;
  sort_by: string;
  direction: "asc" | "desc";
  is_truncated: boolean;
}

export interface ScannerApiResponse {
  metadata: ScannerMetadata;
  data: ScannerStock[];
  results?: ScannerStock[];
  total_results?: number;
  is_truncated?: boolean;
}

export interface MarketBreadth {
  date: string;
  total_traded: number;
  advances: number;
  declines: number;
  unchanged: number;
  advance_decline_ratio: number;
  above_50_sma_pct: number;
  above_200_sma_pct: number;
  stage_2_count: number;
  stage_4_count: number;
  stage_2_to_4_ratio: number;
  updated_at: string;
}

export interface MarketMetadata {
  last_synced_date: string;
  last_trading_date?: string;
  total_equities: number;
  total_stocks?: number;
  status: string;
  market_status: "open" | "closed" | "pre_open";
  server_time_utc: string;
  scanner_counts: Record<string, number>;
}

export interface StockDetail {
  symbol: string;
  name?: string | null;
  company_name?: string | null;
  isin?: string | null;
  series?: string | null;
  industry?: string | null;
  sector?: string | null;
  cmp: number;
  prev_close?: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  change?: number | null;
  day_change: number;
  change_pct: number;
  high_52w?: number | null;
  low_52w?: number | null;
  "52w_high"?: number | null;
  "52w_low"?: number | null;
  from_52w_high?: number | null;
  from_52w_low?: number | null;
  stage: number;
  stage_name: string;
  rs_rating: number;
  conditions_met?: number | null;
  sma_10?: number | null;
  sma_20?: number | null;
  sma_50?: number | null;
  sma_150?: number | null;
  sma_200?: number | null;
  ema_12?: number | null;
  ema_26?: number | null;
  rsi?: number | null;
  rvol: number;
  volume?: number | null;
  avg_volume_50d?: number | null;
  turnover?: number | null;
  delivery_pct?: number | null;
  trades?: number | null;
  market_cap?: number | null;
  pe?: number | null;
  last_updated?: string | null;
}

export interface OHLCVBar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface RSLinePoint {
  time: string;
  value: number;
  date?: string | null;
}

export interface RSLineResponse {
  symbol: string;
  benchmark: string;
  period: string;
  rs_rating: number;
  data_points: number;
  rs_line: RSLinePoint[];
  rs_new_high: boolean;
  rs_trend: "up" | "down" | "flat";
}

export interface QuarterlyMetric {
  quarter: string;
  date?: string | null;
  sales?: number | null;
  ebitda?: number | null;
  operating_profit?: number | null;
  opm?: number | null;
  net_profit?: number | null;
  eps?: number | null;
  sales_yoy?: number | null;
  np_yoy?: number | null;
  eps_yoy?: number | null;
  promoter_pct?: number | null;
  fii_pct?: number | null;
  dii_pct?: number | null;
  public_pct?: number | null;
}

export interface AnnualMetric {
  year: string;
  sales?: number | null;
  net_profit?: number | null;
  opm?: number | null;
  eps?: number | null;
  sales_growth?: number | null;
  np_growth?: number | null;
}

export interface StockFundamentals {
  symbol: string;
  company_name?: string | null;
  sector?: string | null;
  industry?: string | null;
  market_cap?: number | null;
  pe?: number | null;
  pb?: number | null;
  roe?: number | null;
  roce?: number | null;
  debt_to_equity?: number | null;
  div_yield?: number | null;
  book_value?: number | null;
  promoter_pct?: number | null;
  fii_pct?: number | null;
  dii_pct?: number | null;
  public_pct?: number | null;
  quarterly: QuarterlyMetric[];
  annual?: AnnualMetric[];
}
