import { Commod } from "./commod";
import { Stall } from "./stall";

export interface Sell {
  id: string;
  price: number;
  qty: number;
  commodid: number;
  commod: Commod;
  stall: Stall;
  stallid: string;
}
