import { Commod } from "./commod";
import { MarketData } from "./marketdata";

export interface Island {
  id: string;
  islandname: string;
  archipelago: string;
  link: string;
  size: string;
  islandType: string;
  population: number;
  governor: string;
  governor_link: string;
  property_tax: string;
  flag: string;
  flag_link: string;
  spawns: Commod[];
  oceanId: number;
  marketdata: MarketData[] | [];
}
