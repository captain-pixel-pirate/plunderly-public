import { Box, Button, IconButton, Stack, Tooltip } from "@mui/material";
import { TbArrowBackUp } from "react-icons/tb";
import { GiCannon, GiSeaCliff } from "react-icons/gi";
import { PiBoatDuotone } from "react-icons/pi";

export default function VesselActionButtons({
  shotsOptions,
  identity,
  recordShotsTaken,
  recordRockDamage,
  recordRamDamage,
}) {
  return (
    <Stack spacing={0.75} pb={1}>
      {shotsOptions.map(({ shots, label }) => (
        <Box
          key={shots}
          sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
        >
          <Tooltip title="Undo">
            <IconButton
              aria-label={`undo-${shots}`}
              size="small"
              onClick={() => recordShotsTaken(identity, shots, true)}
            >
              <TbArrowBackUp style={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            sx={buttonStyle}
            onClick={() => recordShotsTaken(identity, shots)}
          >
            <GiCannon />
            {label}
          </Button>
        </Box>
      ))}

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Tooltip title="Undo">
          <IconButton
            aria-label="undo-rock"
            size="small"
            onClick={() => recordRockDamage(identity, true)}
          >
            <TbArrowBackUp style={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          sx={{
            ...buttonStyle,
          }}
          onClick={() => recordRockDamage(identity)}
        >
          <GiSeaCliff />
          Rock / Edge Hit
        </Button>
      </Box>

      <Button
        variant="outlined"
        size="small"
        fullWidth
        sx={{
          ...buttonStyle,
          justifyContent: "center",
          gap: 0.75,
          borderColor: "warning.main",
          color: "warning.main",
        }}
        onClick={recordRamDamage}
      >
        <PiBoatDuotone />
        Ram
        <PiBoatDuotone />
      </Button>
    </Stack>
  );
}

const buttonStyle = {
  textTransform: "none",
  fontSize: 12,
  px: 1,
  borderRadius: 1.25,
  justifyContent: "flex-start",
  gap: 0.75,
  "& .MuiSvgIcon-root, & svg": {
    fontSize: 18,
  },
};
