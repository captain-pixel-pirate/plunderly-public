"use client";

import * as React from "react";
import Image from "next/image";

import { Tabs, Tab, Box, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { useGlobalContext } from "@context/GlobalContext";
import { useAvailableHeight } from "@hooks";
import EmployerForm from "./EmployerForm";
import WorkerTable from "./WorkerTable/WorkerTable";
import EmployerCard from "./EmployerCard/EmployerCard";
import LaborSummary from "./Overview";
import OceanToggle from "./OceanToggle";
import WorkerForm from "./WorkerForm";

export default function LaborManagementPage() {
  const [value, setValue] = React.useState<number>(() => {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem("labor-tab-index")
        : null;
    return stored ? parseInt(stored) : 0;
  });

  const { labor, userSettings } = useGlobalContext();

  const [showLaborAltModal, setShowLaborAltModal] = React.useState(false);
  const [showEmployerModal, setShowEmployerModal] = React.useState(false);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const workerCountPerOcean = labor.activeWorkers.reduce((acc, worker) => {
    acc[worker.ocean] = (acc[worker.ocean] || 0) + 1;
    return acc;
  }, {} as Record<"Emerald" | "Meridian" | "Cerulean", number>);

  React.useEffect(() => {
    localStorage.setItem("labor-tab-index", value.toString());
  }, [value]);

  const availableHeight = useAvailableHeight();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        minHeight: availableHeight,
        pb: 5,
        backgroundImage: `
          radial-gradient(1200px 600px at 50% -10%, rgba(255,255,255,0.06), transparent 60%),
          radial-gradient(800px 400px at 50% 120%, rgba(255,255,255,0.04), transparent 60%),
          linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02)),
          repeating-linear-gradient(0deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 1px, transparent 1px, transparent 10px)
        `,
      }}
    >
      <Box sx={{ width: "clamp(300px, 95vw, 1100px)" }}>
        {/* Header row: Tabs (left) + Controls (right) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            borderBottom: 1,
            borderColor: "divider",
            py: 2,
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="labor tabs"
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{
              p: 0,
              minHeight: 42,
              "& .MuiTab-root": { minHeight: 42, py: 0.5 },
              "& .MuiTab-root.dormant-tab": {
                opacity: 0.7,
              },
            }}
          >
            <Tab
              label="Shoppes"
              icon={
                <Image
                  src="/images/icons/estate_agent.png"
                  alt="Shoppe"
                  width={20}
                  height={20}
                />
              }
              iconPosition="start"
              {...a11yProps(0)}
            />
            <Tab
              label="Workers"
              icon={
                <Image
                  src="/images/icons/patron.png"
                  alt="patron"
                  width={20}
                  height={20}
                />
              }
              iconPosition="start"
              {...a11yProps(1)}
            />
            <Tab
              label="Dormant"
              iconPosition="start"
              {...a11yProps(2)}
              className="dormant-tab"
            />
          </Tabs>

          {/* Right-side controls grouped and inline */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexShrink: 0,
            }}
          >
            <LaborSummary
              ocean={userSettings.ocean}
              doubloon={userSettings.doubloon}
              labor={labor}
            />
            <OceanToggle workerCountPerOcean={workerCountPerOcean} />

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              {value === 0 && (
                <Button
                  onClick={() => setShowEmployerModal((prev) => !prev)}
                  size="small"
                  sx={{ minWidth: 36, p: 0.5 }}
                >
                  New Employer
                  <AddIcon fontSize="small" />
                </Button>
              )}
              {value === 1 && (
                <Button
                  onClick={() => setShowLaborAltModal((prev) => !prev)}
                  size="small"
                  sx={{ minWidth: 36, p: 0.5 }}
                >
                  New Worker
                  <AddIcon fontSize="small" />
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* Panels */}
        <CustomTabPanel value={value} index={0}>
          <Box
            display="flex"
            gap={1.5}
            flexWrap="wrap"
            justifyContent="center"
            sx={{ pt: 2 }}
          >
            {labor.employers.map((emp, i) => (
              <EmployerCard key={i} employer={emp} />
            ))}
          </Box>
        </CustomTabPanel>

        <CustomTabPanel value={value} index={1}>
          <WorkerTable type="Active" />
        </CustomTabPanel>

        <CustomTabPanel value={value} index={2}>
          <Box sx={{ pt: 2 }}>
            <WorkerTable type="Dormant" />
          </Box>
        </CustomTabPanel>
      </Box>

      {showLaborAltModal && (
        <WorkerForm
          onClose={() => setShowLaborAltModal(false)}
          initialOcean={userSettings.ocean}
        />
      )}
      {showEmployerModal && (
        <EmployerForm onClose={() => setShowEmployerModal(false)} />
      )}
    </Box>
  );
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
    p: 0,
  };
}
