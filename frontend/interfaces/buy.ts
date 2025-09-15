import { Commod } from "./commod";
import { Stall } from "./stall";

export interface Buy {
  id: string;
  price: number;
  qty: number;
  stall: Stall;
  stallid: string;
  commod: Commod;
  commodid: number;
  createdAt?: Date;
}
