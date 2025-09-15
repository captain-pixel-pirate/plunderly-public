import React, { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";

export interface ExpiryPreferences {
  laborExpiryWarnDays: number;
  badgeExpiryWarnDays: number;
}

interface Props {
  expiryPreferences: ExpiryPreferences;
  handleChangeExpiryPreferences: (newPrefs: ExpiryPreferences) => void;
  handleClose: () => void;
  open: boolean;
}

export default function ExpiryPreferencesModal({
  expiryPreferences,
  handleChangeExpiryPreferences,
  handleClose,
  open,
}: Props) {
  const [laborDays, setLaborDays] = useState<string>(
    String(expiryPreferences.laborExpiryWarnDays ?? 0)
  );
  const [badgeDays, setBadgeDays] = useState<string>(
    String(expiryPreferences.badgeExpiryWarnDays ?? 0)
  );

  // Keep local state in sync when the modal opens or prefs change externally
  useEffect(() => {
    if (open) {
      setLaborDays(String(expiryPreferences.laborExpiryWarnDays ?? 0));
      setBadgeDays(String(expiryPreferences.badgeExpiryWarnDays ?? 0));
    }
  }, [open, expiryPreferences]);

  const errors = useMemo(() => {
    const e: { labor?: string; badge?: string } = {};
    const l = Number(laborDays);
    const b = Number(badgeDays);

    if (!Number.isFinite(l) || laborDays.trim() === "") e.labor = "Required";
    else if (!Number.isInteger(l) || l < 0)
      e.labor = "Must be a non‑negative integer";

    if (!Number.isFinite(b) || badgeDays.trim() === "") e.badge = "Required";
    else if (!Number.isInteger(b) || b < 0)
      e.badge = "Must be a non‑negative integer";

    return e;
  }, [laborDays, badgeDays]);

  const canSave = !errors.labor && !errors.badge;

  const onSave = () => {
    if (!canSave) return;
    handleChangeExpiryPreferences({
      laborExpiryWarnDays: Number(laborDays),
      badgeExpiryWarnDays: Number(badgeDays),
    });
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="expiry-prefs-title"
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle id="expiry-prefs-title">Expiry Preferences</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Labor expiry label warning (days)"
            type="number"
            value={laborDays}
            onChange={(e) => setLaborDays(e.target.value)}
            inputProps={{
              min: 0,
              step: 1,
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            error={Boolean(errors.labor)}
            helperText={
              errors.labor ??
              "Show a label warning when labor expires within this many days."
            }
            fullWidth
          />

          <TextField
            label="Badge expiry label warning (days)"
            type="number"
            value={badgeDays}
            onChange={(e) => setBadgeDays(e.target.value)}
            inputProps={{
              min: 0,
              step: 1,
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            error={Boolean(errors.badge)}
            helperText={
              errors.badge ??
              "Show a warning label when a badge expires within this many days."
            }
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="text">
          Cancel
        </Button>
        <Button onClick={onSave} variant="contained" disabled={!canSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
