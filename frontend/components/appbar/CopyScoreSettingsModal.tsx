import { useState } from "react";

import {
  Modal,
  Box,
  Typography,
  Button,
  MenuItem,
  DialogTitle,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import { useGlobalContext } from "@context";

type Props = {
  type?: "MenuItem" | "Standalone";
};

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export default function SimpleModalMenuItem({ type = "Standalone" }: Props) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { userSettings, setUserSettings } = useGlobalContext();
  const { reverseOrder, showAsFraction, showPercentage } =
    userSettings.copyScoreSettings;

  const handleToggle = (key: keyof typeof userSettings.copyScoreSettings) => {
    setUserSettings((prev) => ({
      ...prev,
      copyScoreSettings: {
        ...prev.copyScoreSettings,
        [key]: !prev.copyScoreSettings[key],
      },
    }));
  };

  const trigger =
    type === "MenuItem" ? (
      <MenuItem onClick={handleOpen}>
        <Typography>Copy Score Settings</Typography>
      </MenuItem>
    ) : (
      <Button onClick={handleOpen}>Copy Score Settings</Button>
    );

  return (
    <>
      {trigger}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <DialogTitle>Copy Score Settings</DialogTitle>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={reverseOrder}
                  onChange={() => handleToggle("reverseOrder")}
                />
              }
              label="Reverse Order"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showAsFraction}
                  onChange={() => handleToggle("showAsFraction")}
                />
              }
              label="Show as Fraction"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showPercentage}
                  onChange={() => handleToggle("showPercentage")}
                />
              }
              label="Show Percentage"
            />
          </FormGroup>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" onClick={handleClose}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
