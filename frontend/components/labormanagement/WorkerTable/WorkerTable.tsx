import React, { useState, useEffect } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import NotificationsIcon from "@mui/icons-material/Notifications";

import { CraftingDiscipline, Worker } from "@interfaces";
import { useNotificationContext, useGlobalContext } from "@context";
import { ConfirmDialog } from "@components/ux";
import { isoUtcMidnightToday } from "@utils/helpers";
import WorkerForm from "../WorkerForm";
import TableActionButtonsCell from "./TableActionButtons";
import LaborExpiryCell from "./LaborExpiryCell";
import BadgeExpiryCell from "./BadgeExpiryCell";
import ExpiryPreferencesModal from "./ExpiryPreferencesModal";

type SortableKey =
  | "craftingExpiry"
  | "badgeExpiry"
  | "name"
  | "id"
  | "employers";

export interface ExpiryPreferences {
  laborExpiryWarnDays: number;
  badgeExpiryWarnDays: number;
}

interface HeaderProps {
  label: string;
  sortKeyFor: SortableKey;
  show?: boolean;
}
interface Props {
  type: "Active" | "Dormant";
}

const ALLOWED_SORT_KEYS: SortableKey[] = [
  "craftingExpiry",
  "badgeExpiry",
  "name",
  "id",
  "employers",
];

