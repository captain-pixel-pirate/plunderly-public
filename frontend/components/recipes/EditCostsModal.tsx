import * as React from "react";
import Image from "next/image";

import {
  Box,
  Button,
  Typography,
  Modal,
  MenuItem,
  TextField,
  Tabs,
  Tab,
  Paper,
  Divider,
  Stack,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";

import { useGlobalContext } from "@context";
import { formatImagePath } from "@utils/helpers";
import { Recipe } from "@interfaces";
import { RecipeType } from "./ShoppeRecipesPage";

const containerStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  maxHeight: "80vh",
  overflowY: "auto",
};

interface Props {
  type: "Button" | "MenuItem";
  shoppeType: RecipeType;
  initialRecipe?: Recipe;
}

const recipeTypes: RecipeType[] = [
  "shipyard",
  "ironMonger",
  "apothecary",
  "distillery",
  "weavery",
];

export default function EditCostsModal({
  shoppeType,
  type,
  initialRecipe,
}: Props) {
  const {
    commods,
    setCommods,
    userSettings,
    setUserSettings,
    labor,
    setLabor,
  } = useGlobalContext();

  const { items: commodItems, commodclasses: commodClasses } = commods;
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const hasInitialRecipe = !!initialRecipe;
  const defaultTab = React.useMemo(
    () =>
      hasInitialRecipe ? "recipe" : commodClasses[0]?.id.toString() ?? "0",
    [hasInitialRecipe, commodClasses]
  );
  const [selectedTab, setSelectedTab] = React.useState<string>(defaultTab);
  const [currentShoppeType, setCurrentShoppeType] = React.useState<RecipeType>(
    () => {
      if (initialRecipe) {
        return initialRecipe.type;
      } else {
        return shoppeType;
      }
    }
  );

  React.useEffect(() => {
    setCurrentShoppeType(shoppeType);
  }, [shoppeType]);

  const initialRecipeCommods = initialRecipe?.commods || [];

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handlePriceChange = (id: number, newPrice: number) => {
    if (newPrice < 0 || isNaN(newPrice)) return;
    setCommods((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, pricePerUnit: newPrice } : item
      ),
    }));
  };

  const handleDoubloonChange = (value: number) => {
    if (value < 0 || isNaN(value)) return;
    setUserSettings((prev) => ({ ...prev, doubloon: value }));
  };

  let baseItems: typeof commodItems = [];

  if (selectedTab === "recipe") {
    baseItems = commodItems.filter((ci) =>
      initialRecipeCommods.some((rc) => rc.commod.id === ci.id)
    );
  } else if (selectedTab === "0") {
    baseItems = commodItems;
  } else {
    baseItems = commodItems.filter(
      (ci) => ci.commodclassid.toString() === selectedTab
    );
  }

  const itemsToShow = baseItems.filter((ci) =>
    ci.commodname.toLowerCase().includes(search.toLowerCase())
  );

  React.useEffect(() => {
    setSelectedTab(search.trim() ? "0" : defaultTab);
  }, [search, defaultTab]);

  return (
    <>
      {type === "Button" ? (
        <Button
          size="small"
          variant="outlined"
          startIcon={<EditNoteIcon />}
          onClick={handleOpen}
        >
          Edit Costs
        </Button>
      ) : (
        <MenuItem onClick={handleOpen}>
          <Typography textAlign="center">Edit Input Costs</Typography>
        </MenuItem>
      )}

      <Modal open={open} onClose={handleClose} closeAfterTransition>
        <Box sx={containerStyle}>
          <Paper
            elevation={3}
            sx={{ p: 2, borderRadius: 2, bgcolor: "background.paper" }}
          >
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight="bold">
                Edit Input Costs
              </Typography>
              <Divider />

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Edit Labor Pay
                </Typography>

                <Stack spacing={2}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Shoppe"
                    value={currentShoppeType}
                    onChange={(e) =>
                      setCurrentShoppeType(e.target.value as RecipeType)
                    }
                  >
                    {recipeTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Divider />

                  {(["basic", "skilled", "expert"] as const).map((tier) => (
                    <Stack
                      key={tier}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Typography
                        variant="body2"
                        sx={{ textTransform: "capitalize", minWidth: 80 }}
                      >
                        {tier} labor
                      </Typography>
                      <TextField
                        type="number"
                        size="small"
                        value={labor.laborPay[currentShoppeType][tier]}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (value < 0 || isNaN(value)) return;
                          setLabor((prev) => ({
                            ...prev,
                            laborPay: {
                              ...prev.laborPay,
                              [currentShoppeType]: {
                                ...prev.laborPay[currentShoppeType],
                                [tier]: value,
                              },
                            },
                          }));
                        }}
                        inputProps={{ min: 0 }}
                        sx={{ width: 100 }}
                      />
                    </Stack>
                  ))}
                </Stack>
              </Paper>

              {/* Tabs for commodity filter */}
              <Tabs
                value={selectedTab}
                onChange={(_, val) => setSelectedTab(val)}
                variant="scrollable"
                scrollButtons="auto"
              >
                {hasInitialRecipe && <Tab label="Recipe" value="recipe" />}
                {commodClasses.map((cc) => (
                  <Tab
                    key={cc.id}
                    label={cc.commodclass}
                    value={cc.id.toString()}
                  />
                ))}
                <Tab label="All" value="0" />
              </Tabs>

              <Divider />

              {/* Commodity price editing */}
              {/* Search input */}
              <TextField
                fullWidth
                size="small"
                placeholder="Search commodities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <Stack spacing={1}>
                {itemsToShow.map((ci) => (
                  <Stack
                    key={ci.id}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                  >
                    <Image
                      src={`/images/goods/${formatImagePath(
                        ci.commodname
                      )}.png`}
                      width={24}
                      height={24}
                      alt={ci.commodname}
                    />
                    <Typography flexGrow={1}>{ci.commodname}</Typography>
                    <TextField
                      type="number"
                      size="small"
                      value={ci.pricePerUnit ?? ""}
                      onChange={(e) =>
                        handlePriceChange(ci.id, parseFloat(e.target.value))
                      }
                      inputProps={{ min: 0 }}
                    />
                  </Stack>
                ))}
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Image
                  src={`/images/icons/${formatImagePath("doubloon")}.png`}
                  width={24}
                  height={24}
                  alt="Doubloon"
                />
                <Typography flexGrow={1}>Doubloon</Typography>
                <TextField
                  type="number"
                  size="small"
                  value={userSettings.doubloon}
                  onChange={(e) =>
                    handleDoubloonChange(parseFloat(e.target.value))
                  }
                  inputProps={{ min: 0 }}
                />
              </Stack>

              <Button variant="contained" fullWidth onClick={handleClose}>
                Done
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Modal>
    </>
  );
}
