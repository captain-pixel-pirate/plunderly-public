import React from "react";

import { InputLabel, MenuItem, FormControl, Select } from "@mui/material";

export default function SelectVesselInput({
  identity,
  currentVessel,
  vessels,
  handleVesselChange,
}) {
  const handleChange = (event) => {
    const selectedVessel = vessels.find(
      (item) => item.name === event.target.value
    );
    if (selectedVessel) {
      handleVesselChange(identity, selectedVessel);
    }
  };

  return (
    <FormControl
      variant="standard"
      size="small"
      sx={{
        m: 1,
        minWidth: 120,
      }}
    >
      <InputLabel
        id={`select-vessel-label-${identity}`}
        sx={{
          fontSize: "0.8rem",
          fontWeight: 600,
          color: identity === "player" ? "primary.main" : "error.main",
          textTransform: "capitalize",
        }}
      >
        {identity || "Vessel"}
      </InputLabel>

      <Select
        labelId={`select-vessel-label-${identity}`}
        id={`select-vessel-${identity}`}
        value={currentVessel?.name || ""}
        onChange={handleChange}
        sx={{
          fontSize: "0.75rem",
          py: 0.25,
          "& .MuiSelect-icon": {
            fontSize: "1rem",
          },
        }}
      >
        {vessels.map((vesselOption, i) => (
          <MenuItem
            key={i}
            value={vesselOption.name}
            sx={{
              fontSize: "0.75rem",
              "&.Mui-selected": {
                fontWeight: 700,
              },
            }}
          >
            {vesselOption.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
