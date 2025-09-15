import { Metadata } from "next";

import { GreedyCounterPage } from "@components/greedycounter";

export const metadata: Metadata = {
  title: "Plunderly",
  description: "All in one greedy bashing counter with detailed battle stats.",
};

export default function GreedyCounter() {
  return <GreedyCounterPage />;
}
