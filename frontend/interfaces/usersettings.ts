export interface UserSettings {
  ocean: "Emerald" | "Meridian" | "Cerulean";
  doubloon: number;
  reverseVesselCardOrder: boolean;
  copyScoreSettings: CopyScoreSettings;
  greedySettings: GreedySettings;
}

interface CopyScoreSettings {
  showPercentage: boolean;
  showAsFraction: boolean;
  reverseOrder: boolean;
}

export interface GreedySettings {
  enablePayments: boolean;
  enableTopBasherPay: boolean;
  payPerGreedy: number;
  payPerTopBasher: number;
}
