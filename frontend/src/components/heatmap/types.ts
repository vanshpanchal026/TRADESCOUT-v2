export interface HeatmapStock {
  symbol: string;
  name: string;
  cmp: number;
  change_1d: number;
  market_cap: number;
  weight_pct: number;
  volume: number;
}

export interface HeatmapSector {
  name: string;
  market_cap: number;
  weight_pct: number;
  change_1d: number;
  stocks: HeatmapStock[];
}

export interface HeatmapData {
  index: "NIFTY 50" | "NIFTY NEXT 50" | "NIFTY MIDCAP 100" | "NIFTY 500" | string;
  date: string;
  total_market_cap: number;
  sectors: HeatmapSector[];
}
