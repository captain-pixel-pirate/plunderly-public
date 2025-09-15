import { Box, Typography } from "@mui/material";
import { Gauge } from "@mui/x-charts/Gauge";

import { useGlobalContext } from "@context";
import { SHOPPE_GRADE, CraftingDiscipline } from "@interfaces";
import { formatNumber } from "@utils/helpers";

interface EmpProps {
  shoppeGradeIn: SHOPPE_GRADE;
  shoppeTypeIn: CraftingDiscipline;
}

export default function EmployerLaborThroughputGauges({
  shoppeGradeIn,
  shoppeTypeIn,
}: EmpProps) {
  const { shoppesMetaData } = useGlobalContext();

  const shoppe = shoppesMetaData.find(
    (shoppe) => shoppe.grade === shoppeGradeIn && shoppe.type === shoppeTypeIn
  );
  const maxShoppeReference = shoppesMetaData.find(
    (shoppe) =>
      shoppe.type === shoppeTypeIn && shoppe.grade === "Upgraded Shoppe"
  );

  if (!shoppe || !maxShoppeReference) {
    return <>N/A</>;
  }

  const basic = shoppe.basicLaborCap / maxShoppeReference.basicLaborCap;
  const skilled = shoppe.skilledLaborCap / maxShoppeReference.skilledLaborCap;
  const expert = shoppe.expertLaborCap / maxShoppeReference.expertLaborCap;

  return (
    <Box sx={{ position: "relative", pt: 1 }}>
      <Typography
        fontSize=".9rem"
        sx={{
          position: "absolute",
          color: "text.primary",
          top: 15,
          left: "10%",
        }}
      >
        Labor Output Caps per hr
      </Typography>
      <Box sx={{ display: "flex", pt: 1 }}>
        <Gauge
          width={75}
          height={75}
          value={formatNumber(basic * 100)}
          startAngle={-90}
          endAngle={90}
          text={`${shoppe.basicLaborCap} \nBasic`}
        />
        <Gauge
          width={75}
          height={75}
          value={formatNumber(skilled * 100)}
          startAngle={-90}
          endAngle={90}
          text={`${shoppe.skilledLaborCap} \n Skilled`}
        />
        <Gauge
          width={75}
          height={75}
          value={formatNumber(expert * 100)}
          startAngle={-90}
          endAngle={90}
          text={`${shoppe.expertLaborCap} \n Expert`}
        />
        <Gauge
          width={75}
          height={75}
          value={formatNumber(
            (shoppe.maxLaborThroughput /
              maxShoppeReference.maxLaborThroughput) *
              100
          )}
          startAngle={-90}
          endAngle={90}
          text={`${shoppe.maxLaborThroughput} \n Overall`}
        />
      </Box>
    </Box>
  );
}
