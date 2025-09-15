import { useGlobalContext } from "@context/GlobalContext";
import { Employer, ShoppeMetaData, Worker } from "@interfaces";
import { Box, Typography } from "@mui/material";
import Label from "./Label";

interface IProps {
  workers: Worker[];
  employer: Employer;
}

export default function EmployeeProgressBar({ workers, employer }: IProps) {
  const { shoppesMetaData } = useGlobalContext();

  const shoppeMetaData = shoppesMetaData.find(
    (shoppe) =>
      shoppe.grade === employer.shoppeGrade &&
      shoppe.type === employer.shoppeType
  ) as ShoppeMetaData;

  const myWorkers = workers.filter((worker) =>
    worker.employers.some((emp) => emp.id === employer.id)
  );

  const basicWorkersThroughput = myWorkers.reduce((total, worker) => {
    if (worker.craftingSkills[shoppeMetaData.type].output != "Basic")
      return total;

    if (worker.badgeType === "Subscription") {
      return 2 + total;
    } else if (worker.badgeType === "Standard") {
      return 1 + total;
    } else {
      return 3 + total;
    }
  }, 0);

  const skilledWorkersThroughput = myWorkers.reduce((total, worker) => {
    if (worker.craftingSkills[employer.shoppeType].output != "Skilled")
      return total;

    if (worker.badgeType === "Subscription") {
      return 2 + total;
    } else if (worker.badgeType === "Standard") {
      return 1 + total;
    } else {
      return 3 + total;
    }
  }, 0);

  const expertWorkersThroughput = myWorkers.reduce((total, worker) => {
    if (worker.craftingSkills[employer.shoppeType].output != "Expert")
      return total;

    if (worker.badgeType === "Subscription") {
      return 2 + total;
    } else if (worker.badgeType === "Standard") {
      return 1 + total;
    } else {
      return 3 + total;
    }
  }, 0);

  const basicCount = myWorkers.filter(
    (w) => w.craftingSkills[employer.shoppeType].output === "Basic"
  ).length;
  const skilledCount = myWorkers.filter(
    (w) => w.craftingSkills[employer.shoppeType].output === "Skilled"
  ).length;
  const expertCount = myWorkers.filter(
    (w) => w.craftingSkills[employer.shoppeType].output === "Expert"
  ).length;

  const totalUsed =
    basicWorkersThroughput + skilledWorkersThroughput + expertWorkersThroughput;
  const unused = shoppeMetaData.maxLaborThroughput - totalUsed;

  const getWidth = (count: number) =>
    `${(count / shoppeMetaData.maxLaborThroughput) * 100}%`;
  return (
    <div style={{ width: "100%" }}>
      <Box display="flex" justifyContent="center" alignItems="center" gap={0.5}>
        <Typography sx={{ fontSize: ".9rem" }}>Current Output •</Typography>
        {(() => {
          const totalUsed =
            basicWorkersThroughput +
            skilledWorkersThroughput +
            expertWorkersThroughput;
          const percentage = Math.round(
            (totalUsed / shoppeMetaData.maxLaborThroughput) * 100
          );
          return (
            <>
              <Typography sx={{ fontSize: 10 }}>{percentage}%</Typography>
              <Typography sx={{ fontSize: 10 }}>
                ({totalUsed}/{shoppeMetaData.maxLaborThroughput})
              </Typography>
            </>
          );
        })()}
      </Box>

      {/* Progress Bar */}
      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
        {/* Progress Bar */}
        <div
          style={{
            flex: 1,
            height: 30,
            background: "#eee",
            borderRadius: 6,
            overflow: "hidden",
            display: "flex",
            position: "relative",
            fontSize: 12,
            color: "black",
            fontWeight: "bold",
          }}
        >
          {/* Basic */}
          <div
            style={{
              width: getWidth(basicWorkersThroughput),
              background: "#0088FE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {basicWorkersThroughput > 0 && (
              <span style={{ color: "white" }}>
                {basicWorkersThroughput}/hr
              </span>
            )}
          </div>

          {/* Skilled */}
          <div
            style={{
              width: getWidth(skilledWorkersThroughput),
              background: "#00C49F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {skilledWorkersThroughput > 0 && (
              <span style={{ color: "black" }}>
                {skilledWorkersThroughput}/hr
              </span>
            )}
          </div>

          {/* Expert */}
          <div
            style={{
              width: getWidth(expertWorkersThroughput),
              background: "#FFBB28",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {expertWorkersThroughput > 0 && (
              <span style={{ color: "black" }}>
                {expertWorkersThroughput}/hr
              </span>
            )}
          </div>

          {/* Unused */}
          {(() => {
            const totalUsed =
              basicWorkersThroughput +
              skilledWorkersThroughput +
              expertWorkersThroughput;
            const unused = shoppeMetaData.maxLaborThroughput - totalUsed;

            if (unused <= 0) return null;

            return (
              <div
                style={{
                  width: getWidth(unused),
                  background: "#ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              ></div>
            );
          })()}
        </div>
      </div>

      {/* Labels */}

      <Typography sx={{ pt: 0.5 }}>Breakdown</Typography>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {basicCount > 0 && (
          <Label
            color="#0088FE"
            text="Basic"
            count={basicCount}
            output={
              basicWorkersThroughput ? `(${basicWorkersThroughput}/hr)` : ""
            }
            worker
          />
        )}

        {skilledCount > 0 && (
          <Label
            color="#00C49F"
            text="Skilled"
            count={skilledCount}
            output={
              skilledWorkersThroughput ? `(${skilledWorkersThroughput}/hr)` : ""
            }
            worker
          />
        )}

        {expertCount > 0 && (
          <Label
            color="#FFBB28"
            text="Expert"
            count={expertCount}
            output={
              expertWorkersThroughput ? `(${expertWorkersThroughput}/hr)` : ""
            }
            worker
          />
        )}

        {unused > 0 && (
          <Label
            color="#ddd"
            text="Unused Hours"
            count={unused}
            worker={false}
          />
        )}
      </div>
    </div>
  );
}
