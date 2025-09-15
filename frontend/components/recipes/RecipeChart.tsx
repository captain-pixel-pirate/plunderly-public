import * as React from "react";

import {
  pieArcClasses,
  PieChart,
  PieChartProps,
  pieClasses,
} from "@mui/x-charts/PieChart";
import { Box, Typography } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";

import { useGlobalContext } from "@context/GlobalContext";
import { RecipeType } from "./ShoppeRecipesPage";
import { Recipe, RecipeCommod } from "@interfaces";

interface Props {
  type: RecipeType;
  recipe: Recipe;
  orders: number;
  calculateTotalCommodityCost: () => number;
  calculateTotalLaborCosts: () => number;
  calculateTotalTaxCost: () => number;
  calculateDoubloonCost: () => number;
  getCommodityTaxRate: (recipeCommod: RecipeCommod, ocean: string) => number;
}

export default function RecipePieChart({
  type,
  recipe,
  orders,
  calculateTotalCommodityCost,
  calculateTotalLaborCosts,
  calculateTotalTaxCost,
  calculateDoubloonCost,
  getCommodityTaxRate,
}: Props) {
  const { commods, labor, userSettings } = useGlobalContext();
  const recipeCommods = recipe.commods;

  const pieColors = ["#7cb72a", "#AB83A1", "#FFBF00", "#FF6F61"];
  const commodityData = recipeCommods.map((rc) => {
    const foundCommodity = commods.items.find(
      (c) => c.commodname === rc.commod.commodname
    );
    return {
      label: rc.commod.commodname,
      value: rc.units * orders * (foundCommodity?.pricePerUnit ?? 0),
      color: pieColors[0],
    };
  });

  const commodityTaxCostData = recipeCommods.map((rc) => {
    const taxRate = getCommodityTaxRate(
      { commod: rc.commod, units: rc.units },
      userSettings.ocean
    );

    return {
      label: rc.commod.commodname,
      value: taxRate * rc.units * orders,
      color: pieColors[2],
    };
  });

  const data1 = [
    {
      label: "A: Commodity Costs",
      value: calculateTotalCommodityCost(),
      color: pieColors[0],
    },
    {
      label: "B: Labor Costs",
      value: calculateTotalLaborCosts(),
      color: pieColors[1],
    },
    {
      label: "C: Tax Costs",
      value: calculateTotalTaxCost(),
      color: pieColors[2],
    },
    {
      label: "D: Doubloon Costs",
      value: calculateDoubloonCost(),
      color: pieColors[3],
    },
  ];

  const total1 = data1.reduce((sum, item) => sum + item.value, 0);
  const data1WithPercentage = data1.map((item) => ({
    ...item,
    label: `${item.label} (${((item.value / total1) * 100).toFixed(1)}%)`,
  }));

  const data2 = [
    ...commodityData,
    ...[
      {
        label: "B1: Basic Labor",
        value: recipe.basic * orders * labor.laborPay[type].basic,
        color: pieColors[1],
      },
      {
        label: "B2: Skilled Labor",
        value: recipe.skilled * orders * labor.laborPay[type].skilled,
        color: pieColors[1],
      },
      {
        label: "B3: Expert Labor",
        value: recipe.expert * orders * labor.laborPay[type].expert,
        color: pieColors[1],
      },
    ],
    ...commodityTaxCostData,
    ...[
      {
        label: "C1: Basic Labor Tax",
        value: recipe.basic * orders * labor.laborTax.basic,
        color: pieColors[2],
      },
      {
        label: "C2: Skilled Labor Tax",
        value: recipe.skilled * orders * labor.laborTax.skilled,
        color: pieColors[2],
      },
      {
        label: "C3: Expert Labor Tax",
        value: recipe.expert * orders * labor.laborTax.expert,
        color: pieColors[2],
      },
    ],
    {
      label: "Doubloon",
      value: calculateDoubloonCost(),
      color: pieColors[3],
    },
  ];

  const total2 = data2.reduce((sum, item) => sum + item.value, 0);

  const data2WithPercentage = data2.map((item) => ({
    ...item,
    label: `${item.label} (${((item.value / total2) * 100).toFixed(1)}%)`,
  }));

  const settings = {
    series: [
      {
        innerRadius: 0,
        outerRadius: 80,
        data: data1WithPercentage,
        highlightScope: { fade: "global", highlight: "item" },
        arcLabel: (item) =>
          item.value === 0 ? "" : item.label ? item.label.charAt(0) : "",
      },
      {
        id: "outer",
        innerRadius: 100,
        outerRadius: 120,
        data: data2WithPercentage,
        highlightScope: { fade: "global", highlight: "item" },
      },
    ],
    height: 300,
    hideLegend: true,
  } satisfies PieChartProps;

  const renderLegend = () => {
    const legendItems = [...data1WithPercentage];

    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        {legendItems.map((item, idx) =>
          item.value ? (
            <Box
              key={idx}
              display="flex"
              justifyContent="center"
              alignItems="center"
              gap={0.5}
            >
              <CircleIcon sx={{ fontSize: 12, color: item.color }} />
              <Typography variant="body2">{item.label}</Typography>
            </Box>
          ) : null
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        pt: 1,
        justifyContent: "center",
      }}
    >
      <Typography textAlign="center">Recipe Pie Chart</Typography>
      <PieChart
        {...settings}
        sx={{
          [`.${pieClasses.series}[data-series="outer"] .${pieArcClasses.root}`]:
            {
              opacity: 0.6,
            },
          display: "flex",
          justifyContent: "center",
        }}
        slotProps={{
          pieArcLabel: { style: { fill: "black" } },
        }}
      />
      {renderLegend()}
    </Box>
  );
}
