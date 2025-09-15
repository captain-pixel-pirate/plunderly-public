import React from "react";
import Image from "next/image";

import { TableCell, Box, Chip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { MdOutlineAttachMoney } from "react-icons/md";
import type { Theme } from "@mui/material/styles";

import { formatImagePath, getCalendarDaysLeft } from "@utils/helpers";
import { Worker } from "@interfaces";
import { ExpiryPreferences } from "./WorkerTable";

interface Props {
  worker: Worker;
  type: "Active" | "Dormant";
  refreshBadgeExpiry: (workerId: string) => void;
  expiryPreferences: ExpiryPreferences;
}

function parseDaysLeft(s: string): number {
  if (!s) return NaN;
  const lower = s.toLowerCase().trim();
  if (lower.includes("expired")) return -1;
  const m = lower.match(/^(\d+)\s*(d|day|days)?/);
  if (m && m[1]) return Number(m[1]);
  const anyNum = lower.match(/(\d+)\s*(d|day|days)/);
  if (anyNum && anyNum[1]) return Number(anyNum[1]);
  return NaN;
}

type ChipColors = {
  color: string;
  borderColor: string;
  iconColor: string;
};

export default function BadgeExpiryCell({
  worker,
  type,
  expiryPreferences,
  refreshBadgeExpiry,
}: Props): React.JSX.Element {
  const label: string = getCalendarDaysLeft(worker.badgePurchaseDate);
  const daysLeft: number = parseDaysLeft(label);
  const isExpired: boolean =
    daysLeft === 0 || label.toLowerCase().includes("expired");
  const isExpiring: boolean =
    !isExpired && daysLeft <= expiryPreferences.badgeExpiryWarnDays;

  const chipColors = (theme: Theme): ChipColors => {
    if (isExpired) {
      const c = theme.palette.error.main;
      return { color: c, borderColor: c, iconColor: c };
    }
    if (isExpiring) {
      const c = theme.palette.warning.main;
      return { color: c, borderColor: c, iconColor: c };
    }
    return {
      color: theme.palette.text.primary,
      borderColor: theme.palette.divider,
      iconColor: theme.palette.text.secondary,
    };
  };

  return (
    <TableCell>
      <Box display="flex" alignItems="center" gap={0.75}>
        {/* Left: badge type indicator */}
        {worker.badgeType === "Subscription" ? (
          <MdOutlineAttachMoney
            style={{ fontSize: 18, verticalAlign: "middle" }}
            aria-label="subscription-badge"
          />
        ) : (
          <Box
            sx={{
              width: 18,
              height: 18,
              overflow: "hidden",
              display: "inline-block",
            }}
          >
            <Image
              src={`/images/icons/badges/${formatImagePath(
                worker.badgeType
              )}.png`}
              width={18}
              height={18}
              alt={worker.badgeType}
            />
          </Box>
        )}

        <Chip
          size="small"
          label={label}
          variant="outlined"
          onDelete={
            type === "Active" ? () => refreshBadgeExpiry(worker.id) : undefined
          }
          deleteIcon={<RefreshIcon />}
          sx={{
            fontSize: ".75rem",
            fontWeight: 500,
            px: 0.5,
            height: 24,
            minWidth: 90,
            backgroundColor: "transparent",
            color: (t) => chipColors(t as Theme).color,
            borderColor: (t) => chipColors(t as Theme).borderColor,
            "& .MuiChip-deleteIcon": {
              color: (t) => chipColors(t as Theme).iconColor,
              fontSize: 18,
              mr: 0,
            },
            "& .MuiChip-deleteIcon:hover": { opacity: 0.85 },
          }}
        />
      </Box>
    </TableCell>
  );
}
