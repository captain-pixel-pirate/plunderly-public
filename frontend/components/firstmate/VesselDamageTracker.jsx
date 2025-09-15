import { Box, Typography, LinearProgress } from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

export default function VesselDamageTracker({
  identity,
  getDamage,
  getVesselDamageStatus,
  battleType,
  toggleBattleType,
}) {
  let backgroundImage =
    battleType === "brigands"
      ? "images/cards/sf.png"
      : "images/cards/rumble.png";

  const damageValue = getDamage(identity);
  const cappedValue = Math.min(damageValue, 100);

  const progressBarColor =
    cappedValue <= 40 ? "green" : cappedValue <= 65 ? "yellow" : "red";

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <Box
          position="relative"
          display="flex"
          alignItems="center"
          sx={{ flex: 1, borderRadius: 1, overflow: "hidden" }}
        >
          <LinearProgress
            variant="determinate"
            value={cappedValue}
            sx={{
              width: "100%",
              height: "2rem",
              borderRadius: 1,
              "& .MuiLinearProgress-bar": {
                backgroundColor: progressBarColor,
              },
            }}
          />

          <Box
            position="absolute"
            width="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ height: "100%" }}
          >
            <Typography
              variant="body2"
              sx={{ color: "black", fontWeight: "bold" }}
            >
              {`${cappedValue}%`}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            width: 20,
            ml: 0.5,
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 1,
            overflow: "hidden",
            backgroundImage: `linear-gradient(
              ${battleType === "brigands" ? "to top" : "to bottom"}, 
              red ${cappedValue / 2}%, 
              transparent ${cappedValue / 2}%
            ), url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
          onClick={toggleBattleType}
        >
          <SwapHorizIcon sx={{ fontSize: 14 }} />
        </Box>
      </Box>

      <Typography sx={{ fontSize: ".65rem" }} textAlign="center">
        {getVesselDamageStatus(identity)} (received/max)
      </Typography>
    </>
  );
}
