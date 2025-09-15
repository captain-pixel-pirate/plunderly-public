"use client";

import { useState } from "react";
import Image from "next/image";

import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  TrendingUp as TrendingUpIcon,
  RestartAlt as RestartAltIcon,
  CalculateOutlined as CalculateOutlinedIcon,
} from "@mui/icons-material";

import { Vessel } from "@interfaces/vessel";
import StockCalculator from "./StockCalculator";

interface Props {
  wins: number;
  losses: number;
  adjustWinLoss: (
    key: "wins" | "losses",
    action: "increase" | "decrease"
  ) => void;
  onReset?: () => void;
  vesselSelection: Vessel;
}

export default function FirstMateTitleBar({
  wins,
  losses,
  adjustWinLoss,
  onReset,
  vesselSelection,
}: Props) {
  const theme = useTheme();
  const total = Math.max(0, (wins ?? 0) + (losses ?? 0));
  const winRate = total > 0 ? (wins / total) * 100 : 0;
  const winRateLabel = `${Math.round(winRate)}%`;
  const rateColor =
    winRate >= 70 ? "success" : winRate >= 50 ? "warning" : "error";

  const [calcOpen, setCalcOpen] = useState(false);

  return (
    <Paper
      elevation={10}
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        px: 0.5,
        py: 0.5,
        borderRadius: 2,
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.12
        )} 0%, ${alpha(theme.palette.background.paper, 0.5)} 60%)`,
        border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        backdropFilter: "blur(6px)",
        minWidth: 285,
        mx: "auto",
      }}
    >
      {/* Left emblem */}
      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Image
          src="/images/icons/crew_captain.png"
          alt="captain"
          width={40}
          height={40}
        />
      </Box>

      {/* Title + meta */}
      <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: "'Pirata One', system-ui, sans-serif",
            letterSpacing: ".1rem",
            fontSize: ".85rem",
            textShadow: `0 1px 0 ${alpha(theme.palette.common.black, 0.35)}`,
            fontWeight: 600,
          }}
          color="primary"
        >
          First Mate
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Chip
            size="small"
            icon={<TrendingUpIcon />}
            label={`WR ${winRateLabel}`}
            color={rateColor}
            variant="outlined"
            sx={{
              height: 20,
              "& .MuiChip-label": {
                px: 0.5,
                fontSize: "0.65rem",
                fontWeight: 600,
              },
            }}
          />
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {total}
          </Typography>
        </Box>
      </Box>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, opacity: 0.2 }} />

      {/* Wins */}
      <Counter
        title="Wins"
        value={wins}
        onInc={() => adjustWinLoss("wins", "increase")}
        onDec={() => adjustWinLoss("wins", "decrease")}
        incColor="#4caf50"
        decColor="#8bc34a"
      />

      {/* Losses */}
      <Counter
        title="Losses"
        value={losses}
        onInc={() => adjustWinLoss("losses", "increase")}
        onDec={() => adjustWinLoss("losses", "decrease")}
        incColor="#ef5350"
        decColor="#f44336"
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography fontSize=".65rem" sx={{ opacity: 0.8 }}>
          Stock Calculator
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title="Open stock calculator">
            <IconButton
              aria-label="open stock calculator"
              size="small"
              onClick={() => setCalcOpen(true)}
              sx={{
                border: "1px solid ${alpha(theme.palette.divider, 0.6)}",
                backgroundColor: alpha(theme.palette.background.paper, 0.5),
                "&:hover": {
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                },
                p: "3px",
              }}
            >
              <CalculateOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {onReset && (
        <Tooltip title="Reset">
          <IconButton aria-label="reset score" onClick={onReset} size="small">
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* Popup (controlled) */}
      <StockCalculator
        vesselSelection={vesselSelection}
        open={calcOpen}
        onClose={() => setCalcOpen(false)}
      />
    </Paper>
  );
}

function Counter({
  title,
  value,
  onInc,
  onDec,
  incColor,
  decColor,
}: {
  title: string;
  value: number;
  onInc: () => void;
  onDec: () => void;
  incColor: string;
  decColor: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: 64,
      }}
    >
      <Typography fontSize=".65rem" sx={{ opacity: 0.8 }}>
        {title}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
        <Tooltip title={`Add ${title.toLowerCase()}`}>
          <span>
            <IconButton
              aria-label={`increase ${title.toLowerCase()}`}
              size="small"
              onClick={onInc}
            >
              <AddIcon sx={{ fontSize: "0.95rem", color: incColor }} />
            </IconButton>
          </span>
        </Tooltip>

        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 700,
            minWidth: 20,
            textAlign: "center",
          }}
        >
          {value}
        </Typography>

        <Tooltip title={`Remove ${title.toLowerCase()}`}>
          <span>
            <IconButton
              aria-label={`decrease ${title.toLowerCase()}`}
              size="small"
              onClick={onDec}
            >
              <RemoveIcon sx={{ fontSize: "0.95rem", color: decColor }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}
