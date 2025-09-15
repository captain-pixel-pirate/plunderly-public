import { CraftingDiscipline, LaborOutput, RankLevel } from "./labor";
import { Employer } from "./employer";

export interface Worker {
  id: string;
  name: string;
  account: string;
  ocean: "Emerald" | "Meridian" | "Cerulean";
  badgeType: "Standard" | "Deluxe" | "Subscription";
  badgePurchaseDate: string;
  employers: Employer[];
  craftingSkills: {
    shipyard: {
      rank: RankLevel;
      output: LaborOutput;
      lastPuzzleDate: string;
      active: boolean;
    };
    apothecary: {
      rank: RankLevel;
      output: LaborOutput;
      lastPuzzleDate: string;
      active: boolean;
    };
    ironMonger: {
      rank: RankLevel;
      output: LaborOutput;
      lastPuzzleDate: string;
      active: boolean;
    };
    distillery: {
      rank: RankLevel;
      output: LaborOutput;
      lastPuzzleDate: string;
      active: boolean;
    };
    weavery: {
      rank: RankLevel;
      output: LaborOutput;
      lastPuzzleDate: string;
      active: boolean;
    };
  };
  primaryCraftingSkill: CraftingDiscipline;
  lastUpdated: string;
}
