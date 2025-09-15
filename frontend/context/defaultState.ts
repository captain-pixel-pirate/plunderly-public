import { CommodsState, LaborState } from "./types";
import { UserSettings } from "@interfaces";
import commodclassesData from "@data/commodclasses.json";

export const defaultUserSettings: UserSettings = {
  ocean: "Emerald",
  doubloon: 2600,
  copyScoreSettings: {
    reverseOrder: true,
    showAsFraction: true,
    showPercentage: true,
  },
  reverseVesselCardOrder: false,
  greedySettings: {
    enablePayments: true,
    enableTopBasherPay: false,
    payPerGreedy: 250,
    payPerTopBasher: 1000,
  },
};

export const defaultCommods: CommodsState = {
  lastUpdated: new Date(0),
  items: [],
  commodclasses: commodclassesData,
};

export const defaultLabor: LaborState = {
  activeWorkers: [],
  dormantWorkers: [],
  employers: [],
  laborPay: {
    apothecary: { basic: 20, skilled: 20, expert: 20 },
    distillery: { basic: 20, skilled: 20, expert: 20 },
    ironMonger: { basic: 20, skilled: 20, expert: 20 },
    shipyard: { basic: 20, skilled: 20, expert: 20 },
    weavery: { basic: 20, skilled: 20, expert: 20 },
  },
  laborTax: { basic: 3, skilled: 4, expert: 5 },
  hasLoadedSampleData: false,
};
