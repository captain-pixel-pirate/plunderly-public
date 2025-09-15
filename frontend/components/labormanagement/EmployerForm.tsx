import { useState, useEffect } from "react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

import {
  Modal,
  Box,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";

import { useNotificationContext, useGlobalContext } from "@context";
import { Employer } from "@interfaces";
import { formatImagePath } from "@utils/helpers";

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  maxHeight: "80vh",
  overflowY: "auto" as const,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const empty: Employer = {
  id: uuidv4(),
  island: "",
  name: "",
  notes: "",
  shoppeType: "shipyard",
  shoppeGrade: "Upgraded Shoppe",
  pay: {
    basic: 20,
    skilled: 20,
    expert: 20,
  },
  workers: [],
};

interface WorkerModalProps {
  initialData?: Employer;
  onClose: () => void;
}

export default function EmployerModalForm({
  initialData,
  onClose,
}: WorkerModalProps) {
  const [employer, setEmployer] = useState<Employer>(initialData ?? empty);
  const { labor, setLabor } = useGlobalContext();
  const employers = labor.employers;

  const { addAlertMessage } = useNotificationContext();

  useEffect(() => {
    setEmployer(initialData ?? empty);
  }, [initialData]);

  const handleSave = () => {
    if (employer.name.length < 4 || employer.island.length < 4) {
      addAlertMessage({
        severity: "error",
        text: "Name/Island must be at least 4 characters long.",
      });
      return;
    }

    const existingIndex = employers.findIndex((w) => w.id === employer.id);
    let updatedEmployers: Employer[];

    if (existingIndex !== -1) {
      updatedEmployers = [...employers];
      updatedEmployers[existingIndex] = employer;
    } else {
      updatedEmployers = [...employers, employer];
    }
    setLabor({ ...labor, employers: updatedEmployers });
    onClose();
  };

  return (
    <Modal open={true} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }} gutterBottom>
          Shoppe Form
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Name"
            fullWidth
            value={employer.name}
            onChange={(e) => setEmployer({ ...employer, name: e.target.value })}
            required
          />

          <TextField
            label="Island"
            fullWidth
            value={employer.island}
            onChange={(e) =>
              setEmployer({ ...employer, island: e.target.value })
            }
            required
          />

          <TextField
            label="Notes"
            fullWidth
            multiline
            minRows={2}
            value={employer.notes}
            onChange={(e) =>
              setEmployer({ ...employer, notes: e.target.value })
            }
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Shoppe Type</InputLabel>
              <Select
                value={employer.shoppeType || "shipyard"}
                label="Shoppe Type"
                onChange={(e) =>
                  setEmployer({
                    ...employer,
                    shoppeType: e.target.value as Employer["shoppeType"],
                  })
                }
                renderValue={(value) => (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Image
                      src={formatImagePath("/images/icons/" + value + ".png")}
                      alt={value}
                      width={20}
                      height={20}
                    />
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </Box>
                )}
              >
                {[
                  "shipyard",
                  "apothecary",
                  "ironMonger",
                  "distillery",
                  "weavery",
                  "furnisher",
                ].map((type) => (
                  <MenuItem
                    key={type}
                    value={type}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Image
                      src={formatImagePath("/images/icons/" + type + ".png")}
                      alt={type}
                      width={20}
                      height={20}
                      style={{ paddingRight: 1 }}
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Shoppe Grade</InputLabel>
              <Select
                value={employer.shoppeGrade}
                label="Shoppe Grade"
                onChange={(e) =>
                  setEmployer({
                    ...employer,
                    shoppeGrade: e.target.value as Employer["shoppeGrade"],
                  })
                }
              >
                {[
                  "Upgraded Shoppe",
                  "Shoppe",
                  "Deluxe Stall",
                  "Medium Stall",
                  "Small Stall",
                ].map((grade) => (
                  <MenuItem key={grade} value={grade}>
                    {grade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mt: 2 }}>
            Pay Rates
          </Typography>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Basic Pay"
              type="number"
              fullWidth
              value={employer.pay.basic}
              onChange={(e) =>
                setEmployer({
                  ...employer,
                  pay: { ...employer.pay, basic: Number(e.target.value) },
                })
              }
            />
            <TextField
              label="Skilled Pay"
              type="number"
              fullWidth
              value={employer.pay.skilled}
              onChange={(e) =>
                setEmployer({
                  ...employer,
                  pay: { ...employer.pay, skilled: Number(e.target.value) },
                })
              }
            />
            <TextField
              label="Expert Pay"
              type="number"
              fullWidth
              value={employer.pay.expert}
              onChange={(e) =>
                setEmployer({
                  ...employer,
                  pay: { ...employer.pay, expert: Number(e.target.value) },
                })
              }
            />
          </Stack>

          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