const WorkerTable = ({ type }: Props) => {
  const { labor, setLabor, userSettings } = useGlobalContext();
  const { addAlertMessage } = useNotificationContext();

  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [deleteWorkerId, setDeleteWorkerId] = useState<string | null>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [expiryPreferences, setExpiryPreferences] = useState<ExpiryPreferences>(
    localStorage.getItem("expiryPreferences")
      ? JSON.parse(localStorage.getItem("expiryPreferences") || "{}")
      : {
          laborExpiryWarnDays: 2,
          badgeExpiryWarnDays: 2,
        }
  );
  const [openExpiryModal, setOpenExpiryModal] = useState(false);

  const [sortAsc, setSortAsc] = useState(true);
  const [sortKey, setSortKey] = useState<SortableKey>("name");

  const getPrimaryEmployer = (worker: Worker): string => {
    if (!worker.employers || worker.employers.length === 0) return "";
    return [...worker.employers.map((e) => e.name)]
      .sort((a, b) => a.localeCompare(b))[0]
      .toLowerCase();
  };

  const STORAGE_KEY = "worker_table_sort";

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { sortKey: savedKey, sortAsc: savedAsc } = JSON.parse(saved);
        if (ALLOWED_SORT_KEYS.includes(savedKey)) setSortKey(savedKey);
        if (typeof savedAsc === "boolean") setSortAsc(savedAsc);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sortKey, sortAsc }));
    } catch {
      addAlertMessage({
        severity: "error",
        text: "Failed to save table sort settings.",
      });
    }
  }, [sortKey, sortAsc, addAlertMessage]);

  useEffect(() => {
    localStorage.setItem(
      "expiryPreferences",
      JSON.stringify(expiryPreferences)
    );
  }, [expiryPreferences]);

  const { activeWorkers, dormantWorkers } = labor;
  const workerSet = type === "Active" ? activeWorkers : dormantWorkers;

  const handleSortKeyChange = (key: SortableKey) => {
    if (key === sortKey) {
      toggleSortOrder();
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const handleChangeExpiryPreferences = (newPrefs: ExpiryPreferences) => {
    setExpiryPreferences(newPrefs);
  };

  const refreshLabor = (workerId: string, craft: CraftingDiscipline) => {
    const updatedWorkers = activeWorkers.map((worker) => {
      if (worker.id !== workerId) return worker;

      const updatedCraftingSkills = {
        ...worker.craftingSkills,
        [craft]: {
          ...worker.craftingSkills[craft],
          lastPuzzleDate: new Date().toISOString(),
        },
      };

      return {
        ...worker,
        craftingSkills: updatedCraftingSkills,
      };
    });

    addAlertMessage({ severity: "success", text: "Labor refreshed." });
    setLabor((prev) => ({
      ...prev,
      activeWorkers: updatedWorkers,
    }));
  };

  const refreshBadgeExpiry = (workerId: string) => {
    const updatedWorkers = activeWorkers.map((worker) => {
      if (worker.id !== workerId) return worker;
      return {
        ...worker,
        badgePurchaseDate: isoUtcMidnightToday(), // <— normalized
      };
    });

    addAlertMessage({ severity: "success", text: "Badge expiry refreshed." });
    setLabor((prev) => ({ ...prev, activeWorkers: updatedWorkers }));
  };

  const deleteLaborAlt = (workerId: string) => {
    const updatedWorkers = workerSet.filter((worker) => worker.id !== workerId);
    const workerToBeDeleted = workerSet.find(
      (worker) => worker.id === workerId
    );

    addAlertMessage({
      severity: "success",
      text: `${workerToBeDeleted?.name} has been deleted.`,
    });
    setLabor((prev) => ({
      ...prev,
      [type === "Active" ? "activeWorkers" : "dormantWorkers"]: updatedWorkers,
    }));
  };

  const moveWorkerToDormancy = (workerId: string) => {
    const workerToMove = activeWorkers.find((worker) => worker.id === workerId);
    if (!workerToMove) return;

    const updatedActive = activeWorkers.filter(
      (worker) => worker.id !== workerId
    );
    const updatedDormant = [...dormantWorkers, workerToMove];

    addAlertMessage({
      severity: "success",
      text: `${workerToMove?.name} has been moved to dormancy.`,
    });
    setLabor((prev) => ({
      ...prev,
      activeWorkers: updatedActive,
      dormantWorkers: updatedDormant,
    }));
  };

  const moveWorkerToActive = (workerId: string) => {
    const workerToMove = dormantWorkers.find(
      (worker) => worker.id === workerId
    );
    if (!workerToMove) return;

    const updatedDormant = dormantWorkers.filter(
      (worker) => worker.id !== workerId
    );
    const updatedActive = [...activeWorkers, workerToMove];

    addAlertMessage({
      severity: "success",
      text: `${workerToMove?.name} has been made an active worker.`,
    });
    setLabor((prev) => ({
      ...prev,
      activeWorkers: updatedActive,
      dormantWorkers: updatedDormant,
    }));
  };

  const toggleSortOrder = () => setSortAsc((prev) => !prev);

  const getActiveEdgeTimestamp = (
    w: Worker,
    edge: "min" | "max"
  ): number | null => {
    const times = Object.values(w.craftingSkills || {})
      .filter(
        (s: { active: boolean; lastPuzzleDate?: string }) =>
          s?.active && s?.lastPuzzleDate
      )
      .map((s: { active: boolean; lastPuzzleDate?: string }) =>
        new Date(s.lastPuzzleDate!).getTime()
      )
      .filter((n: number) => Number.isFinite(n));

    if (times.length === 0) return null;
    return edge === "min" ? Math.min(...times) : Math.max(...times);
  };

  const sortedWorkers = workerSet
    .filter((worker) => worker.ocean === userSettings.ocean)
    .slice()
    .sort((a, b) => {
      if (sortKey === "craftingExpiry") {
        // Choose representative timestamp based on direction,
        // AND flip comparator with direction so toggle visibly reorders.
        const edge: "min" | "max" = sortAsc ? "min" : "max";
        const aEdge = getActiveEdgeTimestamp(a, edge);
        const bEdge = getActiveEdgeTimestamp(b, edge);

        // Push "no active skills" to the end for both directions
        if (aEdge === null && bEdge === null) return 0;
        if (aEdge === null) return 1;
        if (bEdge === null) return -1;

        // Flip comparison with sortAsc
        if (aEdge < bEdge) return sortAsc ? -1 : 1;
        if (aEdge > bEdge) return sortAsc ? 1 : -1;
        return 0;
      }

      // ... (unchanged for other keys)
      let aValue: string | number = 0;
      let bValue: string | number = 0;

      switch (sortKey) {
        case "badgeExpiry":
          aValue = new Date(a.badgePurchaseDate).getTime();
          bValue = new Date(b.badgePurchaseDate).getTime();
          break;
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "id":
          aValue = String(a.account).toLowerCase();
          bValue = String(b.account).toLowerCase();
          break;
        case "employers":
          aValue = getPrimaryEmployer(a);
          bValue = getPrimaryEmployer(b);
          break;
      }

      if (aValue < bValue) return sortAsc ? -1 : 1;
      if (aValue > bValue) return sortAsc ? 1 : -1;
      return 0;
    });

  const SortableHeader: React.FC<HeaderProps> = ({
    label,
    sortKeyFor,
    show = true,
  }) => {
    if (!show) return null;
    const isActive = sortKey === sortKeyFor;
    return (
      <TableCell
        sx={{
          position: "relative",
          backgroundColor: isActive ? "rgba(14, 116, 144, 0.08)" : undefined,
          fontWeight: isActive ? 600 : undefined,
          borderBottom: isActive ? "2px solid #0e7490" : undefined,
          transition: "background-color .15s",
        }}
        aria-sort={isActive ? (sortAsc ? "ascending" : "descending") : "none"}
      >
        {label}{" "}
        <IconButton
          size="small"
          onClick={() => handleSortKeyChange(sortKeyFor)}
          aria-label={`Sort by ${label}`}
          sx={{ opacity: isActive ? 1 : 0.4, marginLeft: 0.5 }}
        >
          {isActive ? (
            sortAsc ? (
              <ArrowUpwardIcon fontSize="small" />
            ) : (
              <ArrowDownwardIcon fontSize="small" />
            )
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                lineHeight: 0,
                "& svg": { fontSize: 12 },
              }}
            >
              <ArrowUpwardIcon fontSize="inherit" />
              <ArrowDownwardIcon fontSize="inherit" />
            </Box>
          )}
        </IconButton>
      </TableCell>
    );
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{ maxHeight: "70vh", overflowY: "auto", pt: 2 }}
      >
        <Table
          sx={{ minWidth: 650 }}
          size="small"
          aria-label="dense worker table"
        >
          <TableHead>
            <TableRow>
              <SortableHeader label="ID" sortKeyFor="id" />
              <SortableHeader label="Name" sortKeyFor="name" />
              <SortableHeader
                label="Crafting Expiry"
                sortKeyFor="craftingExpiry"
              />
              <SortableHeader label="Badge Expiry" sortKeyFor="badgeExpiry" />
              {type === "Active" && (
                <SortableHeader label="Employers" sortKeyFor="employers" />
              )}
              <TableCell align="right">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <Typography>Actions</Typography>
                  <IconButton
                    aria-label="notifications"
                    size="small"
                    onClick={() => setOpenExpiryModal(true)}
                    sx={{ ml: 1 }}
                  >
                    <NotificationsIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedWorkers.map((worker) => (
              <TableRow
                key={worker.id}
                sx={{ borderBottom: "2px solid", borderColor: "divider" }}
              >
                <TableCell
                  sx={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {worker.account}
                </TableCell>
                <TableCell
                  sx={{
                    maxWidth: 200,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={worker.name}
                >
                  {worker.name}
                </TableCell>
                <LaborExpiryCell
                  refreshLabor={refreshLabor}
                  type={type}
                  worker={worker}
                  expiryPreferences={expiryPreferences}
                />
                <BadgeExpiryCell
                  refreshBadgeExpiry={refreshBadgeExpiry}
                  type={type}
                  worker={worker}
                  expiryPreferences={expiryPreferences}
                />
                {type === "Active" && (
                  <TableCell
                    sx={{
                      maxWidth: 260,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={worker.employers
                      ?.map((e) => e.name)
                      .sort((a, b) => a.localeCompare(b))
                      .join(", ")}
                  >
                    {worker.employers && worker.employers.length > 0
                      ? worker.employers
                          .map((e) => e.name)
                          .sort((a, b) => a.localeCompare(b))
                          .join(", ")
                      : "—"}
                  </TableCell>
                )}
                <TableActionButtonsCell
                  type={type}
                  worker={worker}
                  moveWorkerToActive={moveWorkerToActive}
                  moveWorkerToDormancy={moveWorkerToDormancy}
                  setDeleteWorkerId={setDeleteWorkerId}
                  setEditingWorker={setEditingWorker}
                  setOpenConfirmDialog={setOpenConfirmDialog}
                />
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {editingWorker && (
          <WorkerForm
            initialData={editingWorker}
            onClose={() => setEditingWorker(null)}
            initialOcean={userSettings.ocean}
          />
        )}
        <ConfirmDialog
          open={openConfirmDialog}
          onClose={() => setOpenConfirmDialog(false)}
          onConfirm={() => {
            if (deleteWorkerId) {
              deleteLaborAlt(deleteWorkerId);
              setDeleteWorkerId(null);
            }
            setOpenConfirmDialog(false);
          }}
          type="delete"
          title="Delete Worker?"
          message="Are you sure you want to permanently delete this worker? It's often better to mark them as Dormant instead."
          confirmText="Yes, Delete"
        />
      </TableContainer>
      {openExpiryModal && (
        <ExpiryPreferencesModal
          expiryPreferences={expiryPreferences}
          handleChangeExpiryPreferences={handleChangeExpiryPreferences}
          handleClose={() => setOpenExpiryModal(false)}
          open={openExpiryModal}
        />
      )}
    </>
  );
};

export default WorkerTable;
