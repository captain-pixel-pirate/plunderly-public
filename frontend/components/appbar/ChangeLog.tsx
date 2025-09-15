import React from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

interface ChangelogModalProps {
  open: boolean;
  onClose: () => void;
  changelog: ChangelogEntry[];
}

export default function ChangelogModal({
  open,
  onClose,
  changelog,
}: ChangelogModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Changelog</DialogTitle>
      <DialogContent dividers>
        {[...changelog].reverse().map((entry, idx) => (
          <React.Fragment key={entry.version}>
            <Typography variant="h6">
              v{entry.version} – {entry.date}
            </Typography>
            <List dense>
              {entry.changes.map((change, i) => (
                <ListItem key={i}>
                  <ListItemText primary={change} />
                </ListItem>
              ))}
            </List>
            {idx < changelog.length - 1 && <Divider sx={{ my: 2 }} />}
          </React.Fragment>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
