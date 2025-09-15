import React, { useRef } from "react";

import { MenuItem } from "@mui/material";

import { useGlobalContext, useNotificationContext } from "@context";
import { Employer, Worker, CraftingDiscipline } from "@interfaces";
interface PlunderlyWorkerDataIn {
  app: "plunderly";
  workers: Worker[];
  employers: Employer[];
}

interface ShoppeKeeperWorkerDataIn {
  app: "shoppe-keeper";
  laborAlts: {
    id: string;
    account: string;
    pirateName: string;
    ocean: "emerald" | "meridian" | "cerulean";
    badgeType: "normal" | "deluxe" | "subscription";
    badgePurchaseDate: string;
    lastPuzzleDate: string;
  }[];
  employers: {
    id: string;
    shoppeName: string;
    shoppeType: CraftingDiscipline;
    island: string;
    pay: {
      basic: number;
      skilled: number;
      expert: number;
    };
    notes: string;
  }[];
}

export default function ImportWorkerJson() {
  const { addAlertMessage } = useNotificationContext();
  const { setLabor } = useGlobalContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMenuClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json") {
      alert("Only JSON files are allowed.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);

        if (!json || !json.app) {
          alert("Invalid file format. Please upload a valid JSON file.");
          return;
        }
        if (json.app === "plunderly") {
          const jsonDataIn = json as PlunderlyWorkerDataIn;
          setLabor((L) => {
            const currentActiveWorkers = L.activeWorkers;
            const currentEmployers = L.employers;

            // Reuse the migration here
            const ensureActiveField = (worker: Worker): Worker => {
              const skills = worker.craftingSkills;

              const needsMigration = (
                Object.values(skills) as Array<{ active?: boolean } | undefined>
              ).some((s) => s && typeof s.active === "undefined");

              if (!needsMigration) return worker;

              const updatedSkills = Object.fromEntries(
                (Object.keys(skills) as Array<keyof typeof skills>).map(
                  (key) => {
                    const s = skills[key];
                    return [key, s ? { ...s, active: false } : s];
                  }
                )
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

            const workersToBeAdded = jsonDataIn.workers.map(ensureActiveField);
            const employersToBeAdded = jsonDataIn.employers ?? [];

            return {
              ...L,
              activeWorkers: [
                ...currentActiveWorkers,
                ...workersToBeAdded.filter(
                  (newWorker) =>
                    !currentActiveWorkers.some(
                      (existingWorker) => existingWorker.name === newWorker.name
                    )
                ),
              ],
              employers: [
                ...currentEmployers,
                ...employersToBeAdded.filter(
                  (newEmployer) =>
                    !currentEmployers.some(
                      (existingEmployer) =>
                        existingEmployer.id === newEmployer.id
                    )
                ),
              ],
            };
          });

          addAlertMessage({
            severity: "success",
            text: "Labor data imported successfully.",
          });
        } else if (json.app === "shoppe-keeper") {
          const jsonDataIn = json as ShoppeKeeperWorkerDataIn;
          const newWorkers: Worker[] = jsonDataIn.laborAlts.map((worker) => {
            const lastPuzzleDateWithTimeAdded = ensureMiddayUTC(
              worker.lastPuzzleDate
            );
            const badgePurchaseDate = ensureMiddayUTC(worker.badgePurchaseDate);

            return {
              id: worker.id,
              name: worker.pirateName,
              account: worker.account ? worker.account : "",
              ocean: getOcean(worker.ocean),
              badgeType: getBadgeType(worker.badgeType),
              badgePurchaseDate: badgePurchaseDate,
              employers: [],
              craftingSkills: {
                shipyard: {
                  rank: "Able",
                  output: "Basic",
                  lastPuzzleDate: lastPuzzleDateWithTimeAdded,
                  active: true,
                },
                apothecary: {
                  rank: "Able",
                  output: "Basic",
                  lastPuzzleDate: lastPuzzleDateWithTimeAdded,
                  active: false,
                },
                ironMonger: {
                  rank: "Able",
                  output: "Basic",
                  lastPuzzleDate: lastPuzzleDateWithTimeAdded,
                  active: false,
                },
                distillery: {
                  rank: "Able",
                  output: "Basic",
                  lastPuzzleDate: lastPuzzleDateWithTimeAdded,
                  active: false,
                },
                weavery: {
                  rank: "Able",
                  output: "Basic",
                  lastPuzzleDate: lastPuzzleDateWithTimeAdded,
                  active: false,
                },
              },
              lastUpdated: new Date().toISOString(),
              primaryCraftingSkill: "shipyard",
            };
          });

          const newEmployers: Employer[] = jsonDataIn.employers.map((emp) => {
            let shoppeTypeIn: CraftingDiscipline = emp.shoppeType
              ? emp.shoppeType
              : "shipyard";
            if (
              shoppeTypeIn.replace(/\s+/g, "").toLowerCase() === "ironmonger" ||
              shoppeTypeIn.toLocaleLowerCase() === "furnisher"
            ) {
              shoppeTypeIn = "ironMonger";
            }

            return {
              id: emp?.id ?? "",
              island: emp?.island ?? "",
              name: emp?.shoppeName ?? "",
              notes: emp?.notes ?? "",
              pay: {
                basic: emp?.pay?.basic ?? 0,
                skilled: emp?.pay?.skilled ?? 0,
                expert: emp?.pay?.expert ?? 0,
              },
              shoppeGrade: "Upgraded Shoppe",
              shoppeType: shoppeTypeIn,
              workers: [],
            };
          });
          setLabor((L) => {
            const currentActiveWorkers = L.activeWorkers;
            const workersToBeAdded = newWorkers;
            return {
              ...L,
              activeWorkers: [
                ...currentActiveWorkers,
                ...workersToBeAdded.filter(
                  (newWorker: Worker) =>
                    !currentActiveWorkers.some(
                      (existingWorker: Worker) =>
                        existingWorker.id === newWorker.id ||
                        existingWorker.name === newWorker.name
                    )
                ),
              ],
              employers: [
                ...L.employers,
                ...newEmployers.filter(
                  (newEmployer) =>
                    !L.employers.some(
                      (existingEmployer) =>
                        existingEmployer.id === newEmployer.id
                    )
                ),
              ],
            };
          });
          addAlertMessage({
            severity: "success",
            text: "Labor data imported successfully.",
          });
        } else {
          addAlertMessage({
            severity: "error",
            text: "Unsupported app format. Please upload a valid JSON file.",
          });
        }
      } catch (err) {
        console.log(err);
        addAlertMessage({
          severity: "error",
          text: "Error parsing JSON file. Please ensure it is valid.",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <MenuItem onClick={handleMenuClick}>Import Labor</MenuItem>
      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </>
  );
}

function getBadgeType(input: string) {
  if (input === "normal") {
    return "Standard";
  } else if (input === "deluxe") {
    return "Deluxe";
  } else {
    return "Subscription";
  }
}

function getOcean(input: string) {
  const inputIn = input.toLowerCase();
  if (inputIn === "emerald") {
    return "Emerald";
  } else if (inputIn === "meridian") {
    return "Meridian";
  } else {
    return "Cerulean";
  }
}

function ensureMiddayUTC(dateStr: string): string {
  if (!dateStr.includes("T")) {
    return `${dateStr}T12:00:00Z`;
  }
  return dateStr.endsWith("Z") ? dateStr : `${dateStr}Z`;
}
