import { useState } from "react";

import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";

const categoryOptions = [
  "Feedback",
  "Report Bug",
  "Request Feature",
  "UI/UX Suggestion",
  "Performance Issue",
];

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

interface Props {
  open: boolean;
  handleClose: () => void;
  onSubmit: (data: { category: string; message: string }) => void;
}

export default function FeedbackModal({ open, handleClose, onSubmit }: Props) {
  const [category, setCategory] = useState("Feedback");
  const [message, setMessage] = useState("");

  return (
    <Modal
      open={open}
      onClose={handleClose}
      disableEnforceFocus
      disableAutoFocus
    >
      <Box sx={style}>
        <Typography variant="h6" mb={1}>
          Send Feedback
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          If the mailer doesn’t work, feel free to send me a Discord message at{" "}
          <strong>pixel_pirate_</strong>
        </Typography>

        <TextField
          select
          fullWidth
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          margin="normal"
        >
          {categoryOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="Message"
          multiline
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          margin="normal"
        />

        <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={() => {
              onSubmit({ category, message });
            }}
            variant="contained"
            disabled={!message.trim()}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
