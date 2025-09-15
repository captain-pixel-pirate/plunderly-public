import { Metadata } from "next";

import { ShoppeRecipesPage } from "@components/recipes";

export const metadata: Metadata = {
  title: "Plunderly",
  description:
    "Calculate commodity, tax, and labor costs accurately to maximize productivity.",
};

export default function ShoppeRecipes() {
  return <ShoppeRecipesPage />;
}
