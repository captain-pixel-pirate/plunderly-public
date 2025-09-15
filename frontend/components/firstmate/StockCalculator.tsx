"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

import {
  Box,
  Stack,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  Paper,
  Chip,
  Tooltip,
} from "@mui/material";

import { useGlobalContext } from "@context";
import { Vessel } from "@interfaces/vessel";
import { formatImagePath } from "@utils/helpers";

const AVERAGE_EVADE_BATTLE_DURATION_MIN = 8;
const AVERAGE_BASH_BATTLE_DURATION_MIN = 10;
const AVERAGE_MAXING_BATTLE_DURATION_MIN = 14;
const AVERAGE_EVADE_BATTLE_DURATION_S = AVERAGE_EVADE_BATTLE_DURATION_MIN * 60;
const AVERAGE_BASH_BATTLE_DURATION_S = AVERAGE_BASH_BATTLE_DURATION_MIN * 60;
const AVERAGE_MAXING_BATTLE_DURATION_S =
  AVERAGE_MAXING_BATTLE_DURATION_MIN * 60;

const AVERAGE_SWILL_PER_PIRATE_PER_S = 0.15 / 60;
const AVERAGE_GROG_PER_PIRATE_PER_S = 0.1 / 60;
const AVERAGE_FINE_RUM_PER_PIRATE_PER_S = 0.05 / 60;
const AVERAGE_SWILL_PER_PIRATE_PER_MIN = AVERAGE_SWILL_PER_PIRATE_PER_S * 60; // 0.15
const AVERAGE_GROG_PER_PIRATE_PER_MIN = AVERAGE_GROG_PER_PIRATE_PER_S * 60; // 0.10
const AVERAGE_FINE_PER_PIRATE_PER_MIN = AVERAGE_FINE_RUM_PER_PIRATE_PER_S * 60; // 0.05

const RUM_RATE_PER_PIRATE_PER_S: Record<VoyageConfig["rumGrade"], number> = {
  swill: AVERAGE_SWILL_PER_PIRATE_PER_S,
  grog: AVERAGE_GROG_PER_PIRATE_PER_S,
  "fine rum": AVERAGE_FINE_RUM_PER_PIRATE_PER_S,
};

const BATTLE_DURATION_S: Record<VoyageConfig["type"], number> = {
  evade: AVERAGE_EVADE_BATTLE_DURATION_S,
  bash: AVERAGE_BASH_BATTLE_DURATION_S,
  maxing: AVERAGE_MAXING_BATTLE_DURATION_S,
};

const AVERAGE_RUM_SPICE_CONSUMED_PER_PIRATE_PER_S = 0.07 / 60;
const AVERAGE_RUM_SPICE_PER_PIRATE_PER_MIN =
  AVERAGE_RUM_SPICE_CONSUMED_PER_PIRATE_PER_S * 60; // 0.07
const MINIMUM_RUM_SPICE_PER_PIRATE_ON_HOLD = 5;

const AWAIT_SAIL_AT_LP_BUFFER_S = 5;

const NAVER_STYLE_MULT: Record<VoyageConfig["naverStyle"], number> = {
  conservative: 1.25,
  moderate: 1.45,
  aggressive: 1.65,
};

const WASTED_TO_MAX_MULT: Record<VoyageConfig["type"], number> = {
  evade: 0,
  bash: 0.75,
  maxing: 1.5,
};

interface VoyageConfig {
  type: "evade" | "bash" | "maxing";
  swabbiesToHire: number;
  mercenariesToHire: number;
  naverStyle: "conservative" | "moderate" | "aggressive";
  rumGrade: "swill" | "grog" | "fine rum";
  battles: number;
  leaguePoints: number;
  stockBufferPercentage: number;
  playersOnBoard: number;
}

interface Props {
  vesselSelection: Vessel;
  open?: boolean;
  onClose?: () => void;
  triggerLabel?: string;
}

