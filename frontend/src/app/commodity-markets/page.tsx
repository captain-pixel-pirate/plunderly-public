import { Metadata } from "next";

import { CommodityMarketsPage } from "@components/markets";

export const metadata: Metadata = {
  title: "Plunderly",
  description: "Explore the latest trends and insights in commodity markets.",
};

export default function CommodityMarket() {
  return <CommodityMarketsPage />;
}
