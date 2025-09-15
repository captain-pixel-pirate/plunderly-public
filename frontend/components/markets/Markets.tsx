"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import type { SelectChangeEvent } from "@mui/material/Select";
import {
  Box,
  MenuItem,
  Select,
  ListSubheader,
  Typography,
  InputLabel,
  FormControl,
} from "@mui/material";
import EmojiFlagsIcon from "@mui/icons-material/EmojiFlags";
import GroupsIcon from "@mui/icons-material/Groups";
import Chip from "@mui/material/Chip";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { useGlobalContext } from "@context";
import {
  Ocean,
  Archipelago,
  Island,
  BuySellPair,
  CommodClass,
} from "@interfaces";
import { useMarketData } from "@hooks";
import { CommodityTable } from "@components/markets";
import { formatDaysAgo } from "@utils/helpers";

export default function CommodityMarket() {
  const { oceans, commods } = useGlobalContext();

  const [selection, setSelection] = useState<{
    ocean: Ocean;
    archipelago: Archipelago;
    island: Island;
    commodclass: CommodClass;
  }>(() => {
    const saved = localStorage.getItem("marketSelection");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        console.warn("Failed to parse saved market selection");
      }
    }

    const defaultOcean = oceans[0];
    const defaultArch =
      defaultOcean.archipelagos.find((a) => a.name.toLowerCase() === "gull") ||
      defaultOcean.archipelagos[0];

    const defaultIsland =
      defaultArch.islands.find(
        (i) => i.islandname.toLowerCase() === "admiral island"
      ) || defaultArch.islands[0];

    return {
      ocean: defaultOcean,
      archipelago: defaultArch,
      island: defaultIsland,
      commodclass: commods.commodclasses[0],
    };
  });

  useEffect(() => {
    localStorage.setItem("marketSelection", JSON.stringify(selection));
  }, [selection]);

  const { buys, sells, upload } = useMarketData(
    selection.ocean,
    selection.island,
    selection.commodclass
  );

  const uploadTimestamp = upload?.uploadTimestamp
    ? formatDaysAgo(upload.uploadTimestamp)
    : null;
  const dataAgeLabel = `Uploaded: ${
    uploadTimestamp
      ? uploadTimestamp === "0 days ago"
        ? "Today"
        : uploadTimestamp
      : "Unknown"
  }`;

  const handleOceanChange = (e: SelectChangeEvent<string>) => {
    const selectedOcean = oceans.find((o) => o.name === e.target.value);
    if (selectedOcean) {
      setSelection({
        ocean: selectedOcean,
        archipelago: selectedOcean.archipelagos[0],
        island: selectedOcean.archipelagos[0].islands[0],
        commodclass: commods.commodclasses[0],
      });
    }
  };

  const handleIslandChange = (e: SelectChangeEvent<string>) => {
    const islandName = e.target.value;

    let foundIsland: Island | undefined;
    let parentArch: Archipelago | undefined;

    for (const arch of selection.ocean.archipelagos) {
      const match = arch.islands.find((i) => i.islandname === islandName);
      if (match) {
        foundIsland = match;
        parentArch = arch;
        break;
      }
    }

    if (foundIsland && parentArch) {
      setSelection((prev) => ({
        ...prev,
        archipelago: parentArch,
        island: foundIsland,
        commodclass: commods.commodclasses[0],
      }));
    }
  };

  const handleCommodClassChange = (e: SelectChangeEvent<number>) => {
    const selectedCommodClass = commods.commodclasses.find(
      (c) => c.id === e.target.value
    );
    if (selectedCommodClass) {
      setSelection((prev) => ({
        ...prev,
        commodclass: selectedCommodClass,
      }));
    }
  };

  const combinedBuySell: BuySellPair[] = (() => {
    const map = new Map<string, BuySellPair>();

    for (const buy of buys || []) {
      const key = `${buy.stallid}-${buy.commod.commodname}`;
      map.set(key, {
        commodity: buy.commod.commodname,
        tradingOutlet: buy.stall.stallname,
        buyPrice: buy.price,
        willBuy: buy.qty,
        sellPrice: null,
        willSell: null,
        commodityClass: buy.commod.commodclass.commodclass,
      });
    }

    for (const sell of sells || []) {
      const key = `${sell.stallid}-${sell.commod.commodname}`;
      if (map.has(key)) {
        const existing = map.get(key)!;
        existing.sellPrice = sell.price;
        existing.willSell = sell.qty;
      } else {
        map.set(key, {
          commodity: sell.commod.commodname,
          tradingOutlet: sell.stall.stallname,
          buyPrice: null,
          willBuy: null,
          sellPrice: sell.price,
          willSell: sell.qty,
          commodityClass: sell.commod.commodclass.commodclass,
        });
      }
    }

    return Array.from(map.values());
  })();

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: 1,
          padding: 2,
          minHeight: "60vh",
          maxHeight: "80vh",
        }}
      >
        <Box
          sx={{
            display: "flex",
            mb: 1,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="h1"
            sx={{ fontSize: "2rem", textAlign: "center" }}
          >
            Dockside Market
          </Typography>
          <Chip
            icon={<AccessTimeIcon sx={{ fontSize: 18 }} />}
            label={dataAgeLabel}
            size="small"
            variant="outlined"
            color="info"
            sx={{
              borderRadius: 2,
              fontSize: 12,
              height: 26,
              "& .MuiChip-label": { px: 1.25 },
              boxShadow: 1,
              backdropFilter: "blur(6px)",
            }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            width: "100%",
            flexWrap: "wrap",
          }}
        >
          {/* Start of metadata for island */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              pb: 2,
              alignItems: "center",
            }}
          >
            {/* Flag */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <EmojiFlagsIcon sx={{ fontSize: 20 }} />
                <a
                  href={`https://${selection.ocean.name}.puzzlepirates.com/${selection.island.flag_link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  {selection.island.flag}
                </a>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Image
                  src="/images/icons/governor.png"
                  width={20}
                  height={20}
                  alt="governor"
                />
                <a
                  href={`https://${selection.ocean.name}.puzzlepirates.com/${selection.island.governor_link}`}
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  {selection.island.governor}
                </a>
              </Box>
            </Box>

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <GroupsIcon sx={{ fontSize: 20 }} />
                <span style={{ fontSize: 14 }}>
                  {selection.island.population}
                </span>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Image
                  src="/images/icons/market.png"
                  width={20}
                  height={20}
                  alt="market"
                />
                <span style={{ fontSize: 14 }}>
                  {selection.island.spawns.map((s) => s.commodname).join(", ")}
                </span>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            mb: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="ocean-select-label">Ocean</InputLabel>
            <Select value={selection.ocean.name} onChange={handleOceanChange}>
              {oceans.map((ocean) => (
                <MenuItem key={ocean.name} value={ocean.name}>
                  {ocean.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="island-select-label">Island</InputLabel>
            <Select
              value={selection.island.islandname}
              onChange={handleIslandChange}
              labelId="island-select-label"
            >
              {selection.ocean.archipelagos.map((arch) => [
                <ListSubheader key={`header-${arch.name}`}>
                  {arch.name}
                </ListSubheader>,
                arch.islands.map((island) => (
                  <MenuItem key={island.islandname} value={island.islandname}>
                    {island.islandname}{" "}
                    <span style={{ fontSize: 10, paddingLeft: "1px" }}>
                      ({island.size})
                    </span>
                  </MenuItem>
                )),
              ])}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="market-data-select-label">
              Commodity Class
            </InputLabel>
            <Select
              value={selection.commodclass.id}
              onChange={handleCommodClassChange}
              labelId="market-data-select-label"
            >
              {commods.commodclasses.map((commodclass) => (
                <MenuItem key={commodclass.id} value={commodclass.id}>
                  {commodclass.commodclass}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <CommodityTable combinedBuySell={combinedBuySell} />
      </Box>
    </Box>
  );
}
