import { Island } from "./island";

export interface Ocean {
  id: number;
  name: string;
  archipelagos: Archipelago[];
}

export interface Archipelago {
  name: string;
  islands: Island[];
}
