"use client";

import { useState } from "react";

import { Box, Tabs, Tab, Divider } from "@mui/material";
import { FaCalculator } from "react-icons/fa";
import { GiMineWagon } from "react-icons/gi";
import StorefrontIcon from "@mui/icons-material/Storefront";

import { useAvailableHeight } from "@hooks";
import Markets from "./Markets";
import IslandCommoditySpawns from "./IslandCommoditySpawns";
import HoldCalculator from "./HoldCalculator";

type TabPanelProps = {
  children?: React.ReactNode;
  index: number;
  value: number;
  keepMounted?: boolean;
};

function a11yProps(index: number) {
  return {
    id: `feature-tab-${index}`,
    "aria-controls": `feature-tabpanel-${index}`,
  };
}

// Accessible TabPanel that can keep children mounted
function TabPanel({
  children,
  value,
  index,
  keepMounted = true,
}: TabPanelProps) {
  const isActive = value === index;

  if (!keepMounted && !isActive) return null;

  return (
    <Box
      role="tabpanel"
      id={`feature-tabpanel-${index}`}
      aria-labelledby={`feature-tab-${index}`}
      hidden={!isActive}
      sx={{ height: "100%" }}
    >
      {keepMounted ? (
        <Box sx={{ display: isActive ? "block" : "none", height: "100%" }}>
          {children}
        </Box>
      ) : (
        isActive && <Box sx={{ height: "100%" }}>{children}</Box>
      )}
    </Box>
  );
}

export default function CommodityMarket() {
  const availableHeight = useAvailableHeight();
  const [tab, setTab] = useState(0);

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minHeight: availableHeight,
        width: "100%",
        backgroundImage: `
          radial-gradient(1200px 600px at 50% -10%, rgba(255,255,255,0.06), transparent 60%),
          radial-gradient(800px 400px at 50% 120%, rgba(255,255,255,0.04), transparent 60%),
          linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02)),
          repeating-linear-gradient(0deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 1px, transparent 1px, transparent 10px)
        `,
      }}
    >
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        allowScrollButtonsMobile
        aria-label="Feature tabs"
        sx={{
          px: 1,
          minHeight: 60,
          "& .MuiTab-root": {
            minHeight: 60,
            py: 1,
          },
        }}
      >
        <Tab
          icon={<StorefrontIcon fontSize="small" />}
          iconPosition="start"
          label="Dockside Markets"
          {...a11yProps(0)}
        />
        <Tab
          icon={<GiMineWagon fontSize="large" />}
          iconPosition="start"
          label="Commodity Spawns"
          {...a11yProps(1)}
        />
        <Tab
          icon={<FaCalculator />}
          iconPosition="start"
          label="Vessel Hold Calculator"
          {...a11yProps(2)}
        />
      </Tabs>

      <Divider />

      <Box
        sx={{
          flexGrow: 1,
          width: "100%",
          overflow: "auto",
        }}
      >
        <TabPanel value={tab} index={0} keepMounted>
          <Markets />
        </TabPanel>

        <TabPanel value={tab} index={1} keepMounted>
          <IslandCommoditySpawns />
        </TabPanel>
        <TabPanel value={tab} index={2} keepMounted>
          <HoldCalculator />
        </TabPanel>
      </Box>
    </Box>
  );
}
