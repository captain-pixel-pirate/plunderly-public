"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import type {
  CommodsState,
  GlobalState,
  LaborState,
  SampleLaborData,
} from "./types";
import type {
  Ocean,
  Recipe,
  ShoppeMetaData,
  UserSettings,
  Vessel,
  Worker,
} from "@interfaces";
import { useNotificationContext } from "./NotificationProvider";
import {
  defaultCommods,
  defaultLabor,
  defaultUserSettings,
} from "./defaultState";
import api from "@utils/api";

import oceansData from "@data/oceans.json";
import recipesData from "@data/recipes.json";
import sampleLaborDataJson from "@data/sampleLaborData.json";
import shoppeMetaData from "@data/shoppes.json";
import vesselsData from "@data/vessels.json";

const GlobalContext = createContext<GlobalState | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const { addAlertMessage } = useNotificationContext();
  const [hasMounted, setHasMounted] = useState(false);

  const [userSettings, setUserSettings] =
    useState<UserSettings>(defaultUserSettings);
  const [oceans, setOceans] = useState<Ocean[]>(oceansData);
  const [commods, setCommods] = useState<CommodsState>(defaultCommods);
  const [labor, setLabor] = useState<LaborState>(defaultLabor);

  const VALID_TYPES = [
    "shipyard",
    "ironMonger",
    "apothecary",
    "distillery",
    "weavery",
  ] as const;
  type RecipeType = (typeof VALID_TYPES)[number];

  const recipes: Recipe[] = recipesData.map((r) => {
    if (!VALID_TYPES.includes(r.type as RecipeType)) {
      throw new Error(`Invalid recipe type: ${r.type}`);
    }

    return {
      ...r,
      type: r.type as RecipeType,
    };
  });

  useEffect(() => {
    setHasMounted(true);

    const savedOceans = localStorage.getItem("oceans");
    const savedCommods = localStorage.getItem("commods");
    const savedLabor = localStorage.getItem("labor");
    const savedUserSettings = localStorage.getItem("userSettings");

    if (savedOceans) {
      try {
        setOceans(JSON.parse(savedOceans));
      } catch (e) {
        console.warn("Invalid oceans data in localStorage");
      }
    }

    if (savedCommods) {
      try {
        const parsed = JSON.parse(savedCommods);
        parsed.lastUpdated = new Date(parsed.lastUpdated);
        setCommods(parsed);
      } catch (e) {
        console.warn("Invalid commods data in localStorage");
      }
    }

    if (savedLabor) {
      try {
        const parsedLabor = JSON.parse(savedLabor);

        const defaultLabor: LaborState = {
          activeWorkers: [],
          dormantWorkers: [],
          employers: [],
          hasLoadedSampleData: false,
          laborPay: {
            apothecary: { basic: 20, skilled: 20, expert: 20 },
            distillery: { basic: 20, skilled: 20, expert: 20 },
            ironMonger: { basic: 20, skilled: 20, expert: 20 },
            shipyard: { basic: 20, skilled: 20, expert: 20 },
            weavery: { basic: 20, skilled: 20, expert: 20 },
          },
          laborTax: { basic: 3, skilled: 4, expert: 5 },
        };

        const mergedLabor: LaborState = {
          ...defaultLabor,
          ...parsedLabor,
          laborPay: {
            ...defaultLabor.laborPay,
            ...(parsedLabor.laborPay || {}),
          },
          laborTax: {
            ...defaultLabor.laborTax,
            ...(parsedLabor.laborTax || {}),
          },
        };

        const ensureActiveField = (worker: Worker): Worker => {
          const skills = worker.craftingSkills;
          const needsMigration = (
            Object.values(skills) as Array<{ active?: boolean } | undefined>
          ).some((s) => s && typeof s.active === "undefined");

          if (!needsMigration) {
            return worker;
          }
          const updatedSkills = Object.fromEntries(
            (Object.keys(skills) as Array<keyof typeof skills>).map((key) => {
              const s = skills[key];
              return [key, s ? { ...s, active: false } : s];
            })
          ) as typeof skills;
          const primary = worker.primaryCraftingSkill;
          if (primary && updatedSkills[primary]) {
            updatedSkills[primary] = {
              ...updatedSkills[primary],
              active: true,
            };
          }
          return { ...worker, craftingSkills: updatedSkills };
        };

        mergedLabor.activeWorkers =
          mergedLabor.activeWorkers.map(ensureActiveField);
        mergedLabor.dormantWorkers =
          mergedLabor.dormantWorkers.map(ensureActiveField);

        setLabor(mergedLabor);
      } catch (e) {
        console.warn("Invalid labor data in localStorage");
      }
    }

    if (savedUserSettings) {
      try {
        const parsedSettings = JSON.parse(savedUserSettings);

        const defaultUserSettings: UserSettings = {
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

        // Deep merge: override defaults with saved values
        const mergedSettings: UserSettings = {
          ...defaultUserSettings,
          ...parsedSettings,
          copyScoreSettings: {
            ...defaultUserSettings.copyScoreSettings,
            ...(parsedSettings.copyScoreSettings || {}),
          },
          greedySettings: {
            ...defaultUserSettings.greedySettings,
            ...(parsedSettings.greedySettings || {}),
          },
        };

        setUserSettings(mergedSettings);
      } catch (e) {
        console.warn("Invalid userSettings data in localStorage");
        addAlertMessage({
          severity: "error",
          text: "Invalid userSettings data in localStorage",
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    const initialized = localStorage.getItem("hasInitializedLabor");

    const hasAnyLaborData =
      labor.activeWorkers.length > 0 ||
      labor.dormantWorkers.length > 0 ||
      labor.employers.length > 0;

    if (!initialized) {
      if (hasAnyLaborData) {
        localStorage.setItem("hasInitializedLabor", "true");
        return;
      }

      const sampleData = sampleLaborDataJson as SampleLaborData;
      const updatedWorkers: Worker[] = sampleData.workers.map((worker) => {
        const updatedWorker = { ...worker };

        updatedWorker.badgePurchaseDate = getRandomPastDate(30);
        (
          Object.keys(updatedWorker.craftingSkills) as Array<
            keyof typeof updatedWorker.craftingSkills
          >
        ).forEach((skillKey) => {
          const skill = updatedWorker.craftingSkills[skillKey];
          if (skill && skill.lastPuzzleDate) {
            skill.lastPuzzleDate = getRandomPastDate(10);
          }
        });

        return updatedWorker;
      });

      const newLabor: LaborState = {
        activeWorkers: updatedWorkers,
        dormantWorkers: [],
        employers: sampleData.employers,
        hasLoadedSampleData: true,
        laborPay: {
          apothecary: {
            basic: 20,
            skilled: 20,
            expert: 20,
          },
          distillery: {
            basic: 20,
            skilled: 20,
            expert: 20,
          },
          ironMonger: {
            basic: 20,
            skilled: 20,
            expert: 20,
          },
          shipyard: {
            basic: 20,
            skilled: 20,
            expert: 20,
          },
          weavery: {
            basic: 20,
            skilled: 20,
            expert: 20,
          },
        },
        laborTax: {
          basic: 3,
          skilled: 4,
          expert: 5,
        },
      };

      setLabor(newLabor);
      localStorage.setItem("labor", JSON.stringify(newLabor));
      localStorage.setItem("hasInitializedLabor", "true");
    }
  }, [hasMounted, labor]);

  useEffect(() => {
    localStorage.setItem("oceans", JSON.stringify(oceans));
  }, [oceans]);

  useEffect(() => {
    localStorage.setItem("labor", JSON.stringify(labor));
  }, [labor]);

  useEffect(() => {
    localStorage.setItem("userSettings", JSON.stringify(userSettings));
  }, [userSettings]);

  useEffect(() => {
    if (!hasMounted) return;

    const now = new Date();
    const lastUpdatedTime = new Date(commods.lastUpdated);
    const timeDiff = now.getTime() - lastUpdatedTime.getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (commods.items.length === 0 || timeDiff > twentyFourHours) {
      updateCommodsIfNeeded();
    }
  }, [commods.items, commods.lastUpdated, hasMounted]);

  const updatedItems = (data: any) => {
    if (commods.items.length <= 0) {
      return data;
    } else {
      const updatedItems = [...commods.items].map((item) => {
        const updatedItem = data.find(
          (d: any) => d.commodname === item.commodname
        );
        if (!updatedItem) {
          console.log(
            `Could not find updated information for ${item.commodname}.`
          );
          return item;
        }

        return {
          ...updatedItem,
          pricePerUnit: item.pricePerUnit ? item.pricePerUnit : 0,
          ...(item.commodclass && { commodClass: item.commodclass }),
        };
      });

      return updatedItems;
    }
  };

  const updateCommodsIfNeeded = async () => {
    try {
      const response = await api.get("/commods");
      const updatedCommods = {
        ...commods,
        lastUpdated: new Date(),
        items: updatedItems(response.data),
      };

      setCommods(updatedCommods);
      localStorage.setItem("commods", JSON.stringify(updatedCommods));
    } catch (error) {
      addAlertMessage({
        severity: "error",
        text: "Error occurred updating commodities.",
      });
      console.error("Error updating commods:", error);
    }
  };

  if (!hasMounted) return null;

  return (
    <GlobalContext.Provider
      value={{
        userSettings,
        setUserSettings,
        oceans,
        setOceans,
        recipes,
        commods,
        setCommods,
        labor,
        setLabor,
        vessels: vesselsData as Vessel[],
        shoppesMetaData: shoppeMetaData as ShoppeMetaData[],
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalState => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};

function getRandomPastDate(daysBack: number) {
  const now = new Date();
  const past = new Date();
  past.setDate(now.getDate() - Math.floor(Math.random() * daysBack));
  return past.toISOString();
}
