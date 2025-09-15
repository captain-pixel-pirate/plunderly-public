import React from "react";

import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  Divider,
} from "@mui/material";

import { Recipe, ShoppeMetaData } from "@interfaces";
import shoppesIn from "@data/shoppes.json";

interface Props {
  recipe: Recipe;
  ocean: "Emerald" | "Meridian" | "Cerulean";
}

export default function LaborRatio({ recipe, ocean }: Props) {
  const shoppes = shoppesIn as ShoppeMetaData[];
  const shop = shoppes.find(
    (s) =>
      s.type.toLowerCase() === recipe.type.toLowerCase() &&
      s.grade === "Upgraded Shoppe"
  ) as ShoppeMetaData;

  const capacity = shop.maxLaborThroughput;
  const rate = ocean === "Cerulean" ? 2 : 3;
  const { basic, skilled, expert } = recipe;
  const totalCost = basic + skilled + expert;
  const totalEmployees = capacity / rate;

  // Raw fractional counts
  const rawBasic = totalEmployees * (basic / totalCost);
  const rawSkilled = totalEmployees * (skilled / totalCost);
  const rawExpert = totalEmployees * (expert / totalCost);

  // Start with raw values
  let basicEmp = rawBasic;
  let skilledEmp = rawSkilled;
  let expertEmp = rawExpert;

  // Attempt to round Expert up if Skilled can provide the labor
  const expertRoundedUp = Math.ceil(expertEmp);
  const expertNeed = (expertRoundedUp - expertEmp) * rate;
  const skilledAvailable = skilledEmp * rate;

  if (skilledAvailable >= expertNeed) {
    expertEmp = expertRoundedUp;
    skilledEmp -= expertNeed / rate;
  } else {
    expertEmp = Math.floor(expertEmp);
  }

  // Attempt to round Skilled up if Basic can provide the labor
  const skilledRoundedUp = Math.ceil(skilledEmp);
  const skilledNeed = (skilledRoundedUp - skilledEmp) * rate;
  const basicAvailable = basicEmp * rate;

  if (basicAvailable >= skilledNeed) {
    skilledEmp = skilledRoundedUp;
    basicEmp -= skilledNeed / rate;
  } else {
    skilledEmp = Math.floor(skilledEmp);
  }

  basicEmp = Math.floor(basicEmp);

  const totalAssigned = basicEmp + skilledEmp + expertEmp;
  const utilization = ((totalAssigned * rate) / capacity) * 100;

  return (
    <Box
      sx={{
        width: "100%",
        px: 1,
        pt: 1,
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <Divider sx={{ mb: 1 }} />
      <Typography variant="h6" align="center" gutterBottom>
        Suggested Labor Allocation
      </Typography>

      <Typography variant="body2" align="center">
        <strong>Shoppe:</strong>{" "}
        {shop.type.charAt(0).toUpperCase() + shop.type.slice(1)} (Upgraded)
      </Typography>
      <Typography variant="body2" align="center">
        <strong>Capacity:</strong> {capacity} labor points/hour
      </Typography>
      <Typography variant="body2" align="center" gutterBottom>
        <strong>Employee Output:</strong> {rate} points/hour
      </Typography>

      <Divider sx={{ my: 0.5 }} />

      <Typography variant="subtitle2" align="center" gutterBottom>
        Suggested Employee Distribution
      </Typography>
      <TableContainer component={Paper} elevation={1}>
        <Table size="small" aria-label="employee table">
          <TableBody>
            <TableRow>
              <TableCell>Basic</TableCell>
              <TableCell align="right">
                {basicEmp} ({rawBasic.toFixed(2)})
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Skilled</TableCell>
              <TableCell align="right">
                {skilledEmp} ({rawSkilled.toFixed(2)})
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Expert</TableCell>
              <TableCell align="right">
                {expertEmp} ({rawExpert.toFixed(2)})
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 1, textAlign: "center" }}>
        <Typography variant="body2">
          <strong>Total Assigned:</strong> {totalAssigned} employees
        </Typography>
        <Typography variant="body2">
          <strong>Shop Utilization:</strong> {utilization.toFixed(1)}%
        </Typography>
      </Box>
    </Box>
  );
}
