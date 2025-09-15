import { RecipeCommod } from "./recipeCommod";

export interface Recipe {
  id: number;
  type: RecipeType;
  item: string;
  units: number;
  doubloons: number;
  basic: number;
  skilled: number;
  expert: number;
  commods: RecipeCommod[];
}

export type RecipeType =
  | "shipyard"
  | "ironMonger"
  | "apothecary"
  | "distillery"
  | "weavery";
