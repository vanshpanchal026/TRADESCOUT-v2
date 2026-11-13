export interface RRGTrailPoint {
  date: string;
  rs_ratio: number;
  rs_momentum: number;
}

export interface RRGItem {
  symbol: string;
  name: string;
  group: "sector" | "top-momentum" | string;
  rs_ratio: number;
  rs_momentum: number;
  quadrant: "Leading" | "Weakening" | "Lagging" | "Improving";
  color: string;
  cmp: number;
  change_1d: number;
  trail: RRGTrailPoint[];
}

export interface RRGData {
  benchmark: string;
  group: "sectors" | "top-momentum" | string;
  date: string;
  quadrant_counts: {
    Leading: number;
    Weakening: number;
    Lagging: number;
    Improving: number;
  };
  items: RRGItem[];
}
