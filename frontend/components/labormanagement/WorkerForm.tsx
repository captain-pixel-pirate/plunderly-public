import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import {
  Modal,
  Box,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Tooltip,
  Grid,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import {
  Worker,
  RankLevel,
  LaborOutput,
  RANK_LEVELS,
  CraftingDiscipline,
} from "@interfaces";
import {
  useNotificationContext,
  useLoadingContext,
  useGlobalContext,
} from "@context";
import { formatImagePath, toUtcMidnight } from "@utils/helpers";
import api from "@utils/api";

const BADGE_WINDOW_DAYS = 30;
const MS_PER_DAY = 86_400_000;

function startOfTodayUTC(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 550,
  maxHeight: "80vh",
  overflowY: "auto" as const,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 3,
  borderRadius: 2,
};

const buildEmptyWorker = (
  initialOcean: "Emerald" | "Meridian" | "Cerulean"
): Worker => ({
  id: uuidv4(),
  name: "",
  account: "",
  ocean: initialOcean,
  badgeType: initialOcean === "Cerulean" ? "Subscription" : "Deluxe",
  badgePurchaseDate: new Date().toISOString(),
  employers: [],
  craftingSkills: {
    shipyard: {
      rank: "Able",
      output: "Basic",
      lastPuzzleDate: new Date().toISOString(),
      active: false,
    },
    apothecary: {
      rank: "Able",
      output: "Basic",
      lastPuzzleDate: new Date().toISOString(),
      active: false,
    },
    ironMonger: {
      rank: "Able",
      output: "Basic",
      lastPuzzleDate: new Date().toISOString(),
      active: false,
    },
    distillery: {
      rank: "Able",
      output: "Basic",
      lastPuzzleDate: new Date().toISOString(),
      active: false,
    },
    weavery: {
      rank: "Able",
      output: "Basic",
      lastPuzzleDate: new Date().toISOString(),
      active: false,
    },
  },
  lastUpdated: new Date().toISOString(),
  primaryCraftingSkill: "shipyard",
});

interface WorkerModalProps {
  initialData?: Worker;
  onClose: () => void;
  initialOcean: "Emerald" | "Meridian" | "Cerulean";
}

export default function WorkerModal({
  initialData,
  initialOcean,
  onClose,
}: WorkerModalProps) {
  const [worker, setWorker] = useState<Worker>(
    () => initialData ?? buildEmptyWorker(initialOcean)
  );
  const { labor, setLabor } = useGlobalContext();
  const employers = labor.employers;
  const { addAlertMessage } = useNotificationContext();
  const { togglePageLoading } = useLoadingContext();

  useEffect(() => {
    setWorker(initialData ?? buildEmptyWorker(initialOcean));
  }, [initialData, initialOcean]);

  const handleOceanChange = (value: Worker["ocean"]) => {
    setWorker((w) => {
      if (value === "Cerulean") {
        return { ...w, ocean: value, badgeType: "Subscription" };
      }
      return {
        ...w,
        ocean: value,
        badgeType: w.badgeType === "Subscription" ? "Standard" : w.badgeType,
      };
    });
  };

  const handleChange = <K extends keyof Worker>(key: K, value: Worker[K]) => {
    setWorker((w) => ({ ...w, [key]: value }));
  };

  const handleUserTextChange = (key: string, value: string) => {
    if (key === "name") {
      let sanitized = value.replace(/[^a-zA-Z-]/g, "");

      if (sanitized.startsWith("-")) {
        sanitized = sanitized.slice(1);
      }
      if (sanitized.charAt(1) === "-") {
        sanitized = sanitized.charAt(0) + sanitized.slice(2);
      }

      setWorker((prev) => ({ ...prev, [key]: sanitized }));
    }
  };

  const handleCustomIdChange = (key: string, value: string) => {
    const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "");
    setWorker((prev) => ({ ...prev, [key]: sanitizedValue }));
  };

  const getOutputFromRank = (rank: RankLevel): LaborOutput => {
    const skilledRanks: RankLevel[] = ["Distinguished", "Respected", "Master"];
    const expertRanks: RankLevel[] = [
      "Renowned",
      "Grand-Master",
      "Legendary",
      "Ultimate",
    ];
    if (skilledRanks.includes(rank)) return "Skilled";
    if (expertRanks.includes(rank)) return "Expert";
    return "Basic";
  };

  const handleSkillChange = <
    SK extends keyof Worker["craftingSkills"],
    FK extends keyof Worker["craftingSkills"][SK]
  >(
    skill: SK,
    field: FK,
    value: Worker["craftingSkills"][SK][FK]
  ) => {
    setWorker((w) => {
      const current: Worker["craftingSkills"][SK] = w.craftingSkills[skill];
      const updatedSkill = {
        ...current,
        [field]: value,
        ...(field === "rank" && {
          output: getOutputFromRank(value as RankLevel),
        }),
      } as Worker["craftingSkills"][SK];
      return {
        ...w,
        craftingSkills: { ...w.craftingSkills, [skill]: updatedSkill },
      };
    });
  };

  const setSkillActive = (
    skill: keyof Worker["craftingSkills"],
    active: boolean
  ) => {
    setWorker((w) => {
      const updated = {
        ...w.craftingSkills[skill],
        active,
      } as Worker["craftingSkills"][typeof skill];

      return {
        ...w,
        craftingSkills: { ...w.craftingSkills, [skill]: updated },
      };
    });
  };

  const handleSave = () => {
    const name = worker.name;

    if (name.length < 2) {
      addAlertMessage({
        severity: "error",
        text: "Name must be at least 2 characters",
      });
      return;
    }

    if (name.endsWith("-")) {
      addAlertMessage({
        severity: "error",
        text: "Name cannot end with a dash (-)",
      });
      return;
    }

    const dashIndex = name.indexOf("-");
    if (dashIndex !== -1) {
      const suffix = name.substring(dashIndex + 1).toLowerCase();
      if (suffix !== "east" && suffix !== "west") {
        addAlertMessage({
          severity: "error",
          text: `Name suffix after dash must be "east" or "west"`,
        });
        return;
      }
    }

    const existingIndex = labor.activeWorkers.findIndex(
      (w) => w.id === worker.id
    );
    let updatedLaborAlts: Worker[];

    if (existingIndex !== -1) {
      updatedLaborAlts = [...labor.activeWorkers];
      updatedLaborAlts[existingIndex] = worker;
    } else {
      updatedLaborAlts = [...labor.activeWorkers, worker];
    }

    addAlertMessage({
      severity: "success",
      text: `${
        existingIndex !== -1
          ? "Successfully edited worker."
          : "Successfully created new worker."
      }`,
    });

    setLabor({ ...labor, activeWorkers: updatedLaborAlts });
    onClose();
  };

  const fetchCraftingSkills = async () => {
    if (worker.name.length < 2) {
      addAlertMessage({
        severity: "error",
        text: "Must provide pirate name to fetch crafting skills.",
      });
      return;
    }

    if (worker.name.endsWith("-")) {
      addAlertMessage({
        severity: "error",
        text: "Name cannot end with a dash (-)",
      });
      return;
    }

    const dashIndex = worker.name.indexOf("-");
    if (dashIndex !== -1) {
      const suffix = worker.name.substring(dashIndex + 1).toLowerCase();
      if (suffix !== "east" && suffix !== "west") {
        addAlertMessage({
          severity: "error",
          text: `Name suffix after dash must be "east" or "west"`,
        });
        return;
      }
    }

    try {
      togglePageLoading();
      const res = await api.get(
        `/pirateCraftingSkills?pirateName=${worker.name}&ocean=${worker.ocean}`
      );
      const craftingData: {
        puzzle: string;
        experience: string;
        rank: RankLevel;
      }[] = res.data.puzzles;

      const updatedSkills = {
        ...worker.craftingSkills,
      } as Worker["craftingSkills"];

      for (const entry of craftingData) {
        const key = entry.puzzle as keyof Worker["craftingSkills"];
        if (key in updatedSkills) {
          const cur = updatedSkills[key];
          updatedSkills[key] = {
            ...cur,
            rank: entry.rank,
            output: getOutputFromRank(entry.rank),
          } as typeof cur;
        }
      }

      setWorker((prev) => ({
        ...prev,
        craftingSkills: updatedSkills,
        lastUpdated: new Date().toISOString(),
      }));

      addAlertMessage({
        severity: "success",
        text: "Crafting skills updated successfully.",
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Error: ", err.response?.data.error);
        addAlertMessage({
          severity: "error",
          text: err.response?.data?.error,
        });
      } else {
        console.error("Failed to fetch crafting skills", err);
        addAlertMessage({
          severity: "error",
          text: "Failed to fetch crafting skills.",
        });
      }
    }
    togglePageLoading();
  };

  const entries = Object.entries(worker.craftingSkills) as [
    CraftingDiscipline,
    Worker["craftingSkills"][CraftingDiscipline]
  ][];

  const activeEntries = entries.filter(([, s]) => s.active);
  const inactiveEntries = entries.filter(([, s]) => !s.active);

  const remainingBadgeDays = useMemo(() => {
    const start = toUtcMidnight(new Date(worker.badgePurchaseDate));
    const today = toUtcMidnight(new Date());
    const elapsedDays = Math.floor(
      (today.getTime() - start.getTime()) / MS_PER_DAY
    );
    const BADGE_WINDOW_DAYS = 30;
    const remaining = BADGE_WINDOW_DAYS - Math.max(0, elapsedDays);
    return Math.max(0, Math.min(BADGE_WINDOW_DAYS, remaining));
  }, [worker.badgePurchaseDate]);

  const handleBadgeRemainingChange = (newRemainingDays: number) => {
    const todayUTC = startOfTodayUTC();
    const elapsedDays = BADGE_WINDOW_DAYS - newRemainingDays;
    const newPurchaseUTC = new Date(
      todayUTC.getTime() - elapsedDays * MS_PER_DAY
    ).toISOString();
    handleChange("badgePurchaseDate", newPurchaseUTC);
  };

  return (
    <Modal open={true} onClose={onClose}>
      <Box sx={style}>
        <Typography
          textAlign={"center"}
          variant="h6"
          sx={{ fontWeight: 600 }}
          gutterBottom
        >
          Worker Form
        </Typography>

        <Stack spacing={1.5} mb={2}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Pirate name"
              value={worker.name}
              onChange={(e) => handleUserTextChange("name", e.target.value)}
              fullWidth
              required
              size="small"
            />
            <TextField
              label="Custom ID (optional)"
              value={worker.account}
              onChange={(e) => handleCustomIdChange("account", e.target.value)}
              fullWidth
              size="small"
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Ocean</InputLabel>
              <Select
                value={worker.ocean}
                label="Ocean"
                onChange={(e) =>
                  handleOceanChange(e.target.value as Worker["ocean"])
                }
              >
                {["Emerald", "Meridian", "Cerulean"].map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl
              fullWidth
              size="small"
              disabled={worker.ocean === "Cerulean"}
            >
              <InputLabel>Badge Type</InputLabel>
              <Select
                value={worker.badgeType}
                label="Badge Type"
                onChange={(e) =>
                  handleChange(
                    "badgeType",
                    e.target.value as "Standard" | "Deluxe" | "Subscription"
                  )
                }
              >
                {(worker.ocean === "Cerulean"
                  ? ["Subscription"]
                  : ["Standard", "Deluxe"]
                ).map((b) => (
                  <MenuItem key={b} value={b}>
                    {b}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Badge Expires In</InputLabel>
              <Select
                value={remainingBadgeDays}
                label="Badge Expires In"
                onChange={(e) =>
                  handleBadgeRemainingChange(Number(e.target.value))
                }
              >
                {Array.from(
                  { length: BADGE_WINDOW_DAYS + 1 },
                  (_, i) => BADGE_WINDOW_DAYS - i
                ).map((d) => (
                  <MenuItem key={d} value={d}>
                    {d} {d === 1 ? "day" : "days"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Stack>

        <Box sx={{ py: 0.5, my: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={1}
          >
            <Typography sx={{ fontWeight: 600 }}>Crafting Skills</Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={fetchCraftingSkills}
            >
              Fetch Crafting Skills
            </Button>
            <Tooltip
              title={
                <>
                  This request is made by <strong>our server</strong>. To ensure
                  fair usage, hourly rate limits are enforced on our end.
                </>
              }
              placement="right"
              arrow
            >
              <InfoOutlinedIcon
                sx={{ cursor: "pointer", color: "text.primary" }}
              />
            </Tooltip>
          </Stack>
        </Box>

        {/* Inactive skills: show "+" buttons to activate */}
        {inactiveEntries.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {inactiveEntries.map(([key]) => (
                <Chip
                  key={key}
                  icon={<AddIcon />}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  onClick={() => setSkillActive(key, true)}
                  variant="outlined"
                  sx={{ mr: 0.5, mb: 0.5, cursor: "pointer" }}
                />
              ))}
            </Stack>
            <Divider sx={{ mt: 1 }} />
          </Box>
        )}

        {/* Active skills only */}
        <Grid container spacing={1} sx={{ pb: 0.5 }}>
          {activeEntries.map(([skillKey, skill]) => (
            <Grid item xs={12} sm={6} key={skillKey}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => setSkillActive(skillKey, false)}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Image
                  src={`/images/icons/${formatImagePath(skillKey)}.png`}
                  width={18}
                  height={18}
                  alt={skillKey}
                />
                <Typography
                  variant="body2"
                  sx={{
                    textTransform: "capitalize",
                  }}
                >
                  {skillKey}
                </Typography>
              </Box>
              <Stack spacing={1}>
                <FormControl fullWidth size="small">
                  <InputLabel>Rank</InputLabel>
                  <Select
                    value={skill.rank}
                    label="Rank"
                    onChange={(e) =>
                      handleSkillChange(
                        skillKey as keyof Worker["craftingSkills"],
                        "rank",
                        e.target.value as RankLevel
                      )
                    }
                  >
                    {RANK_LEVELS.map((rank) => (
                      <MenuItem key={rank} value={rank}>
                        {rank}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Last Puzzle Date"
                  type="datetime-local"
                  value={skill.lastPuzzleDate.slice(0, 16)}
                  onChange={(e) =>
                    handleSkillChange(
                      skillKey as keyof Worker["craftingSkills"],
                      "lastPuzzleDate",
                      new Date(e.target.value).toISOString()
                    )
                  }
                  size="small"
                  fullWidth
                />
              </Stack>
            </Grid>
          ))}
        </Grid>

        {employers.length ? (
          <>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, pt: 2 }}>
              Shoppe Jobs
            </Typography>

            <FormGroup>
              {employers.map((employer) => {
                const isSelected = worker.employers.some(
                  (e) => e.id === employer.id
                );
                const isDisabled = !isSelected && worker.employers.length >= 3;

                return (
                  <FormControlLabel
                    key={employer.id}
                    control={
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...worker.employers, employer]
                            : worker.employers.filter(
                                (e) => e.id !== employer.id
                              );
                          setWorker((prev) => ({
                            ...prev,
                            employers: updated,
                          }));
                        }}
                        sx={{ py: 0 }}
                      />
                    }
                    label={`${employer.name} (${employer.island}, ${employer.shoppeType})`}
                  />
                );
              })}
            </FormGroup>
          </>
        ) : null}

        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
          <Button onClick={onClose} size="small">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} size="small">
            Save
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
