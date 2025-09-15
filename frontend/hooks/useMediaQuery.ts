"use client";

import { useMediaQuery, useTheme } from "@mui/material";

const useCurrentBreakpoint = () => {
  const theme = useTheme();

  const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  const isSm = useMediaQuery(theme.breakpoints.only("sm"));
  const isMd = useMediaQuery(theme.breakpoints.only("md"));
  const isLg = useMediaQuery(theme.breakpoints.only("lg"));
  const isXl = useMediaQuery(theme.breakpoints.up("xl"));

  if (isXl) {
    return "xl";
  } else if (isLg) {
    return "lg";
  } else if (isMd) {
    return "md";
  } else if (isSm) {
    return "sm";
  } else if (isXs) {
    return "xs";
  }

  return null;
};

export default useCurrentBreakpoint;
