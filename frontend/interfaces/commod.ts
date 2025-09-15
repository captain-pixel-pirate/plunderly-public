import { CommodClass } from "./commodclass";

export interface Commod {
  id: number;
  commodname: string;
  unitmass?: number;
  unitvolume?: number;
  emeraldtax?: number;
  ceruleantax?: number;
  meridiantax?: number;
  commodclass: CommodClass;
  commodclassid: number;
  pricePerUnit?: number;
  updatedAt?: Date;
}
