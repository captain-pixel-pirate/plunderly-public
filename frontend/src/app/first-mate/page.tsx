import { Metadata } from "next";

import { FirstMatePage } from "@components/firstmate";

export const metadata: Metadata = {
  title: "Plunderly",
  description:
    "Manage your pillage battles with precise damage tracking and detailed stats.",
};

export default function FirstMate() {
  return <FirstMatePage />;
}
