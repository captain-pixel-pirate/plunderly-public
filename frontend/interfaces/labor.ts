export type ExperienceLevel =
  | "Novice"
  | "Neophyte"
  | "Apprentice"
  | "Narrow"
  | "Broad"
  | "Solid"
  | "Weighty"
  | "Expert"
  | "Paragon"
  | "Illustrious"
  | "Sublime"
  | "Revered"
  | "Exalted"
  | "Transcendent";

export type RankLevel =
  | "Able"
  | "Proficient"
  | "Distinguished"
  | "Respected"
  | "Master"
  | "Renowned"
  | "Grand-Master"
  | "Legendary"
  | "Ultimate";

export const RANK_LEVELS: RankLevel[] = [
  "Able",
  "Proficient",
  "Distinguished",
  "Respected",
  "Master",
  "Renowned",
  "Grand-Master",
  "Legendary",
  "Ultimate",
];

export type SHOPPE_GRADE =
  | "Small Stall"
  | "Medium Stall"
  | "Deluxe Stall"
  | "Shoppe"
  | "Upgraded Shoppe";

export type LaborOutput = "Basic" | "Skilled" | "Expert";

export type CraftingDiscipline =
  | "shipyard"
  | "apothecary"
  | "ironMonger"
  | "distillery"
  | "weavery";
export interface ShoppeMetaData {
  id: number;
  type: CraftingDiscipline;
  imagePath: string;
  grade: SHOPPE_GRADE;
  mass: number;
  volume: number;
  maxLaborThroughput: number;
  basicLaborCap: number;
  skilledLaborCap: number;
  expertLaborCap: number;
  construction: null | {
    upgrade: boolean;
    iron: number;
    stone: number;
    wood: number;
    tanCloth: number;
    basicLabor: number;
    skilledLabor: number;
    expertLabor: number;
    doubloonCost: number;
  };
}
