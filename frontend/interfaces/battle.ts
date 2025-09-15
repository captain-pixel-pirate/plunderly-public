import { Vessel } from "./vessel";

export interface Battle {
  playerVessel: Vessel;
  enemyVessel: Vessel;
  playerDamageTaken: number;
  enemyDamageTaken: number;
  type: "brigands" | "barbarians";
  expandCardInfo: boolean;
  wins: number;
  losses: number;
}
