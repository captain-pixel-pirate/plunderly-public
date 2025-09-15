import * as React from "react";
import Image from "next/image";

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { Recipe, RecipeCommod } from "@interfaces";
import { useGlobalContext } from "@context";
import { formatNumberWithCommas, formatImagePath } from "@utils/helpers";

import EditCostsModal from "./EditCostsModal";
import { RecipeType } from "./ShoppeRecipesPage";

interface Props {
  type: RecipeType;
  recipe: Recipe;
  orders: number;
  totalCommodityCost: number;
  totalLaborCost: number;
  totalTaxCost: number;
  getCommodityTaxRate: (recipeCommod: RecipeCommod, ocean: string) => number;
  calculateTotal: ({ subTotal }: { subTotal: boolean }) => string;
}

export default function DenseTable({
  type,
  recipe,
  orders,
  totalCommodityCost,
  totalLaborCost,
  totalTaxCost,
  getCommodityTaxRate,
  calculateTotal,
}: Props) {
  const recipeCommods = recipe.commods;
  const { commods, userSettings, labor } = useGlobalContext();

  return (
    <TableContainer component={Paper}>
      <Table
        sx={{ minWidth: 400, overflow: "scroll" }}
        size="small"
        stickyHeader
      >
        <TableHead>
          <TableRow>
            <TableCell>Item</TableCell>
            <TableCell align="right">Units</TableCell>
            <TableCell align="right">Cost Per Unit</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Sub section title for COMMODITY COSTS */}
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell
              component="th"
              scope="row"
              colSpan={4}
              sx={{
                fontWeight: "bold",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                  Commodity Cost
                </Typography>
                <EditCostsModal
                  type="Button"
                  initialRecipe={recipe}
                  shoppeType={type}
                />
              </Box>
            </TableCell>
          </TableRow>
          {recipeCommods.map(({ commod, units }) => {
            const { commodname, id } = commod;
            const foundCommodity = commods.items.find(
              (c) => c.commodname === commodname
            );
            return (
              <TableRow key={id || commodname}>
                <TableCell
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Image
                    src={`/images/goods/${formatImagePath(commodname)}.png`}
                    width={15}
                    height={15}
                    alt={commodname}
                  />
                  {commodname}
                </TableCell>
                <TableCell align="right">{units * orders}</TableCell>
                <TableCell align="right">
                  {foundCommodity?.pricePerUnit}
                </TableCell>
                <TableCell align="right">
                  {formatNumberWithCommas(
                    units * orders * (foundCommodity?.pricePerUnit ?? 0)
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell component="th" scope="row" colSpan={3}>
              Total commodity cost
            </TableCell>
            <TableCell component="th" scope="row" colSpan={3} align="right">
              {formatNumberWithCommas(totalCommodityCost)}
            </TableCell>
          </TableRow>

          {/* Sub section for LABOR COSTS */}
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell
              component="th"
              scope="row"
              colSpan={4}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                Labor Costs
              </Typography>
            </TableCell>
          </TableRow>
          {recipe.basic > 0 && (
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              key="basicRow"
            >
              <TableCell
                component="th"
                scope="row"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Image
                  src={`/images/icons/${formatImagePath("basic labor")}.png`}
                  width={15}
                  height={15}
                  alt="basic labor icon"
                />
                Basic
              </TableCell>
              <TableCell component="th" scope="row" align="right">
                {recipe.basic * orders}
              </TableCell>
              <TableCell component="th" scope="row" align="right">
                {labor.laborPay[type].basic}
              </TableCell>
              <TableCell component="th" scope="row" align="right">
                {formatNumberWithCommas(
                  recipe.basic * orders * labor.laborPay[type].basic
                )}
              </TableCell>
            </TableRow>
          )}
          {recipe.skilled > 0 && (
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              key="skilledRow"
            >
              <TableCell
                component="th"
                scope="row"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Image
                  src={`/images/icons/${formatImagePath("skilled labor")}.png`}
                  width={15}
                  height={15}
                  alt="skilled labor icon"
                />
                Skilled
              </TableCell>
              <TableCell component="th" scope="row" align="right">
                {recipe.skilled * orders}
              </TableCell>
              <TableCell component="th" scope="row" align="right">
                {labor.laborPay[type].skilled}
              </TableCell>
              <TableCell component="th" scope="row" align="right">
                {formatNumberWithCommas(
                  recipe.skilled * orders * labor.laborPay[type].skilled
                )}
              </TableCell>
            </TableRow>
          )}
          {recipe.expert > 0 && (
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              key="expertRow"
            >
              <TableCell
                component="th"
                scope="row"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Image
                  src={`/images/icons/${formatImagePath("expert labor")}.png`}
                  width={15}
                  height={15}
                  alt="expert labor icon"
                />
                Expert
              </TableCell>
              <TableCell component="th" scope="row" align="right">
                {recipe.expert * orders}
              </TableCell>
              <TableCell component="th" scope="row" align="right">
                {labor.laborPay[type].expert}
              </TableCell>
              <TableCell component="th" scope="row" align="right">
                {formatNumberWithCommas(
                  recipe.expert * orders * labor.laborPay[type].expert
                )}
              </TableCell>
            </TableRow>
          )}
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell component="th" scope="row" colSpan={3}>
              Total labor cost{" "}
              <span style={{ fontSize: ".8rem", fontStyle: "italic" }}>
                ({recipe.basic + recipe.skilled + recipe.expert} hours)
              </span>
            </TableCell>
            <TableCell component="th" scope="row" colSpan={3} align="right">
              {formatNumberWithCommas(totalLaborCost)}
            </TableCell>
          </TableRow>

          {/* Sub section for TAX COSTS */}
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell
              component="th"
              scope="row"
              colSpan={4}
              sx={{
                fontWeight: "bold",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                  Tax Costs
                </Typography>
                <Typography sx={{ fontSize: ".7rem" }}>
                  subtotal before taxes:{" "}
                  {formatNumberWithCommas(totalCommodityCost + totalLaborCost)}
                </Typography>
              </Box>
            </TableCell>
          </TableRow>
          {/* Tax costs for commodities */}
          {recipeCommods.map(({ commod, units }) => {
            const { commodname, id } = commod;
            const taxRate = getCommodityTaxRate(
              { commod, units },
              userSettings.ocean
            );
            return (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                key={id || commodname}
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Image
                    src={`/images/goods/${formatImagePath(commodname)}.png`}
                    width={15}
                    height={15}
                    alt={commodname}
                  />
                  {commodname} tax
                </TableCell>
                <TableCell component="th" scope="row" align="right">
                  {units * orders}
                </TableCell>
                <TableCell component="th" scope="row" align="right">
                  {taxRate}
                </TableCell>
                <TableCell component="th" scope="row" align="right">
                  {formatNumberWithCommas(taxRate * units * orders)}
                </TableCell>
              </TableRow>
            );
          })}
          {/* Tax costs for labor */}
          {recipe.basic > 0 && (
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              key="basicLaborRow"
            >
              <TableCell
                component="th"
                scope="row"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Image
                  src={`/images/icons/${formatImagePath("basic_labor")}.png`}
                  width={15}
                  height={15}
                  alt="basic labor icon"
                />
                Basic labor tax
              </TableCell>
              <TableCell component="th" scope="row" align="right">
                {recipe.basic * orders}
              </TableCell>
              <TableCell component="th" scope="row" align="right">
                {labor.laborTax.basic}
              </TableCell>
              <TableCell component="th" scope="row" align="right">
                {formatNumberWithCommas(
                  recipe.basic * orders * labor.laborTax.basic
                )}
              </TableCell>
            </TableRow>
          )}
          {recipe.skilled > 0 && (
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              key="skilledLaborRow"
            >
              <TableCell
                component="th"
                scope="row"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Image
                  src={`/images/icons/${formatImagePath("skilled_labor")}.png`}
                  width={15}
                  height={15}
                  alt="skilled labor icon"
                />
                Skilled labor tax
              </TableCell>
              <TableCell component="th" scope="row" align="right">
                {recipe.skilled * orders}
              </TableCell>
              <TableCell component="th" scope="row" align="right">
                {labor.laborTax.skilled}
              </TableCell>
              <TableCell component="th" scope="row" align="right">
                {formatNumberWithCommas(
                  recipe.skilled * orders * labor.laborTax.skilled
                )}
              </TableCell>
            </TableRow>
          )}
          {recipe.expert > 0 && (
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              key="expertLaborRow"
            >
              <TableCell
                component="th"
                scope="row"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Image
                  src={`/images/icons/${formatImagePath("expert_labor")}.png`}
                  width={15}
                  height={15}
                  alt="expert labor icon"
                />
                Expert labor tax
              </TableCell>
              <TableCell component="th" scope="row" align="right">
                {recipe.expert * orders}
              </TableCell>
              <TableCell component="th" scope="row" align="right">
                {labor.laborTax.expert}
              </TableCell>
              <TableCell component="th" scope="row" align="right">
                {formatNumberWithCommas(
                  recipe.expert * orders * labor.laborTax.expert
                )}
              </TableCell>
            </TableRow>
          )}
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell component="th" scope="row" colSpan={3}>
              Total tax cost
            </TableCell>
            <TableCell component="th" scope="row" colSpan={1} align="right">
              {formatNumberWithCommas(totalTaxCost)}
            </TableCell>
          </TableRow>

          {userSettings.ocean !== "Cerulean" && (
            <>
              {/* Subtotal */}
              {recipe.doubloons > 0 ? (
                <>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" colSpan={3}>
                      Subtotal
                    </TableCell>
                    <TableCell
                      component="th"
                      scope="row"
                      colSpan={1}
                      align="right"
                    >
                      {calculateTotal({ subTotal: true })}
                    </TableCell>
                  </TableRow>
                  {/* Doubloons */}
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      Doubloons
                    </TableCell>
                    <TableCell component="th" scope="row" align="right">
                      {recipe.doubloons * orders}
                    </TableCell>
                    <TableCell component="th" scope="row" align="right">
                      {userSettings.doubloon}
                    </TableCell>
                    <TableCell component="th" scope="row" align="right">
                      {formatNumberWithCommas(
                        recipe.doubloons * orders * userSettings.doubloon
                      )}
                    </TableCell>
                  </TableRow>
                </>
              ) : null}
            </>
          )}

          <TableRow
            sx={{
              "&:last-child td, &:last-child th": { border: 0 },
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              fontSize: "bold",
            }}
          >
            <TableCell component="th" scope="row" colSpan={3}>
              Total
            </TableCell>
            <TableCell component="th" scope="row" colSpan={1} align="right">
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <span>{calculateTotal({ subTotal: false })}</span>
                <Image
                  src={`/images/icons/${formatImagePath("poe")}.png`}
                  width={15}
                  height={15}
                  alt="basic labor icon"
                />
              </Box>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
