"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ButtonBase,
  TextField,
} from "@mui/material";
import { FaRegArrowAltCircleRight } from "react-icons/fa";

import { RecipeTable } from "@components/recipes";
import { useGlobalContext } from "@context";
import { Recipe, RecipeCommod } from "@interfaces";
import { formatNumberWithCommas, formatImagePath } from "@utils/helpers";
import { useAvailableHeight } from "@hooks";
import recipes from "@data/recipes.json";
import RecipeChart from "./RecipeChart";
import LaborRatio from "./LaborRatio";
import vesselsJson from "@data/vessels.json";

export type RecipeType =
  | "shipyard"
  | "ironMonger"
  | "apothecary"
  | "distillery"
  | "weavery";

const recipeTypes: RecipeType[] = [
  "shipyard",
  "ironMonger",
  "apothecary",
  "distillery",
  "weavery",
];

const groupedRecipes = recipeTypes.map((type) => ({
  type,
  recipes: recipes.filter(
    (recipe) => recipe.type.toLowerCase() === type.toLocaleLowerCase()
  ) as Recipe[],
}));

const STORAGE_KEY = "pp.recipes.selection";

export default function Recipes() {
  const availableHeight = useAvailableHeight();
  const { commods, userSettings, labor } = useGlobalContext();

  const [selectedRecipe, setSelectedRecipeType] = useState<{
    type: RecipeType;
    recipes: Recipe[];
    selectedRecipe: Recipe;
    orders: number;
  }>({
    type: "shipyard",
    recipes: groupedRecipes[0].recipes,
    selectedRecipe: groupedRecipes[0].recipes[0],
    orders: 1,
  });

  const recipe = selectedRecipe.selectedRecipe;

  const getCommodityTaxRate = (recipeCommod: RecipeCommod, ocean: string) => {
    const commodWithTax = commods.items.find(
      (c) => c.commodname === recipeCommod.commod.commodname
    );
    if (ocean === "Emerald") {
      return commodWithTax?.emeraldtax ?? 0;
    } else if (ocean === "Meridian") {
      return commodWithTax?.meridiantax ?? 0;
    } else {
      return commodWithTax?.ceruleantax ?? 0;
    }
  };

  const calculateTotalCommodityCost = () => {
    const totalCost = recipe.commods.reduce((total, rc) => {
      const commodWithCost = commods.items.find(
        (commod) => commod.commodname === rc.commod.commodname
      );
      return total + rc.units * (commodWithCost?.pricePerUnit ?? 0);
    }, 0);
    return totalCost * selectedRecipe.orders;
  };

  const calculateTotalLaborCosts = () => {
    const basicCost = recipe.basic * labor.laborPay[selectedRecipe.type].basic;
    const skilledCost =
      recipe.skilled * labor.laborPay[selectedRecipe.type].skilled;
    const expertCost =
      recipe.expert * labor.laborPay[selectedRecipe.type].expert;

    return (basicCost + skilledCost + expertCost) * selectedRecipe.orders;
  };

  const calculateTotalTaxCost = () => {
    const commodityTaxTotalCost = recipe.commods.reduce((total, rc) => {
      const commodWithTax = commods.items.find(
        (commod) => commod.commodname === rc.commod.commodname
      );
      if (userSettings.ocean === "Emerald") {
        return total + rc.units * (commodWithTax?.emeraldtax ?? 0);
      } else if (userSettings.ocean === "Meridian") {
        return total + rc.units * (commodWithTax?.meridiantax ?? 0);
      } else {
        return total + rc.units * (commodWithTax?.ceruleantax ?? 0);
      }
    }, 0);

    const laborTotalTaxCost =
      recipe.basic * labor.laborTax.basic +
      recipe.skilled * labor.laborTax.skilled +
      recipe.expert * labor.laborTax.expert;

    return (commodityTaxTotalCost + laborTotalTaxCost) * selectedRecipe.orders;
  };

  const calculateTotal = ({ subTotal }: { subTotal: boolean }) => {
    const orderDoubloons =
      userSettings.ocean === "Cerulean"
        ? 0
        : recipe.doubloons * selectedRecipe.orders * userSettings.doubloon;
    if (subTotal) {
      return formatNumberWithCommas(
        calculateTotalCommodityCost() +
          calculateTotalLaborCosts() +
          calculateTotalTaxCost()
      );
    } else {
      return formatNumberWithCommas(
        calculateTotalCommodityCost() +
          calculateTotalLaborCosts() +
          calculateTotalTaxCost() +
          orderDoubloons
      );
    }
  };

  const calculateDoubloonCost = () => {
    return userSettings.ocean === "Cerulean"
      ? 0
      : recipe.doubloons * selectedRecipe.orders * userSettings.doubloon;
  };

  const costPerRecipeUnit = () => {
    const orderDoubloons =
      userSettings.ocean === "Cerulean"
        ? 0
        : recipe.doubloons * selectedRecipe.orders * userSettings.doubloon;

    const totalCost =
      calculateTotalCommodityCost() +
      calculateTotalLaborCosts() +
      calculateTotalTaxCost() +
      orderDoubloons;

    return totalCost / (selectedRecipe.orders * recipe.units);
  };

  const renderRecipes = () => {
    if (selectedRecipe.type === "shipyard") {
      const unOrganizedRecipes: Recipe[] = [];
      const organizedRecipes: Record<string, Recipe[]> = {
        small: [],
        medium: [],
        large: [],
      };

      selectedRecipe.recipes.map((R) => {
        const shipMetadataReference = vesselsJson.find((v) =>
          R.item.toLowerCase().includes(v.name.toLowerCase())
        );
        if (shipMetadataReference) {
          const shipSize = shipMetadataReference.size;
          organizedRecipes[shipSize].push(R);
        } else {
          unOrganizedRecipes.push(R);
        }
      });

      const combinedRecipes = [
        ...Object.entries(organizedRecipes).flatMap(([size, recipes]) => [
          <MenuItem key={size} disabled>
            {size.charAt(0).toUpperCase() + size.slice(1)} Ships
          </MenuItem>,
          ...recipes.map((recipe) => (
            <MenuItem
              key={recipe.item}
              value={recipe.item}
              onClick={() => {
                setSelectedRecipeType({
                  ...selectedRecipe,
                  selectedRecipe: recipe,
                });
              }}
            >
              {recipe.item.charAt(0).toUpperCase() + recipe.item.slice(1)}
            </MenuItem>
          )),
        ]),
        <MenuItem key="unorganized" disabled>
          Unorganized
        </MenuItem>,
        ...unOrganizedRecipes.map((recipe) => (
          <MenuItem
            key={recipe.item}
            value={recipe.item}
            onClick={() => {
              setSelectedRecipeType({
                ...selectedRecipe,
                selectedRecipe: recipe,
              });
            }}
          >
            {recipe.item.charAt(0).toUpperCase() + recipe.item.slice(1)}
          </MenuItem>
        )),
      ];
      return combinedRecipes;
    }

    return selectedRecipe.recipes.map((recipe) => (
      <MenuItem
        key={recipe.item}
        value={recipe.item}
        onClick={() => {
          setSelectedRecipeType({
            ...selectedRecipe,
            selectedRecipe: recipe,
          });
        }}
      >
        {recipe.item.charAt(0).toUpperCase() + recipe.item.slice(1)}
      </MenuItem>
    ));
  };

  useEffect(() => {
    // guard: window only on client
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw) as {
        type?: RecipeType;
        item?: string;
        orders?: number;
      };

      const type: RecipeType = recipeTypes.includes(saved.type as RecipeType)
        ? (saved.type as RecipeType)
        : "shipyard";

      // Find the recipe group and the specific recipe by item name
      const group =
        groupedRecipes.find((g) => g.type === type) ?? groupedRecipes[0];
      const fallbackRecipe = group.recipes[0];
      const foundRecipe =
        group.recipes.find(
          (r) => r.item.toLowerCase() === (saved.item ?? "").toLowerCase()
        ) ?? fallbackRecipe;

      const orders =
        typeof saved.orders === "number" &&
        saved.orders >= 1 &&
        saved.orders <= 1000
          ? Math.floor(saved.orders)
          : 1;

      setSelectedRecipeType({
        type,
        recipes: group.recipes,
        selectedRecipe: foundRecipe,
        orders,
      });
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const payload = {
      type: selectedRecipe.type,
      item: selectedRecipe.selectedRecipe.item,
      orders: selectedRecipe.orders,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }, [
    selectedRecipe.type,
    selectedRecipe.selectedRecipe.item,
    selectedRecipe.orders,
  ]);

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 2,
        height: availableHeight,
        pb: 4,
        overflow: "scroll",
        backgroundImage: `
          radial-gradient(1200px 600px at 50% -10%, rgba(255,255,255,0.06), transparent 60%),
          radial-gradient(800px 400px at 50% 120%, rgba(255,255,255,0.04), transparent 60%),
          linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02)),
          repeating-linear-gradient(0deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 1px, transparent 1px, transparent 10px)
        `,
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
          mt: 2,
          minHeight: "60vh",
        }}
      >
        <Typography variant="h1" sx={{ fontSize: "2rem", pb: 2 }}>
          Recipes
        </Typography>

        <Box sx={{ display: "flex", gap: 1, pb: 1, flexWrap: "wrap" }}>
          {groupedRecipes.map((group) => (
            <ButtonBase
              key={group.type}
              onClick={() => {
                setSelectedRecipeType({
                  ...selectedRecipe,
                  type: group.type,
                  recipes: group.recipes,
                  selectedRecipe: group.recipes[0],
                });
              }}
              sx={{
                borderBottom:
                  selectedRecipe.type === group.type
                    ? "2px solid #D4AF37"
                    : "2px solid transparent",
                padding: 0.5,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Box
                component="img"
                src={`/images/icons/${formatImagePath(group.type)}.png`}
                alt={group.type}
                sx={{ width: 30, height: 30 }}
              />
              <Typography sx={{ fontSize: ".7rem" }}>{group.type}</Typography>
            </ButtonBase>
          ))}
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            pb: 1,
            justifyContent: "center",
            alignItems: "center",
            maxWidth: "375px",
          }}
        >
          <FormControl
            sx={{ m: 1, minWidth: 120 }}
            size="small"
            variant="standard"
          >
            <InputLabel id="recipe-select-label">Recipe</InputLabel>
            <Select
              labelId="recipe-select-label"
              id="recipe-select"
              value={selectedRecipe.selectedRecipe.item}
              label="Recipe"
            >
              {renderRecipes()}
            </Select>
          </FormControl>

          <TextField
            label="Orders"
            type="number"
            variant="standard"
            size="small"
            value={selectedRecipe.orders}
            onChange={(e) => {
              const value = Number(e.target.value);
              setSelectedRecipeType({
                ...selectedRecipe,
                orders: value < 1 ? 1 : value > 1000 ? 1000 : value,
              });
            }}
          />

          <Box
            component="img"
            src={`/images/goods/${formatImagePath(
              selectedRecipe.selectedRecipe.item
            )}.png`}
            alt={selectedRecipe.selectedRecipe.item}
            sx={{ width: 60, height: 40, pb: 0.5 }}
          />
        </Box>

        <Box>
          <Typography
            textAlign={"center"}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              pb: 1,
            }}
          >
            <span>
              📦 {selectedRecipe.orders} order
              {selectedRecipe.orders > 1 ? "s" : ""}
            </span>{" "}
            <FaRegArrowAltCircleRight />{" "}
            <span>
              {selectedRecipe.orders * recipe.units} unit
              {selectedRecipe.orders * recipe.units > 1 ? "s" : ""}
            </span>{" "}
            <FaRegArrowAltCircleRight />
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <Image
                src={`/images/icons/${formatImagePath("poe")}.png`}
                width={15}
                height={15}
                alt="basic labor icon"
              />{" "}
              <span>{formatNumberWithCommas(costPerRecipeUnit())} each</span>
            </span>
          </Typography>
          <RecipeTable
            type={selectedRecipe.type}
            recipe={selectedRecipe.selectedRecipe}
            orders={selectedRecipe.orders}
            getCommodityTaxRate={getCommodityTaxRate}
            totalCommodityCost={calculateTotalCommodityCost()}
            totalLaborCost={calculateTotalLaborCosts()}
            totalTaxCost={calculateTotalTaxCost()}
            calculateTotal={calculateTotal}
          />
        </Box>
      </Box>

      {/* Pie Chart Container */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          mt: 4,
        }}
      >
        <RecipeChart
          type={selectedRecipe.type}
          recipe={recipe}
          orders={selectedRecipe.orders}
          calculateTotalCommodityCost={calculateTotalCommodityCost}
          calculateTotalLaborCosts={calculateTotalLaborCosts}
          calculateTotalTaxCost={calculateTotalTaxCost}
          calculateDoubloonCost={calculateDoubloonCost}
          getCommodityTaxRate={getCommodityTaxRate}
        />
        <LaborRatio ocean={userSettings.ocean} recipe={recipe} />
      </Box>
    </Box>
  );
}
