"use client";

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import Image from "next/image";

import {
  Modal,
  Typography,
  Button,
  Box,
  Stack,
  Paper,
  TextField,
  Switch,
  FormControlLabel,
  InputAdornment,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

import { GreedySettings, PillageBattle, UserSettings } from "@interfaces";

interface Props {
  battle: PillageBattle | null | undefined;
  greedySettings: GreedySettings | null | undefined;
  setUserSettings: Dispatch<SetStateAction<UserSettings>>;
  onCloseQuickPreview?: () => void;
  battleNum: number;
  primary: boolean;
  quickView?: boolean;
}

export default function GreedyCounterModal({
  battle,
  greedySettings,
  setUserSettings,
  onCloseQuickPreview,
  battleNum,
  primary,
  quickView,
}: Props) {
  // ---- Defensive fallbacks ----
  const strikes: Record<string, number> = useMemo(() => {
    const gs = battle?.greedyStrikes;
    return gs && typeof gs === "object" && !Array.isArray(gs)
      ? (gs as Record<string, number>)
      : {};
  }, [battle]);

  const gs = useMemo<GreedySettings>(() => {
    // sensible defaults if settings are missing
    return {
      enablePayments: greedySettings?.enablePayments ?? false,
      payPerGreedy: Number.isFinite(greedySettings?.payPerGreedy as number)
        ? (greedySettings!.payPerGreedy as number)
        : 0,
      enableTopBasherPay: greedySettings?.enableTopBasherPay ?? false,
      payPerTopBasher: Number.isFinite(
        greedySettings?.payPerTopBasher as number
      )
        ? (greedySettings!.payPerTopBasher as number)
        : 0,
    };
  }, [greedySettings]);

  const sortedEntries = useMemo(
    () =>
      Object.entries(strikes).sort(
        (a, b) => (b[1] as number) - (a[1] as number)
      ),
    [strikes]
  );
  const totalHits = useMemo(
    () =>
      Object.values(strikes).reduce((acc, val) => acc + (Number(val) || 0), 0),
    [strikes]
  );

  const summaryText =
    (Number.isFinite(totalHits) ? `${totalHits}` : "0") +
    " total hits!\n" +
    (sortedEntries.length
      ? sortedEntries.map(([key, value]) => `${key}: ${value}`).join(", ")
      : "No greedy strikes found.");

  // If quickView, we still open, but the modal will render a safe empty state.
  const [open, setOpen] = useState<boolean>(!!quickView);
  const [copiedLines, setCopiedLines] = useState<string[]>([]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    if (quickView && onCloseQuickPreview) onCloseQuickPreview();
    else setOpen(false);
  };

  const copyToClipboardSummary = () => {
    try {
      navigator.clipboard?.writeText(summaryText);
      setCopiedLines((prev) =>
        prev.includes("__summary__") ? prev : [...prev, "__summary__"]
      );
    } catch {
      // no-op: avoid crashing if clipboard is unavailable
    }
  };

  const copyToClipboardLine = (key: string, text: string) => {
    try {
      navigator.clipboard?.writeText(text);
      setCopiedLines((prev) => (prev.includes(key) ? prev : [...prev, key]));
    } catch {
      // no-op
    }
  };

  const getTopBashers = () => {
    if (!sortedEntries.length)
      return [] as Array<{ name: [string, number]; payment: number }>;
    const topBasherHits = sortedEntries[0][1];
    const tied = sortedEntries.filter(([, hits]) => hits === topBasherHits);
    const paymentPerBasher = Math.round(
      (gs.payPerTopBasher || 0) / Math.max(tied.length, 1)
    );
    return tied.map((name) => ({ name, payment: paymentPerBasher }));
  };

  return (
    <>
      {quickView ? null : (
        <Button
          size="small"
          color="primary"
          variant={primary ? "contained" : "outlined"}
          onClick={handleOpen}
        >
          View
        </Button>
      )}

      <Modal open={open} onClose={handleClose} closeAfterTransition>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 450,
            maxWidth: "90%",
            maxHeight: "95vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 2,
            outline: "none",
            border: "solid white 1px",
          }}
        >
          <Stack spacing={1}>
            <Typography variant="h5" align="center">
              <Typography component="span" color="secondary" paddingRight={1}>
                Battle #{Number.isFinite(battleNum) ? battleNum : 0}
              </Typography>
              Greedy Strikes Summary
            </Typography>

            <Card variant="outlined">
              <CardContent
                sx={{ p: 2, fontFamily: "monospace", whiteSpace: "pre-wrap" }}
              >
                {summaryText}
              </CardContent>
            </Card>

            <Button
              onClick={copyToClipboardSummary}
              variant="outlined"
              fullWidth
              sx={{ borderRadius: 2, textTransform: "none" }}
              startIcon={copiedLines.includes("__summary__") && <CheckIcon />}
            >
              {copiedLines.includes("__summary__")
                ? "Summary Copied"
                : "Copy Summary"}
            </Button>

            <Divider />

            <Box display="flex" justifyContent="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={!!gs.enablePayments}
                    onChange={() =>
                      setUserSettings((US) => ({
                        ...US,
                        greedySettings: {
                          ...US.greedySettings,
                          enablePayments: !US.greedySettings.enablePayments,
                        },
                      }))
                    }
                  />
                }
                label="Enable Payments"
              />
            </Box>

            {!!gs.enablePayments && (
              <Stack spacing={2} sx={{ pt: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                  <TextField
                    label="Pay per greedy"
                    type="number"
                    size="small"
                    value={gs.payPerGreedy}
                    onChange={(e) =>
                      setUserSettings((US) => ({
                        ...US,
                        greedySettings: {
                          ...US.greedySettings,
                          payPerGreedy: Number(e.target.value),
                        },
                      }))
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Image
                            src="/images/icons/poe.png"
                            alt="poe"
                            width={20}
                            height={20}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ maxWidth: 150 }}
                  />

                  {/* Top basher payment */}
                  <Box display="flex" alignItems="center">
                    <TextField
                      label="Top basher"
                      type="number"
                      size="small"
                      value={gs.payPerTopBasher}
                      onChange={(e) =>
                        setUserSettings((US) => ({
                          ...US,
                          greedySettings: {
                            ...US.greedySettings,
                            payPerTopBasher: Number(e.target.value),
                          },
                        }))
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Image
                              src="/images/icons/poe.png"
                              alt="poe"
                              width={20}
                              height={20}
                            />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ maxWidth: 150 }}
                      disabled={!gs.enableTopBasherPay}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!gs.enableTopBasherPay}
                          onChange={() =>
                            setUserSettings((US) => ({
                              ...US,
                              greedySettings: {
                                ...US.greedySettings,
                                enableTopBasherPay:
                                  !US.greedySettings.enableTopBasherPay,
                              },
                            }))
                          }
                        />
                      }
                      label=""
                      sx={{ ml: 1, mb: 0 }}
                    />
                  </Box>
                </Box>

                {gs.enableTopBasherPay && (
                  <Paper
                    elevation={0}
                    sx={{ px: 2, maxHeight: 250, overflowY: "auto" }}
                  >
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      color="textSecondary"
                      sx={{ fontWeight: "bold" }}
                    >
                      Top Basher{getTopBashers().length > 1 ? "s (split)" : ""}
                    </Typography>
                    <Stack spacing={1}>
                      {getTopBashers().map(({ name, payment }) => {
                        const payCommand = `/pay ${name[0]} ${payment}`;
                        const isCopied = copiedLines.includes(name[0] + "-top");
                        return (
                          <Box
                            key={name[0]}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: "monospace" }}
                            >
                              {payCommand}
                            </Typography>
                            <Button
                              size="small"
                              variant={isCopied ? "contained" : "outlined"}
                              color={isCopied ? "success" : "primary"}
                              onClick={() =>
                                copyToClipboardLine(
                                  name[0] + "-top",
                                  payCommand
                                )
                              }
                              startIcon={
                                isCopied && <CheckIcon fontSize="small" />
                              }
                              sx={{ textTransform: "none", borderRadius: 1 }}
                            >
                              {isCopied ? "Copied" : "Copy"}
                            </Button>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Paper>
                )}

                <Paper
                  elevation={0}
                  sx={{ px: 2, pb: 1, maxHeight: 250, overflowY: "auto" }}
                >
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    color="textSecondary"
                    sx={{ fontWeight: "bold" }}
                  >
                    Greedy Payments
                  </Typography>
                  <Stack spacing={1}>
                    {sortedEntries.map(([key, value]) => {
                      const amount =
                        (Number(value) || 0) * (gs.payPerGreedy || 0);
                      const payCommand = `/pay ${key} ${amount}`;
                      const isCopied = copiedLines.includes(key);
                      return (
                        <Box
                          key={key}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "monospace" }}
                          >
                            {payCommand}
                          </Typography>
                          <Button
                            size="small"
                            variant={isCopied ? "contained" : "outlined"}
                            color={isCopied ? "success" : "primary"}
                            onClick={() => copyToClipboardLine(key, payCommand)}
                            startIcon={
                              isCopied && <CheckIcon fontSize="small" />
                            }
                            sx={{ textTransform: "none", borderRadius: 1 }}
                          >
                            {isCopied ? "Copied" : "Copy"}
                          </Button>
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>
              </Stack>
            )}

            <Button
              onClick={handleClose}
              variant="contained"
              fullWidth
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              Close
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  );
}
