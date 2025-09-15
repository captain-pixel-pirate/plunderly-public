import { Metadata } from "next";

import { LaborManagementPage } from "@components/labormanagement";

export const metadata: Metadata = {
  title: "Plunderly",
  description:
    "Keep track of all your labors alts in an organized and easy to parse format.",
};

export default function LaborManagement() {
  return <LaborManagementPage />;
}
