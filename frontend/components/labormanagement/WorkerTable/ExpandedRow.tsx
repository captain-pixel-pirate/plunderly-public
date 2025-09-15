import React from "react";
import Image from "next/image";

import {
  TableCell,
  TableRow,
  Stack,
  Box,
  Collapse,
  Typography,
  Button,
} from "@mui/material";

import { formatImagePath, getLaborTimeLeft } from "@utils/helpers";
import { CraftingDiscipline, Worker } from "@interfaces";

interface Props {
  isExpanded: boolean;
  worker: Worker;
  type: "Active" | "Dormant";
  refreshLabor: (workerId: string, craft: CraftingDiscipline) => void;
}

export default function ExpandedRow({
  isExpanded,
  worker,
  type,
  refreshLabor,
}: Props) {
  return (
    <TableRow>
      <TableCell colSpan={8} sx={{ p: 0, border: 0 }}>
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Other Crafting Skills
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {Object.entries(worker.craftingSkills)
                .filter(
                  ([skillKey]) => skillKey !== worker.primaryCraftingSkill
                )
                .map(([skillKey, skill]) => (
                  <Box
                    key={skillKey}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 1,
                      border: "1px solid #ddd",
                      borderRadius: 1,
                      minWidth: "200px",
                    }}
                  >
                    <Image
                      src={`/images/icons/${formatImagePath(skillKey)}.png`}
                      alt={skillKey}
                      width={24}
                      height={24}
                    />
                    <Box>
                      <Typography variant="body2">
                        {skillKey.charAt(0).toUpperCase() + skillKey.slice(1)}
                      </Typography>
                      <Typography color="text.secondary">
                        {skill.rank} / {skill.output} —{" "}
                        {getLaborTimeLeft(skill.lastPuzzleDate).fullString}
                      </Typography>
                    </Box>
                    {type === "Active" && (
                      <Button
                        size="small"
                        onClick={() =>
                          refreshLabor(
                            worker.id,
                            skillKey as CraftingDiscipline
                          )
                        }
                      >
                        Refresh
                      </Button>
                    )}
                  </Box>
                ))}
            </Stack>
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );
}
