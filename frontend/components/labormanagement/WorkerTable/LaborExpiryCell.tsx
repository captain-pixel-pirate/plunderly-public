import React from "react";
import Image from "next/image";

import { TableCell, Box, Chip, Stack } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import type { Theme } from "@mui/material/styles";

import {
  formatImagePath,
  getLaborColor,
  getLaborTimeLeft,
} from "@utils/helpers";
import { CraftingDiscipline, Worker } from "@interfaces";
import { ExpiryPreferences } from "./WorkerTable";

interface Props {
  worker: Worker;
  type: "Active" | "Dormant";
  refreshLabor: (workerId: string, craft: CraftingDiscipline) => void;
  expiryPreferences: ExpiryPreferences;
}

type ChipColors = {
  color: string;
  borderColor: string;
  refreshColor: string;
};

export default function TableExpiryCell({
  worker,
  type,
  expiryPreferences,
  refreshLabor,
}: Props): React.JSX.Element {
  const commonChipStyles = {
    fontSize: ".75rem",
    fontWeight: 500,
    px: 0.5,
    height: 24,
    justifyContent: "flex-start",
  } as const;

  return (
    <TableCell>
      <Stack direction="column" spacing={0.5}>
        {Object.entries(worker.craftingSkills)
          .filter(([, skill]) => skill.active)
          .map(([skillKey, skill]) => {
            const { fullString, days }: { fullString: string; days: number } =
              getLaborTimeLeft(skill.lastPuzzleDate);
            const isExpired: boolean = fullString.toLowerCase() === "expired";
            const isExpiring: boolean =
              !isExpired &&
              days <= (expiryPreferences?.laborExpiryWarnDays ?? 3);

            const chipColors = (theme: Theme): ChipColors => {
              if (isExpired) {
                const c = theme.palette.error.main;
                return { color: c, borderColor: c, refreshColor: c };
              }
              if (isExpiring) {
                const c = theme.palette.warning.main;
                return { color: c, borderColor: c, refreshColor: c };
              }
              return {
                color: theme.palette.text.primary,
                borderColor: theme.palette.divider,
                refreshColor: theme.palette.text.secondary,
              };
            };

            const chip = (
              <Chip
                size="small"
                label={fullString}
                variant="outlined"
                onDelete={
                  type === "Active"
                    ? () =>
                        refreshLabor(worker.id, skillKey as CraftingDiscipline)
                    : undefined
                }
                deleteIcon={<RefreshIcon />}
                sx={{
                  ...commonChipStyles,
                  backgroundColor: "transparent",
                  color: (t: Theme) => chipColors(t).color,
                  borderColor: (t: Theme) => chipColors(t).borderColor,
                  "& .MuiChip-deleteIcon": {
                    color: (t: Theme) => chipColors(t).refreshColor,
                    fontSize: 18,
                    marginRight: 0, // keep it snug
                  },
                  "& .MuiChip-deleteIcon:hover": {
                    opacity: 0.85,
                  },
                }}
              />
            );

            return (
              <Box key={skillKey} display="flex" alignItems="center" gap={1}>
                <Image
                  src={`/images/icons/${formatImagePath(skillKey)}.png`}
                  width={22}
                  height={22}
                  alt={skillKey}
                />
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{ pr: 0.5, gap: 0.5 }}
                >
                  {(() => {
                    const color: string = getLaborColor(skill.output);
                    const letter: string = skill.output;
                    return (
                      <Box
                        aria-label={`output-${skill.output}`}
                        sx={{
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                          fontVariantNumeric: "tabular-nums",
                          color,
                          fontSize: "0.8rem",
                          lineHeight: 1,
                          textTransform: "uppercase",
                          minWidth: 60,
                        }}
                      >
                        {letter}
                      </Box>
                    );
                  })()}
                </Box>

                {/* Chip with inline refresh */}
                <Box display="flex" alignItems="center" gap={0.5}>
                  {chip}
                </Box>
              </Box>
            );
          })}
      </Stack>
    </TableCell>
  );
}
