import { CommodClass } from "./commodclass";
import { Sell } from "./sell";
import { Buy } from "./buy";

export interface MarketData {
  id: number;
  commodclass: CommodClass;
  sells: Sell[];
  buys: Buy[];
  lastUpdated: string;
}
