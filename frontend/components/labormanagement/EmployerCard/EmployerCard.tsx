import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
} from "@mui/material";
import Image from "next/image";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { Employer } from "@interfaces";
import LaborThroughputGauges from "./LaborThroughputGauges";
import EmployeeProgressBar from "./EmployeeProgressBar";
import { useGlobalContext } from "@context/GlobalContext";
import { formatImagePath } from "utils/helpers";
import EmployerModalForm from "../EmployerForm";
import { useNotificationContext } from "@context";

interface Props {
  employer: Employer;
}
export default function EmployerCard({ employer }: Props) {
  const { labor, setLabor } = useGlobalContext();
  const [openWorkerForm, setOpenWorkerForm] = useState(false);
  const { addAlertMessage } = useNotificationContext();

  const deleteEmployer = (employerId: string) => {
    const updatedActiveEmployees = labor.activeWorkers.map((activeWorker) => {
      const hasEmployerToBeDeleted = activeWorker.employers.find(
        (emp) => emp.id === employerId
      );

      if (hasEmployerToBeDeleted) {
        return {
          ...activeWorker,
          employers: activeWorker.employers.filter(
            (emp) => emp.id !== employerId
          ),
        };
      } else {
        return activeWorker;
      }
    });

    const updatedEmployers = labor.employers.filter(
      (emp) => emp.id !== employerId
    );

    addAlertMessage({
      severity: "success",
      text: `${employer.name} has been deleted.`,
    });
    setLabor((prev) => ({
      ...prev,
      activeWorkers: updatedActiveEmployees,
      employers: updatedEmployers,
    }));
  };

  return (
    <Card
      sx={{
        width: 265,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontWeight: "bold",
          }}
        >
          <Image
            src={`/images/icons/${formatImagePath(employer.shoppeType)}.png`}
            width={22}
            height={22}
            alt={employer.shoppeType}
          />
          {employer.name}
        </Typography>
        <Typography color="text.secondary">
          {employer.shoppeType.charAt(0).toUpperCase() +
            employer.shoppeType.slice(1)}
          &nbsp;&bull;&nbsp;
          {employer.shoppeGrade}
          &nbsp;&bull;&nbsp;
          {employer.island}
        </Typography>

        <Box
          sx={{
            display: "flex",
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ pr: 1 }}>
            Pay:
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {employer.pay.basic}B / {employer.pay.skilled}S /{" "}
            {employer.pay.expert}E
          </Typography>
        </Box>

        <LaborThroughputGauges
          shoppeGradeIn={employer.shoppeGrade}
          shoppeTypeIn={employer.shoppeType}
        />

        <EmployeeProgressBar
          employer={employer}
          workers={labor.activeWorkers}
        />

        <CardActions
          sx={{
            pb: 0,
            pl: 0,
            flex: 1,
            display: "flex",
            alignItems: "end",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setOpenWorkerForm((OWF) => !OWF)}
          >
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              const confirmDelete = window.confirm(
                `Are you sure you want to permanently delete this employer?\n` +
                  `This action cannot be undone.\n`
              );
              if (confirmDelete) deleteEmployer(employer.id);
            }}
            sx={{ color: "error.main", borderColor: "error.main" }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </Button>
        </CardActions>
      </CardContent>

      {openWorkerForm && (
        <EmployerModalForm
          initialData={employer}
          onClose={() => {
            setOpenWorkerForm((OWF) => !OWF);
          }}
        />
      )}
    </Card>
  );
}
