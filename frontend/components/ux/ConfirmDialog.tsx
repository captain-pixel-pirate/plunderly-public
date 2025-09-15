import { ReactNode } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

type ConfirmType = "confirm" | "delete";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
}

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "Please confirm this action.",
  confirmText,
  cancelText = "Cancel",
  type = "confirm",
}: ConfirmDialogProps) => {
  const isDelete = type === "delete";

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{cancelText}</Button>
        <Button
          onClick={onConfirm}
          color={isDelete ? "error" : "primary"}
          variant="contained"
        >
          {confirmText || (isDelete ? "Delete" : "Confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
