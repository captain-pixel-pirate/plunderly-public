import {
  Worker,
  Employer,
  Commod,
  CommodClass,
  UserSettings,
  Ocean,
  Recipe,
  Vessel,
  ShoppeMetaData,
} from "@interfaces";

export interface SampleLaborData {
  workers: Worker[];
  employers: Employer[];
}

export interface CommodsState {
  lastUpdated: Date;
  items: Commod[];
  commodclasses: CommodClass[];
}

export interface LaborState {
  activeWorkers: Worker[];
  dormantWorkers: Worker[];
  employers: Employer[];
  laborPay: {
    shipyard: {
      basic: number;
      skilled: number;
      expert: number;
    };
    apothecary: {
      basic: number;
      skilled: number;
      expert: number;
    };
    ironMonger: {
      basic: number;
      skilled: number;
      expert: number;
    };
    distillery: {
      basic: number;
      skilled: number;
      expert: number;
    };
    weavery: {
      basic: number;
      skilled: number;
      expert: number;
    };
  };
  laborTax: {
    basic: number;
    skilled: number;
    expert: number;
  };
  hasLoadedSampleData: boolean;
}

export interface GlobalState {
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  oceans: Ocean[];
  setOceans: React.Dispatch<React.SetStateAction<Ocean[]>>;
  commods: CommodsState;
  setCommods: React.Dispatch<React.SetStateAction<CommodsState>>;
  recipes: Recipe[];
  labor: LaborState;
  setLabor: React.Dispatch<React.SetStateAction<LaborState>>;
  vessels: Vessel[];
  shoppesMetaData: ShoppeMetaData[];
}
