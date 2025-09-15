import { Stack, IconButton, Button, TableCell } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { RiZzzFill } from "react-icons/ri";

import { Worker } from "@interfaces";

interface Props {
  worker: Worker;
  moveWorkerToDormancy: (workerId: string) => void;
  setEditingWorker: (value: React.SetStateAction<Worker | null>) => void;
  moveWorkerToActive: (workerId: string) => void;
  setDeleteWorkerId: (value: React.SetStateAction<string | null>) => void;
  setOpenConfirmDialog: (value: React.SetStateAction<boolean>) => void;
  type: "Active" | "Dormant";
}

export default function TableActionButtonsCell({
  moveWorkerToActive,
  moveWorkerToDormancy,
  setDeleteWorkerId,
  setEditingWorker,
  setOpenConfirmDialog,
  worker,
  type,
}: Props) {
  return (
    <TableCell align="right">
      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
        {type === "Active" ? (
          <>
            <IconButton
              aria-label="dormant"
              size="small"
              onClick={() => moveWorkerToDormancy(worker.id)}
            >
              <RiZzzFill />
            </IconButton>
            <IconButton
              aria-label="edit"
              size="small"
              onClick={() => setEditingWorker(worker)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <Button size="small" onClick={() => moveWorkerToActive(worker.id)}>
            Make Active
          </Button>
        )}

        <IconButton
          aria-label="delete"
          size="small"
          onClick={() => {
            setDeleteWorkerId(worker.id);
            setOpenConfirmDialog(true);
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
    </TableCell>
  );
}