export default function StockCalculatorPopup({
  vesselSelection,
  open: controlledOpen,
  onClose,
  triggerLabel = "Open Stock Calculator",
}: Props) {
  const { vessels } = useGlobalContext();
  const [varsOpen, setVarsOpen] = useState(false);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? (controlledOpen as boolean) : uncontrolledOpen;

  const handleOpen = () => {
    if (isControlled) return;
    setUncontrolledOpen(true);
  };
  const handleClose = () => {
    onClose?.();
    if (!isControlled) setUncontrolledOpen(false);
  };

  const [voyageConfig, setVoyageConfig] = useState<VoyageConfig>({
    type: "bash",
    swabbiesToHire: 100,
    mercenariesToHire: 100,
    naverStyle: "moderate",
    rumGrade: "fine rum",
    battles: 3,
    leaguePoints: 9,
    stockBufferPercentage: 10,
    playersOnBoard: 1,
  });

  const setBattlesAndSyncLP = (raw: number) => {
    const battles = clamp(Math.round(raw), 0, 9999);
    const leaguePoints = clamp(battles * 3, 0, 100000);
    setVoyageConfig((s) => ({ ...s, battles, leaguePoints }));
  };

  const clamp = (v: number, min: number, max: number) =>
    Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : min;

  const setField = <K extends keyof VoyageConfig>(
    key: K,
    value: VoyageConfig[K]
  ) => setVoyageConfig((s) => ({ ...s, [key]: value }));

  const selectedVesselIndex = useMemo(
    () => vessels.findIndex((v) => v.id === vesselSelection.id),
    [vessels, vesselSelection.id]
  );

  const upcomingSpawnOptions = useMemo(
    () => vessels.slice(selectedVesselIndex + 1, selectedVesselIndex + 4),
    [vessels, selectedVesselIndex]
  );

  const avgCannonBallsToMax = useMemo(() => {
    if (upcomingSpawnOptions.length === 0) {
      return vesselSelection.maxPillageDamage[vesselSelection.cannonSize];
    }
    const sum = upcomingSpawnOptions.reduce((acc, spawn) => {
      return acc + spawn.maxPillageDamage[vesselSelection.cannonSize];
    }, 0);
    return sum / upcomingSpawnOptions.length;
  }, [upcomingSpawnOptions, vesselSelection]);

  const estimateHiredCrew = (
    maxSwabbies: number,
    swabbiesPct: number,
    mercsPct: number
  ) => {
    const fillPct =
      Math.max(clamp(swabbiesPct, 0, 100), clamp(mercsPct, 0, 100)) / 100;
    return Math.round(maxSwabbies * fillPct);
  };

  const getCrewCounts = () => {
    const hired = estimateHiredCrew(
      vesselSelection.maxSwabbies,
      voyageConfig.swabbiesToHire,
      voyageConfig.mercenariesToHire
    );
    const mercsHired = Math.round(
      vesselSelection.maxSwabbies *
        (clamp(voyageConfig.mercenariesToHire, 0, 100) / 100)
    );
    const piratesOnBoard = clamp(
      (voyageConfig.playersOnBoard ?? 0) + Math.max(0, hired),
      0,
      100000
    );
    return { hired, mercsHired, piratesOnBoard };
  };

  const computeTotalCannonBallsNeeded = () => {
    const battles = clamp(voyageConfig.battles ?? 0, 0, 9999);
    if (battles === 0) return 0;

    const styleMult = NAVER_STYLE_MULT[voyageConfig.naverStyle];
    const wastedToMaxMult = WASTED_TO_MAX_MULT[voyageConfig.type];

    const basePerBattle =
      Math.max(0, avgCannonBallsToMax) * wastedToMaxMult * styleMult;

    const bufferMult =
      1 + clamp(voyageConfig.stockBufferPercentage ?? 0, 0, 50) / 100;

    return Math.ceil(basePerBattle * battles * bufferMult);
  };

  const computeTotalRumNeeded = () => {
    const lpTime =
      clamp(voyageConfig.leaguePoints ?? 0, 0, 100000) *
        vesselSelection.secondsPerLPAtMaxSpeed +
      clamp(voyageConfig.leaguePoints ?? 0, 0, 100000) *
        AWAIT_SAIL_AT_LP_BUFFER_S;

    const battleTime =
      clamp(voyageConfig.battles ?? 0, 0, 100000) *
      BATTLE_DURATION_S[voyageConfig.type];

    const totalSeconds = lpTime + battleTime;

    const { piratesOnBoard } = getCrewCounts();
    const ratePerPirate = RUM_RATE_PER_PIRATE_PER_S[voyageConfig.rumGrade];

    const totalRum = totalSeconds * ratePerPirate * piratesOnBoard;
    const bufferMult =
      1 + clamp(voyageConfig.stockBufferPercentage ?? 0, 0, 50) / 100;

    return Math.max(0, Math.ceil(totalRum * bufferMult));
  };

  const computeRumSpiceBreakdown = () => {
    const lpTime =
      clamp(voyageConfig.leaguePoints ?? 0, 0, 100000) *
        vesselSelection.secondsPerLPAtMaxSpeed +
      clamp(voyageConfig.leaguePoints ?? 0, 0, 100000) *
        AWAIT_SAIL_AT_LP_BUFFER_S;

    const battleTime =
      clamp(voyageConfig.battles ?? 0, 0, 100000) *
      BATTLE_DURATION_S[voyageConfig.type];

    const totalSeconds = lpTime + battleTime;

    const { mercsHired } = getCrewCounts();

    const rawConsumption =
      totalSeconds *
      AVERAGE_RUM_SPICE_CONSUMED_PER_PIRATE_PER_S *
      Math.max(0, mercsHired);

    const bufferMult =
      1 + clamp(voyageConfig.stockBufferPercentage ?? 0, 0, 50) / 100;
    const consumptionWithBuffer = rawConsumption * bufferMult;

    const baseline =
      Math.max(0, mercsHired) * MINIMUM_RUM_SPICE_PER_PIRATE_ON_HOLD;

    const consumed = Math.ceil(Math.max(0, consumptionWithBuffer));
    const total = consumed + baseline;

    return { consumed, baseline, total, mercsHired };
  };

  const totals = useMemo(
    () => ({
      rum: computeTotalRumNeeded(),
      balls: computeTotalCannonBallsNeeded(),
      spice: computeRumSpiceBreakdown(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [voyageConfig, avgCannonBallsToMax, vesselSelection]
  );

  const bufferMenuItems = Array.from({ length: 11 }, (_, i) => i * 5);

  const computeTotalVoyageSeconds = () => {
    const lp = clamp(voyageConfig.leaguePoints ?? 0, 0, 100000);
    const battles = clamp(voyageConfig.battles ?? 0, 0, 100000);

    const lpTime =
      lp * vesselSelection.secondsPerLPAtMaxSpeed +
      lp * AWAIT_SAIL_AT_LP_BUFFER_S;

    const battleTime = battles * BATTLE_DURATION_S[voyageConfig.type];

    return lpTime + battleTime;
  };

  const formatDuration = (totalSeconds: number) => {
    const s = Math.max(0, Math.round(totalSeconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;

    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  };

  return (
    <>
      {!isControlled && (
        <Button variant="outlined" onClick={handleOpen}>
          {triggerLabel}
        </Button>
      )}

      <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              fontWeight={600}
              sx={{ display: "flex", gap: 1, alignItems: "center" }}
            >
              <Image
                src={`/images/goods/${formatImagePath(
                  vesselSelection.name
                )}.png`}
                alt={voyageConfig.rumGrade}
                width={35}
                height={35}
              />
              <Typography variant="caption">{vesselSelection.name}</Typography>
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "error.main",
              fontSize: ".8rem",
              textAlign: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "error.main", fontSize: ".8rem", p: 0 }}
            >
              ⚠ Variables not fully calibrated — please send feedback.
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setVarsOpen(true)}
              sx={{ textTransform: "none", p: 0.5, minWidth: 0 }}
              color="error"
            >
              View
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 1.5 }}>
          {/* FORM AREA */}
          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <Stack spacing={1.25}>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <FormControl size="small" fullWidth>
                      <InputLabel id="type-label">Voyage Type</InputLabel>
                      <Select
                        labelId="type-label"
                        label="Voyage Type"
                        value={voyageConfig.type}
                        onChange={(e) =>
                          setField(
                            "type",
                            e.target.value as VoyageConfig["type"]
                          )
                        }
                      >
                        <MenuItem value="evade">Evade</MenuItem>
                        <MenuItem value="bash">Bash</MenuItem>
                        <MenuItem value="maxing">Maxing</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl size="small" fullWidth>
                      <InputLabel id="style-label">Naver Style</InputLabel>
                      <Select
                        labelId="style-label"
                        label="Naver Style"
                        value={voyageConfig.naverStyle}
                        onChange={(e) =>
                          setField(
                            "naverStyle",
                            e.target.value as VoyageConfig["naverStyle"]
                          )
                        }
                      >
                        <MenuItem value="conservative">Conservative</MenuItem>
                        <MenuItem value="moderate">Moderate</MenuItem>
                        <MenuItem value="aggressive">Aggressive</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl size="small" fullWidth>
                      <InputLabel id="rum-label">Rum Grade</InputLabel>
                      <Select
                        labelId="rum-label"
                        label="Rum Grade"
                        value={voyageConfig.rumGrade}
                        onChange={(e) =>
                          setField(
                            "rumGrade",
                            e.target.value as VoyageConfig["rumGrade"]
                          )
                        }
                      >
                        <MenuItem value="swill">Swill</MenuItem>
                        <MenuItem value="grog">Grog</MenuItem>
                        <MenuItem value="fine rum">Fine Rum</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      size="small"
                      type="number"
                      label="Players On Board"
                      value={voyageConfig.playersOnBoard}
                      onChange={(e) =>
                        setField(
                          "playersOnBoard",
                          clamp(Number(e.target.value), 0, 9999)
                        )
                      }
                      fullWidth
                      inputProps={{ min: 0, step: 1 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      size="small"
                      type="number"
                      label="Battles"
                      value={voyageConfig.battles}
                      onChange={(e) => {
                        const n = clamp(
                          parseInt(e.target.value || "0", 10),
                          0,
                          9999
                        );
                        setBattlesAndSyncLP(n);
                      }}
                      fullWidth
                      inputProps={{ min: 0, step: 1 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      size="small"
                      type="number"
                      label="League Points"
                      value={voyageConfig.leaguePoints}
                      onChange={(e) =>
                        setField(
                          "leaguePoints",
                          clamp(parseInt(e.target.value || "0", 10), 0, 100000)
                        )
                      }
                      fullWidth
                      inputProps={{ min: 0, step: 1 }}
                    />
                  </Grid>

                  {/* Stock buffer as dropdown (5% steps, up to 50%) */}
                  <Grid item xs={12}>
                    <FormControl size="small" fullWidth>
                      <InputLabel id="buffer-label">Stock Buffer</InputLabel>
                      <Select
                        labelId="buffer-label"
                        label="Stock Buffer"
                        value={voyageConfig.stockBufferPercentage}
                        onChange={(e) =>
                          setField(
                            "stockBufferPercentage",
                            Number(e.target.value)
                          )
                        }
                      >
                        {bufferMenuItems.map((pct) => (
                          <MenuItem key={pct} value={pct}>
                            {pct}%
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* % Sliders */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Crew Hiring
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                    <FormControl size="small" fullWidth>
                      <Typography variant="body2" sx={{ mb: 0.25 }}>
                        Swabbies to Hire: <b>{voyageConfig.swabbiesToHire}%</b>
                      </Typography>
                      <Slider
                        size="small"
                        value={voyageConfig.swabbiesToHire}
                        onChange={(_, v) =>
                          setField("swabbiesToHire", v as number)
                        }
                        step={5}
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                      />
                    </FormControl>

                    <FormControl size="small" fullWidth>
                      <Typography variant="body2" sx={{ mb: 0.25 }}>
                        Mercenaries to Hire:{" "}
                        <b>{voyageConfig.mercenariesToHire}%</b>
                      </Typography>
                      <Slider
                        size="small"
                        value={voyageConfig.mercenariesToHire}
                        onChange={(_, v) =>
                          setField("mercenariesToHire", v as number)
                        }
                        step={5}
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                      />
                    </FormControl>
                  </Stack>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          {/* SUMMARY — ALWAYS AT THE BOTTOM */}
          <Paper
            variant="outlined"
            sx={{
              p: 1.75,
              mt: 2,
              borderRadius: 2,
            }}
          >
            <Stack spacing={1.25}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="overline" sx={{ letterSpacing: 0.6 }}>
                  Summary
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  <Chip size="small" label={`${vesselSelection.name}`} />
                  <Chip
                    size="small"
                    label={`${
                      voyageConfig.type.charAt(0).toUpperCase() +
                      voyageConfig.type.slice(1)
                    }`}
                  />
                  <Tooltip
                    title={`LP travel + buffer + battles`}
                    placement="top"
                    arrow
                  >
                    <Chip
                      size="small"
                      label={`Est. Time: ${formatDuration(
                        computeTotalVoyageSeconds()
                      )}`}
                    />
                  </Tooltip>
                </Stack>
              </Stack>

              {/* Top-line totals */}
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 1, borderRadius: 1.5 }}>
                    <Stack spacing={0.75}>
                      <Typography variant="caption" color="text.secondary">
                        Total {voyageConfig.rumGrade} (with buffer)
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Image
                          src={`/images/goods/${formatImagePath(
                            voyageConfig.rumGrade
                          )}.png`}
                          alt={voyageConfig.rumGrade}
                          width={20}
                          height={15}
                          style={{ marginRight: "4px" }}
                        />
                        {totals.rum}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 1, borderRadius: 1.5 }}>
                    <Stack spacing={0.75}>
                      <Typography variant="caption" color="text.secondary">
                        Cannonballs (with buffer)
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Image
                          src={`/images/goods/${formatImagePath(
                            vesselSelection.cannonSize === "large"
                              ? "large cannon balls"
                              : vesselSelection.cannonSize === "medium"
                              ? "medium cannon balls"
                              : "small cannon balls"
                          )}.png`}
                          alt={voyageConfig.rumGrade}
                          width={20}
                          height={15}
                          style={{ marginRight: "4px" }}
                        />
                        {totals.balls}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>

                {/* Rum Spice row, centered */}
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="center">
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        minWidth: 280,
                        maxWidth: 400,
                      }}
                    >
                      <Stack spacing={0.75}>
                        <Tooltip
                          title={`Consumed is what you burn during the trip. Baseline is the hold minimum to keep ${totals.spice.mercsHired} mercs on board (${MINIMUM_RUM_SPICE_PER_PIRATE_ON_HOLD} each).`}
                          placement="top"
                          arrow
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Rum Spice (consumed <b>{totals.spice.consumed}</b>{" "}
                              + baseline <b>{totals.spice.baseline}</b>)
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Image
                                src={`/images/goods/${formatImagePath(
                                  "rum spice"
                                )}.png`}
                                alt="rum spice"
                                width={20}
                                height={15}
                                style={{ marginRight: "4px" }}
                              />
                              {totals.spice.total}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </Stack>
                    </Paper>
                  </Box>
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ px: 2, py: 1 }}>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={varsOpen}
        onClose={() => setVarsOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Calibration Variables</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {/* Battle durations */}
            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
              <Typography variant="subtitle2" gutterBottom>
                Average battle duration (minutes)
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Typography variant="body2">Evade</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2" fontWeight={600}>
                    {AVERAGE_EVADE_BATTLE_DURATION_MIN}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2">Bash</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2" fontWeight={600}>
                    {AVERAGE_BASH_BATTLE_DURATION_MIN}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2">Maxing</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2" fontWeight={600}>
                    {AVERAGE_MAXING_BATTLE_DURATION_MIN}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Rum per pirate per minute */}
            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
              <Typography variant="subtitle2" gutterBottom>
                Average rum per pirate per minute
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Typography variant="body2">Swill</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2" fontWeight={600}>
                    {AVERAGE_SWILL_PER_PIRATE_PER_MIN}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2">Grog</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2" fontWeight={600}>
                    {AVERAGE_GROG_PER_PIRATE_PER_MIN}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2">Fine rum</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2" fontWeight={600}>
                    {AVERAGE_FINE_PER_PIRATE_PER_MIN}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Rum spice per pirate per minute + baseline per hold */}
            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
              <Typography variant="subtitle2" gutterBottom>
                Rum spice
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    Avg consumed per pirate per minute
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight={600}>
                    {AVERAGE_RUM_SPICE_PER_PIRATE_PER_MIN}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    Baseline per pirate on hold
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight={600}>
                    {MINIMUM_RUM_SPICE_PER_PIRATE_ON_HOLD}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Naver style multipliers */}
            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
              <Typography variant="subtitle2" gutterBottom>
                Naver style multiplier (cannonballs)
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2">Conservative</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight={600}>
                    {NAVER_STYLE_MULT.conservative}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Moderate</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight={600}>
                    {NAVER_STYLE_MULT.moderate}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Aggressive</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight={600}>
                    {NAVER_STYLE_MULT.aggressive}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Wasted-to-max multipliers */}
            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
              <Typography variant="subtitle2" gutterBottom>
                Wasted CBs to reach desired max (by voyage type)
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Typography variant="body2">Evade</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2" fontWeight={600}>
                    {WASTED_TO_MAX_MULT.evade}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2">Bash</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2" fontWeight={600}>
                    {WASTED_TO_MAX_MULT.bash}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2">Maxing</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2" fontWeight={600}>
                    {WASTED_TO_MAX_MULT.maxing}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Typography variant="caption" color="text.secondary">
              Share your observed values and context (vessel, crew size, voyage
              type) so we can calibrate these.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1 }}>
          <Button onClick={() => setVarsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
