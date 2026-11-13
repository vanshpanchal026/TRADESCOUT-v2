export interface AdvanceDecline {
  advances: int;
  declines: int;
  unchanged: int;
  ratio: number;
}

type int = number;

export interface MarketParticipation {
  above_20_sma_count: number;
  above_20_sma_pct: number;
  above_50_sma_count: number;
  above_50_sma_pct: number;
  above_200_sma_count: number;
  above_200_sma_pct: number;
}

export interface RMESentiment {
  score: number;
  regime: "Oversold / Washout" | "Neutral" | "Overextended" | string;
  description: string;
}

export interface StageDistribution {
  stage_1_count: number;
  stage_1_pct: number;
  stage_2_count: number;
  stage_2_pct: number;
  stage_3_count: number;
  stage_3_pct: number;
  stage_4_count: number;
  stage_4_pct: number;
  stage_2_to_4_ratio: number;
}

export interface HighsLows52W {
  new_highs_52w: number;
  new_lows_52w: number;
  ratio: number;
}

export interface VolumeBreadth {
  avg_rvol: number;
  up_volume_ratio: number;
}

export interface GlobalCueItem {
  name: string;
  value: number;
  change_pts: number;
  change_pct: number;
}

export interface PreMarketCues {
  sentiment: "Bullish" | "Neutral" | "Cautious" | "Bearish" | string;
  summary: string;
  gift_nifty: {
    value: number;
    change_pts: number;
    change_pct: number;
  };
  global_markets: GlobalCueItem[];
  macro_catalysts: string[];
}

export interface EarningsHorizonItem {
  symbol: string;
  company_name: string;
  report_date: string;
  market_cap_cr: number;
  timing: string;
}

export interface WarmupData {
  date: string;
  market_status: "OPEN" | "CLOSED" | "PRE-MARKET" | string;
  last_synced: string;
  total_traded: number;
  advance_decline: AdvanceDecline;
  market_participation: MarketParticipation;
  rme_sentiment: RMESentiment;
  stage_distribution: StageDistribution;
  highs_lows_52w: HighsLows52W;
  volume_breadth: VolumeBreadth;
  pre_market_cues: PreMarketCues;
  earnings_horizon: EarningsHorizonItem[];
}
