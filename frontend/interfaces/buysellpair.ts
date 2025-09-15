export interface BuySellPair {
  commodity: string;
  tradingOutlet: string;
  buyPrice: number | null;
  willBuy: number | null;
  sellPrice: number | null;
  willSell: number | null;
  commodityClass: string;
}
