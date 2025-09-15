"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  Grid,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Summarize as SummarizeIcon,
  PeopleAlt as PeopleAltIcon,
  Paid as PaidIcon,
  MonetizationOn as MonetizationOnIcon,
  ReceiptLong as ReceiptLongIcon,
  Storefront as StorefrontIcon,
} from "@mui/icons-material";
import { BsFillPeopleFill } from "react-icons/bs";

import { LaborState } from "@context/types";
import { formatImagePath, formatNumberWithCommas } from "@utils/helpers";
import { CraftingDiscipline, SHOPPE_GRADE } from "@interfaces";

interface Props {
  labor: LaborState;
  ocean: "Emerald" | "Meridian" | "Cerulean";
  doubloon: number;
}

export default function Overview({ ocean, doubloon, labor }: Props) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMdDown = useMediaQuery(theme.breakpoints.down("md"));

  const {
    totalWorkers,
    doubloonCostPerDay,
    totalDoubloonValueLeftOnBadges,
    totalDoubloonCost,
    badgeCounts,
  } = useMemo(() => {
    const workerSet = labor.activeWorkers.filter((AW) => AW.ocean === ocean);

    const badgeDoubloonCosts = {
      standard: 5,
      deluxe: 15,
      subscription: 42,
    } as const;

    const totals = {
      subscription: { totalDoubloonCost: 0, totalDaysLeft: 0, count: 0 },
      standard: { totalDoubloonCost: 0, totalDaysLeft: 0, count: 0 },
      deluxe: { totalDoubloonCost: 0, totalDaysLeft: 0, count: 0 },
    };

    for (const w of workerSet) {
      if (w.badgeType === "Subscription") {
        totals.subscription.totalDoubloonCost +=
          badgeDoubloonCosts.subscription;
        totals.subscription.totalDaysLeft += getCalendarDaysLeft(
          w.badgePurchaseDate
        );
        totals.subscription.count += 1;
      } else if (w.badgeType === "Standard") {
        totals.standard.totalDoubloonCost += badgeDoubloonCosts.standard;
        totals.standard.totalDaysLeft += getCalendarDaysLeft(
          w.badgePurchaseDate
        );
        totals.standard.count += 1;
      } else if (w.badgeType === "Deluxe") {
        totals.deluxe.totalDoubloonCost += badgeDoubloonCosts.deluxe;
        totals.deluxe.totalDaysLeft += getCalendarDaysLeft(w.badgePurchaseDate);
        totals.deluxe.count += 1;
      }
    }

    const totalDoubloonCost =
      ocean === "Cerulean"
        ? totals.subscription.totalDoubloonCost
        : totals.standard.totalDoubloonCost + totals.deluxe.totalDoubloonCost;

    const doubloonCostPerDay =
      ocean === "Cerulean"
        ? totals.subscription.totalDoubloonCost / 30
        : (totals.standard.totalDoubloonCost +
            totals.deluxe.totalDoubloonCost) /
          30;

    const totalDoubloonValueLeftOnBadges =
      ocean === "Cerulean"
        ? (totals.subscription.totalDaysLeft * 42) / 30
        : (totals.standard.totalDaysLeft * 5) / 30 +
          (totals.deluxe.totalDaysLeft * 15) / 30;

    return {
      totalWorkers: workerSet.length,
      doubloonCostPerDay,
      totalDoubloonValueLeftOnBadges,
      totalDoubloonCost,
      badgeCounts: {
        subscription: totals.subscription.count,
        standard: totals.standard.count,
        deluxe: totals.deluxe.count,
      },
    };
  }, [labor.activeWorkers, ocean]);

  const employerSummary = useMemo(() => {
    const employers = labor.employers ?? [];

    const totalEmployers = employers.length;

    const disciplines: CraftingDiscipline[] = [
      "shipyard",
      "apothecary",
      "ironMonger",
      "distillery",
      "weavery",
    ];
    const byDiscipline = Object.fromEntries(
      disciplines.map((d) => [d, 0])
    ) as Record<CraftingDiscipline, number>;

    const grades: SHOPPE_GRADE[] = [
      "Small Stall",
      "Medium Stall",
      "Deluxe Stall",
      "Shoppe",
      "Upgraded Shoppe",
    ];
    const byGrade = Object.fromEntries(grades.map((g) => [g, 0])) as Record<
      SHOPPE_GRADE,
      number
    >;

    let sumBasic = 0;
    let sumSkilled = 0;
    let sumExpert = 0;

    for (const e of employers) {
      byDiscipline[e.shoppeType] = (byDiscipline[e.shoppeType] ?? 0) + 1;
      byGrade[e.shoppeGrade] = (byGrade[e.shoppeGrade] ?? 0) + 1;

      sumBasic += e.pay.basic ?? 0;
      sumSkilled += e.pay.skilled ?? 0;
      sumExpert += e.pay.expert ?? 0;
    }

    const avgPay = {
      basic: totalEmployers ? sumBasic / totalEmployers : 0,
      skilled: totalEmployers ? sumSkilled / totalEmployers : 0,
      expert: totalEmployers ? sumExpert / totalEmployers : 0,
    };

    // compact list of all employers (name, type, pay)
    const compactList = [...employers]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((e) => ({
        id: e.id,
        name: e.name,
        island: e.island,
        shoppeType: e.shoppeType,
        shoppeGrade: e.shoppeGrade,
        basic: e.pay.basic ?? 0,
        skilled: e.pay.skilled ?? 0,
        expert: e.pay.expert ?? 0,
      }));

    return { totalEmployers, byDiscipline, byGrade, avgPay, compactList };
  }, [labor.employers]);

  const poePerDoubloon = doubloon;

  return (
    <>
      {isMdDown ? (
        <Tooltip title="Open Labor Summary">
          <IconButton
            aria-label="Open Labor Summary"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-controls="labor-summary-dialog"
            size="small"
          >
            <SummarizeIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Open Labor Summary">
          <Button
            variant="text"
            startIcon={<SummarizeIcon />}
            onClick={() => setOpen(true)}
            sx={{ textTransform: "none" }}
            aria-haspopup="dialog"
            aria-controls="labor-summary-dialog"
          >
            Overview
          </Button>
        </Tooltip>
      )}

      {/* Modal dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="labor-summary-title"
        id="labor-summary-dialog"
        fullWidth
        maxWidth="md"
      >
        <DialogTitle id="labor-summary-title">
          <Stack direction="row" spacing={1} alignItems="center">
            <ReceiptLongIcon fontSize="small" />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Overview
            </Typography>
            <Chip size="small" label={ocean} variant="outlined" />
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack spacing={1.5}>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  alignItems="center"
                >
                  <Typography
                    sx={{ display: "flex", alignItems: "center", pb: 0.5 }}
                  >
                    <BsFillPeopleFill style={{ marginRight: 10 }} /> Workers
                  </Typography>
                  {badgeCounts.subscription > 0 && (
                    <Chip
                      size="small"
                      label={`Sub: ${badgeCounts.subscription}`}
                      variant="outlined"
                    />
                  )}
                  {badgeCounts.deluxe > 0 && (
                    <Chip
                      size="small"
                      label={`Deluxe: ${badgeCounts.deluxe}`}
                      variant="outlined"
                    />
                  )}
                  {badgeCounts.standard > 0 && (
                    <Chip
                      size="small"
                      label={`Standard: ${badgeCounts.standard}`}
                      variant="outlined"
                    />
                  )}
                </Stack>

                <Divider />

                <List dense disablePadding>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PeopleAltIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Total Workers"
                      secondary={formatNumberWithCommas(totalWorkers)}
                      primaryTypographyProps={{ variant: "body2" }}
                      secondaryTypographyProps={{ variant: "body1" }}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PaidIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Cost Per Day"
                      primaryTypographyProps={{ variant: "body2" }}
                      secondary={
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={0.5}
                          flexWrap="wrap"
                        >
                          <Box
                            display="inline-flex"
                            alignItems="center"
                            gap={0.5}
                          >
                            {formatNumberWithCommas(doubloonCostPerDay)}
                            <Image
                              src={`/images/icons/${formatImagePath(
                                "doubloon"
                              )}.png`}
                              width={15}
                              height={15}
                              alt="doubloon"
                            />
                          </Box>
                          <Typography variant="body2" component="span">
                            ·
                          </Typography>
                          <Box
                            display="inline-flex"
                            alignItems="center"
                            gap={0.5}
                          >
                            {formatNumberWithCommas(
                              doubloonCostPerDay * poePerDoubloon
                            )}
                            <Image
                              src={`/images/icons/${formatImagePath(
                                "poe"
                              )}.png`}
                              width={15}
                              height={15}
                              alt="poe"
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <MonetizationOnIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Total Value Left"
                      primaryTypographyProps={{ variant: "body2" }}
                      secondary={
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={0.5}
                          flexWrap="wrap"
                        >
                          <Box
                            display="inline-flex"
                            alignItems="center"
                            gap={0.5}
                          >
                            {formatNumberWithCommas(
                              totalDoubloonValueLeftOnBadges
                            )}
                            <Image
                              src={`/images/icons/${formatImagePath(
                                "doubloon"
                              )}.png`}
                              width={15}
                              height={15}
                              alt="doubloon"
                            />
                          </Box>
                          <Typography variant="body2" component="span">
                            ·
                          </Typography>
                          <Box
                            display="inline-flex"
                            alignItems="center"
                            gap={0.5}
                          >
                            {formatNumberWithCommas(
                              totalDoubloonValueLeftOnBadges * poePerDoubloon
                            )}
                            <Image
                              src={`/images/icons/${formatImagePath(
                                "poe"
                              )}.png`}
                              width={15}
                              height={15}
                              alt="poe"
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <ReceiptLongIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Total Cost"
                      primaryTypographyProps={{ variant: "body2" }}
                      secondary={
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={0.5}
                          flexWrap="wrap"
                        >
                          <Box
                            display="inline-flex"
                            alignItems="center"
                            gap={0.5}
                          >
                            {formatNumberWithCommas(totalDoubloonCost)}
                            <Image
                              src={`/images/icons/${formatImagePath(
                                "doubloon"
                              )}.png`}
                              width={15}
                              height={15}
                              alt="doubloon"
                            />
                          </Box>
                          <Typography variant="body2" component="span">
                            ·
                          </Typography>
                          <Box
                            display="inline-flex"
                            alignItems="center"
                            gap={0.5}
                          >
                            {formatNumberWithCommas(
                              totalDoubloonCost * poePerDoubloon
                            )}
                            <Image
                              src={`/images/icons/${formatImagePath(
                                "poe"
                              )}.png`}
                              width={15}
                              height={15}
                              alt="poe"
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </Stack>
            </Grid>

            {/* RIGHT: Employers */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <StorefrontIcon fontSize="small" />
                  <Typography variant="subtitle1">Employers</Typography>
                  <Chip
                    size="small"
                    label={formatNumberWithCommas(
                      employerSummary.totalEmployers || 0
                    )}
                    variant="outlined"
                  />
                </Stack>

                <Box
                  sx={{
                    maxHeight: 300,
                    overflow: "auto",
                    py: 1,
                    px: 1,
                    borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {/* Discipline counts */}
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {Object.entries(employerSummary.byDiscipline).map(
                      ([disc, count]) =>
                        count > 0 ? (
                          <Chip
                            key={disc}
                            size="small"
                            label={`${humanizeDiscipline(
                              disc as CraftingDiscipline
                            )}: ${count}`}
                            variant="outlined"
                          />
                        ) : null
                    )}
                  </Stack>
                  <List dense disablePadding>
                    {employerSummary.compactList.map((e) => (
                      <ListItem key={e.id} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Image
                            src={`/images/icons/${formatImagePath(
                              e.shoppeType
                            )}.png`}
                            alt=""
                            width={25}
                            height={25}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              <b>{e.name}</b> —{" "}
                              {humanizeDiscipline(e.shoppeType)}
                              {e.shoppeGrade
                                ? `, ${e.shoppeGrade}`
                                : ""} on {e.island}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              B:{formatNumberWithCommas(e.basic)} · S:
                              {formatNumberWithCommas(e.skilled)} · E:
                              {formatNumberWithCommas(e.expert)}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/**
 * Calendar-based days left on a badge from a start ISO date.
 * Counts full calendar days (UTC midnight boundaries).
 */
export function getCalendarDaysLeft(
  startIsoDate: string,
  durationDays = 30
): number {
  const start = new Date(startIsoDate);
  const now = new Date();

  start.setUTCHours(0, 0, 0, 0);
  now.setUTCHours(0, 0, 0, 0);

  const msInDay = 24 * 60 * 60 * 1000;
  const expiry = new Date(start.getTime() + durationDays * msInDay);
  const remainingMs = expiry.getTime() - now.getTime();

  return remainingMs <= 0 ? 0 : Math.ceil(remainingMs / msInDay);
}

function humanizeDiscipline(d: CraftingDiscipline): string {
  // Keep your capitalization consistent with the rest of the app.
  switch (d) {
    case "ironMonger":
      return "Ironmonger";
    case "shipyard":
      return "Shipyard";
    case "apothecary":
      return "Apothecary";
    case "distillery":
      return "Distillery";
    case "weavery":
      return "Weavery";
    default:
      return d;
  }
}
