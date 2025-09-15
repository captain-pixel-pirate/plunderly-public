"use client";

import { useState } from "react";
import Image from "next/image";

import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Card, CardContent, Divider } from "@mui/material";

import { GreedyCounter } from "@interfaces";
import { formatImagePath, formatNumberWithCommas } from "@utils/helpers";
import BattleTable from "./BattleTable";

interface Props {
  result: GreedyCounter;
}

export default function BattlesContainer({ result }: Props) {
  const {
    battles,
    greedyPursesOpened,
    greedyPursesEarnings,
    wins,
    losses,
    globalGreedyStrikes,
    sinks,
  } = result;

  const [sortMode, setSortMode] = useState<"recent" | "greedy">("recent");

  const battlesWithGreedy = battles.map((battle, idx) => ({
    ...battle,
    index: idx,
    totalGreedyStrikes: Object.values(battle.greedyStrikes).reduce(
      (sum, count) => sum + count,
      0
    ),
  }));

  const topRanks: Record<number, number> = {};
  [...battlesWithGreedy]
    .sort((a, b) => b.totalGreedyStrikes - a.totalGreedyStrikes)
    .slice(0, 3)
    .forEach((b, i) => {
      topRanks[b.index] = i + 1;
    });

  const sortedBattles =
    sortMode === "greedy"
      ? [...battlesWithGreedy].sort(
          (a, b) => b.totalGreedyStrikes - a.totalGreedyStrikes
        )
      : [...battlesWithGreedy].reverse();

  const avgPerPurse =
    greedyPursesOpened > 0 ? greedyPursesEarnings / greedyPursesOpened : 0;
  const avgPerTrinket = avgPerPurse / 3;

  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

  const topGlobalStrikes = Object.entries(globalGreedyStrikes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      {/* Summary Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(3, 1fr)",
          },
          gap: 3,
          mb: 1,
        }}
      >
        {/* Wins & Losses */}
        <Card
          sx={{
            bgcolor: "background.paper",
            boxShadow: 3,
            borderRadius: 2,
            borderLeft: "6px solid",
            borderColor: "error.main",
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.02)" },
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Box
                sx={{
                  bgcolor: "error.light",
                  color: "error.main",
                  borderRadius: "50%",
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1,
                }}
              >
                <Image
                  src={formatImagePath("/images/icons/pvp.png")}
                  width={20}
                  height={20}
                  alt="pve"
                />
              </Box>
              <Typography variant="h6" color="text.primary">
                Battle Results
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "grid", rowGap: 1 }}>
              <Typography variant="body2">
                Wins: <strong>{wins}</strong>
              </Typography>
              <Typography variant="body2">
                Losses: <strong>{losses}</strong>
              </Typography>
              <Typography variant="body2">
                Vessel sinks: <strong>{sinks}</strong>
              </Typography>
              <Typography variant="body2">
                Win Rate: <strong>{winRate.toFixed(1)}%</strong>
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Greedy Purses */}
        <Card
          sx={{
            bgcolor: "background.paper",
            boxShadow: 3,
            borderRadius: 2,
            borderLeft: "6px solid",
            borderColor: "warning.main",
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.02)" },
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Box
                sx={{
                  bgcolor: "warning.light",
                  color: "warning.main",
                  borderRadius: "50%",
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1,
                }}
              >
                <Image
                  src={formatImagePath("/images/icons/purse.png")}
                  width={20}
                  height={20}
                  alt="pve"
                />
              </Box>
              <Typography variant="h6" color="text.primary">
                Greedy Purses
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "grid", rowGap: 1 }}>
              <Typography variant="body2">
                Purses Opened: <strong>{greedyPursesOpened}</strong>
              </Typography>
              <Typography variant="body2">
                Total Earnings:{" "}
                <strong>{formatNumberWithCommas(greedyPursesEarnings)}</strong>
              </Typography>
              {greedyPursesOpened > 0 && (
                <>
                  <Typography variant="body2">
                    Avg per Purse:{" "}
                    <strong>{formatNumberWithCommas(avgPerPurse)}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Avg per Trinket:{" "}
                    <strong>{formatNumberWithCommas(avgPerTrinket)}</strong>
                  </Typography>
                </>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Overall Greedy Strikes */}
        <Card
          sx={{
            bgcolor: "background.paper",
            boxShadow: 3,
            borderRadius: 2,
            borderLeft: "6px solid",
            borderColor: "info.main",
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.02)" },
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Box
                sx={{
                  bgcolor: "info.light",
                  color: "info.main",
                  borderRadius: "50%",
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1,
                }}
              >
                <Image
                  src={formatImagePath("/images/icons/greedy pirate 1.png")}
                  width={25}
                  height={25}
                  alt="pirate"
                />
              </Box>
              <Typography variant="h6" color="text.primary">
                Overall Strikes
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {topGlobalStrikes.length > 0 ? (
              topGlobalStrikes.map(([name, count], idx) => (
                <Typography variant="body2" key={name}>
                  {idx + 1}. {name}: <strong>{count}</strong>
                </Typography>
              ))
            ) : (
              <Typography variant="body2">No strikes recorded.</Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Battle History Section */}
      <Box
        sx={{
          p: 1,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="h4" color="text.primary" sx={{ pl: 2 }}>
            Battle History
          </Typography>
          <ToggleButtonGroup
            value={sortMode}
            exclusive
            size="small"
            onChange={(_, val) => val && setSortMode(val)}
          >
            <ToggleButton value="recent">Most Recent</ToggleButton>
            <ToggleButton value="greedy">Top Greedy Strikes</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <BattleTable battles={sortedBattles} />
      </Box>
    </Box>
  );
}
