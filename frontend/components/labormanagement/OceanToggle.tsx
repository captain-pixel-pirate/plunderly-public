import * as React from "react";

import {
  ToggleButton,
  Box,
  Typography,
  Badge,
  useMediaQuery,
  useTheme,
  ToggleButtonGroup,
} from "@mui/material";

import { useGlobalContext } from "@context";

interface Props {
  workerCountPerOcean: Record<"Emerald" | "Meridian" | "Cerulean", number>;
}

export default function ColorToggleButton({ workerCountPerOcean }: Props) {
  const { userSettings, setUserSettings } = useGlobalContext();
  const theme = useTheme();
  const isMdDown = useMediaQuery(theme.breakpoints.down("md"));

  const handleToggleOcean = (
    _event: React.MouseEvent<HTMLElement>,
    newOcean: "Emerald" | "Meridian" | "Cerulean" | null
  ) => {
    if (!newOcean) return;
    setUserSettings((us) => ({ ...us, ocean: newOcean }));
  };

  const CountPill = ({ count }: { count: number }) => (
    <Box
      component="span"
      sx={{
        px: 0.75,
        py: 0.25,
        fontSize: "0.7rem",
        lineHeight: 1,
        borderRadius: 1,
        bgcolor: "action.selected",
        color: "text.secondary",
        mr: 0.75,
        minWidth: 22,
        textAlign: "center",
        display: isMdDown ? "none" : "inline-block",
      }}
    >
      {count}
    </Box>
  );

  const oceanBtn = (ocean: "Emerald" | "Meridian" | "Cerulean") => {
    const count = workerCountPerOcean[ocean] ?? 0;
    const firstLetter = ocean.charAt(0);

    return (
      <ToggleButton
        value={ocean}
        aria-label={ocean}
        sx={{
          px: isMdDown ? 0.75 : 1,
          py: isMdDown ? 0.25 : 0.5,
          borderRadius: 1.5,
          textTransform: "none",
          fontSize: "0.8rem",
          display: "inline-flex",
          alignItems: "center",
          minWidth: isMdDown ? 38 : 120,
          justifyContent: "center",
          gap: isMdDown ? 0 : 0.5,
        }}
      >
        {!isMdDown && (
          <>
            <CountPill count={count} />
            <Typography component="span" sx={{ fontSize: "0.8rem" }}>
              {ocean}
            </Typography>
          </>
        )}

        {isMdDown && (
          <Badge
            badgeContent={count}
            color="default"
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.65rem",
                minWidth: 16,
                height: 16,
                lineHeight: "16px",
                bgcolor: "action.selected",
                color: "text.secondary",
                border: (t) => `1px solid ${t.palette.divider}`,
              },
            }}
          >
            <Typography component="span" sx={{ fontSize: "0.9rem" }}>
              {firstLetter}
            </Typography>
          </Badge>
        )}
      </ToggleButton>
    );
  };

  return (
    <Box display="flex" justifyContent="end">
      <ToggleButtonGroup
        color="primary"
        value={userSettings.ocean}
        exclusive
        onChange={handleToggleOcean}
        aria-label="Select ocean"
        size="small"
        orientation="horizontal"
        sx={{
          gap: isMdDown ? 0.5 : 1,
          "& .MuiToggleButton-root": {
            border: (t) => `1px solid ${t.palette.divider}`,
          },
        }}
      >
        {oceanBtn("Emerald")}
        {oceanBtn("Meridian")}
        {oceanBtn("Cerulean")}
      </ToggleButtonGroup>
    </Box>
  );
}
