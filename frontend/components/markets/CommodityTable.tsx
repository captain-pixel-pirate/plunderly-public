"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import Image from "next/image";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Radio,
  Box,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";

import { BuySellPair } from "@interfaces";
import { formatImagePath } from "@utils/helpers";

interface Props {
  combinedBuySell: BuySellPair[];
}

export default function DenseTable({ combinedBuySell }: Props) {
  const [sortBy, setSortBy] = useState<"buy" | "sell">("buy");
  const [selectedCommodity, setSelectedCommodity] = useState<string>("All");

  const filteredData = useMemo(() => {
    if (selectedCommodity === "All") return combinedBuySell;
    return combinedBuySell.filter(
      (item) => item.commodity === selectedCommodity
    );
  }, [combinedBuySell, selectedCommodity]);

  const groupedAndSorted = useMemo(() => {
    const groups = new Map<string, BuySellPair[]>();

    for (const item of filteredData) {
      if (!groups.has(item.commodity)) {
        groups.set(item.commodity, []);
      }
      groups.get(item.commodity)!.push(item);
    }

    const sortedGroups = Array.from(groups.values()).map((group) => {
      const sortedGroup = [...group].sort((a, b) => {
        const aVal = sortBy === "buy" ? a.buyPrice : a.sellPrice;
        const bVal = sortBy === "buy" ? b.buyPrice : b.sellPrice;

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        return sortBy === "buy" ? bVal - aVal : aVal - bVal;
      });

      return sortedGroup;
    });

    return sortedGroups.flat();
  }, [filteredData, sortBy]);

  let lastCommodity: string | null = null;
  let groupToggle = false;

  const uniqueCommodities = useMemo(() => {
    const set = new Set(combinedBuySell.map((item) => item.commodity));
    return ["All", ...Array.from(set).sort()];
  }, [combinedBuySell]);

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          mt: 1,
        }}
      >
        <FormControl size="small" sx={{ minWidth: 200, mr: 2 }}>
          <InputLabel id="commodity-select-label">
            Filter by Commodity
          </InputLabel>
          <Select
            labelId="commodity-select-label"
            value={selectedCommodity}
            label="Filter by Commodity"
            onChange={(e) => setSelectedCommodity(e.target.value)}
          >
            {uniqueCommodities.map((commodity) => (
              <MenuItem key={commodity} value={commodity}>
                {commodity}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl component="fieldset" size="small">
          <RadioGroup
            row
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "buy" | "sell")}
            name="sort-by-radio"
          >
            <FormControlLabel
              value="buy"
              control={<Radio size="small" />}
              label="Buy Price"
            />
            <FormControlLabel
              value="sell"
              control={<Radio size="small" />}
              label="Sell Price"
            />
          </RadioGroup>
        </FormControl>
      </Box>

      <Box
        sx={{
          pt: 1,
          width: "100%",
          overflowX: "auto",
          maxWidth: "100vw",
        }}
      >
        <TableContainer component={Paper}>
          <Table
            sx={{ minWidth: 390 }}
            size="small"
            aria-label="a dense table"
            stickyHeader
          >
            <TableHead>
              <TableRow>
                <TableCell>Commodity</TableCell>
                <TableCell align="right">Trading Outlet</TableCell>
                <TableCell align="right">Buy price</TableCell>
                <TableCell align="right">Will buy</TableCell>
                <TableCell align="right">Sell price</TableCell>
                <TableCell align="right">Will sell</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {groupedAndSorted.length ? (
                groupedAndSorted.map((row, i) => {
                  const isNewGroup = row.commodity !== lastCommodity;
                  if (isNewGroup) {
                    groupToggle = !groupToggle;
                    lastCommodity = row.commodity;
                  }

                  return (
                    <TableRow
                      key={i}
                      sx={{
                        backgroundColor: groupToggle
                          ? "rgba(255, 255, 255, 0.1)"
                          : "transparent",
                      }}
                    >
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Image
                          src={`/images/goods/${formatImagePath(
                            row.commodity
                          )}.png`}
                          width={20}
                          height={20}
                          alt={row.commodity}
                        />
                        {row.commodity}
                      </TableCell>
                      <TableCell align="right">{row.tradingOutlet}</TableCell>
                      <TableCell align="right">{row.buyPrice ?? "-"}</TableCell>
                      <TableCell align="right">{row.willBuy ?? "-"}</TableCell>
                      <TableCell align="right">
                        {row.sellPrice ?? "-"}
                      </TableCell>
                      <TableCell sx={{ paddingLeft: 1 }} align="right">
                        {row.willSell ?? "-"}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
