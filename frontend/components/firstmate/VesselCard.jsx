import * as React from "react";
import Image from "next/image";

import {
  Card,
  CardContent,
  Box,
  Button,
  Stack,
  IconButton,
  Typography,
  LinearProgress,
  Tooltip,
  Slide,
  Paper,
} from "@mui/material";
import {
  InfoOutlined as InfoOutlinedIcon,
  SwapHoriz as SwapHorizIcon,
} from "@mui/icons-material";
import { PiBombFill } from "react-icons/pi";

import { SelectVesselInput, VesselMetaInfo } from "./index";
import { formatImagePath } from "@utils/helpers";
import VesselActionButtons from "./VesselActionButtons";

export default function VesselCard({
  identity,
  vessel,
  vessels,
  handleVesselChange,
  recordShotsTaken,
  getDamage,
  recordRockDamage,
  battle,
  getVesselDamageStatus,
  toggleExpandShipInfo,
  toggleBattleType,
  recordRamDamage,
  meterSide,
}) {
  const [meterOpen, setMeterOpen] = React.useState(false);

  const backgroundImage =
    battle.type === "brigands"
      ? "images/cards/sf.png"
      : "images/cards/rumble.png";

  const damageValue = getDamage(identity);
  const cappedValue = Math.min(damageValue, 100);

  const progressBarColor =
    cappedValue <= 40
      ? "success.main"
      : cappedValue <= 65
      ? "warning.main"
      : "error.main";

  const shotsOptions = React.useMemo(
    () => [
      {
        shots: 1,
        label: "One Shot",
        icon: <PiBombFill style={{ fontSize: 12, marginLeft: 4 }} />,
      },
      {
        shots: 2,
        label: "Two Shots",
        icon: (
          <>
            <PiBombFill style={{ fontSize: 12, marginLeft: 4 }} />
            <PiBombFill style={{ fontSize: 12, marginLeft: 2 }} />
          </>
        ),
      },
    ],
    []
  );

  const isRight = meterSide === "right";
  const slideDirection = isRight ? "left" : "right";

  return (
    <Box position="relative" display="inline-block">
      <Tooltip title="Open battle meter">
        <Box
          role="button"
          aria-label="Fray Damage Meter"
          tabIndex={0}
          onClick={() => setMeterOpen((open) => !open)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setMeterOpen(true);
          }}
          sx={{
            position: "absolute",
            top: "90%",
            transform: "translateY(-50%)",
            ...(isRight ? { right: -8 } : { left: -8 }),
            width: 20,
            height: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: (t) => t.zIndex.appBar + 1,
            boxShadow: 3,
            border: (t) => `1px solid ${t.palette.divider}`,
            bgcolor: (t) => t.palette.background.paper,
            // ⬇️ Outer corners rounded, inner corners square
            borderTopRightRadius: isRight ? 8 : 0,
            borderBottomRightRadius: isRight ? 8 : 0,
            borderTopLeftRadius: isRight ? 0 : 8,
            borderBottomLeftRadius: isRight ? 0 : 8,

            backgroundImage: (t) =>
              `linear-gradient(180deg, ${t.palette.action.hover} 0%, transparent 70%)`,

            "&:after": {
              content: '""',
              position: "absolute",
              top: 6,
              bottom: 6,
              width: 3,

              // ⬇️ Put the colored edge on the *outside* edge
              ...(isRight ? { right: 0 } : { left: 0 }),

              opacity: 0.9,
            },
          }}
        >
          {/* Vertical label + icon */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
              userSelect: "none",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                opacity: 0.9,
              }}
            >
              <span style={{ paddingBottom: "2px" }}>Fray</span>
              <Image
                src={`/images/icons/${formatImagePath(
                  battle.type === "brigands" ? "swordfight" : "rumble"
                )}.png`}
                alt={battle.type === "brigands" ? "swordfight" : "rumble"}
                width={20}
                height={20}
              />
            </Typography>
          </Box>
        </Box>
      </Tooltip>

      <Card
        sx={{
          maxWidth: 250,
          p: 0,
          borderRadius: 2,
          boxShadow: 4,
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        {/* Header / selector */}
        <CardContent
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            background: (t) =>
              `linear-gradient(180deg, ${t.palette.action.hover} 0%, ${t.palette.background.paper} 65%)`,
          }}
        >
          <Box sx={{ width: "100%", p: 1 }}>
            <SelectVesselInput
              identity={identity}
              currentVessel={vessel}
              vessels={vessels}
              handleVesselChange={handleVesselChange}
            />
          </Box>

          <Box
            sx={{
              my: 0.5,
              height: 56,
              width: 72,
              borderRadius: 1,
              backgroundImage: `url(/images/goods/${formatImagePath(
                vessel.name
              )}.png)`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          />

          <Tooltip title="More ship info">
            <IconButton
              size="small"
              sx={{ position: "absolute", bottom: 6, right: 6 }}
              onClick={toggleExpandShipInfo}
            >
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </CardContent>

        {/* Meta + actions */}
        <CardContent sx={{ pt: 1, pb: 0.5 }}>
          <VesselMetaInfo identity={identity} battle={battle} vessel={vessel} />

          <VesselActionButtons
            shotsOptions={shotsOptions}
            identity={identity}
            recordShotsTaken={recordShotsTaken}
            recordRockDamage={recordRockDamage}
            recordRamDamage={recordRamDamage}
          />

          {/* Damage bar (no side image tab here anymore) */}
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "stretch",
                flexDirection: "row",
                gap: 0.75,
              }}
            >
              {/* Progress only */}
              <Box
                position="relative"
                display="flex"
                alignItems="center"
                sx={{
                  flex: 1,
                  borderRadius: 1,
                  overflow: "hidden",
                  boxShadow: 1,
                }}
              >
                <LinearProgress
                  variant="determinate"
                  value={cappedValue}
                  sx={{
                    width: "100%",
                    height: 28,
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
                    variant="caption"
                    sx={{ color: "black", fontWeight: 700 }}
                  >
                    {`${cappedValue}%`}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Typography
              sx={{ fontSize: ".65rem", mt: 0.5 }}
              textAlign="center"
              color="text.secondary"
            >
              {getVesselDamageStatus(identity)} (received / max)
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Slide-out panel for the battle-type meter */}
      <Slide
        in={meterOpen}
        direction={slideDirection}
        mountOnEnter
        unmountOnExit
      >
        <Paper
          elevation={6}
          sx={{
            position: "absolute",
            top: 0,
            ...(isRight ? { left: "100%", ml: 1 } : { right: "100%", mr: 1 }),
            width: 230,
            height: "100%",
            p: 1.25,
            borderRadius: 2,
            background: (t) =>
              `linear-gradient(180deg, ${t.palette.background.paper} 0%, ${t.palette.action.selected} 120%)`,
            border: (t) => `1px solid ${t.palette.divider}`,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            zIndex: (t) => t.zIndex.modal,
          }}
        >
          <Box
            onClick={toggleBattleType}
            sx={{
              height: "100%",
              width: "100%",
              borderRadius: 1,
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              boxShadow: 2,
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
            title="Click to toggle battle type"
          >
            {/* Red fill overlay */}
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                right: 6,
                transform: "translateY(-50%)",
                px: 0.5,
                py: 0.15,
                fontSize: 10,
                fontWeight: 700,
                color: "#fff",
                background: "rgba(0,0,0,1)",
                borderRadius: 0.5,
                letterSpacing: 0.2,
                pointerEvents: "none",
                zIndex: 2,
              }}
            >
              100%
            </Box>
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                height: 0,
                borderTop: "2px dashed rgba(255,255,255,0.85)",
                transform: "translateY(-1px)",
                pointerEvents: "none",
                // subtle contrast halo so it shows on bright or dark images
                filter: "drop-shadow(0 0 1px rgba(0,0,0,0.7))",
                zIndex: 1,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundImage: `linear-gradient(
        ${battle.type === "brigands" ? "to top" : "to bottom"},
        rgba(255,0,0,.65) ${cappedValue / 2}%,
        transparent ${cappedValue / 2}%
      )`,
                pointerEvents: "none",
              }}
            />

            {/* Top & bottom scrims for text legibility */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 64,
                pointerEvents: "none",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 92,
                pointerEvents: "none",
              }}
            />

            {/* Overlay content (titles + buttons) */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                p: 1.25,
              }}
            >
              {/* Title row */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  pointerEvents: "auto",
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={800}
                  sx={{
                    color: "#fff",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                  noWrap
                >
                  <Image
                    src={`/images/icons/${formatImagePath(
                      battle.type === "brigands" ? "swordfight" : "rumble"
                    )}.png`}
                    alt={battle.type === "brigands" ? "swordfight" : "rumble"}
                    width={30}
                    height={30}
                  />
                  {battle.type === "brigands" ? "Swordfight" : "Rumble"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#fff", opacity: 0.9 }}
                  noWrap
                >
                  {`${Math.round(cappedValue)}%`}
                </Typography>
              </Box>

              {/* Buttons row inside image */}
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  zIndex: 1,
                  pointerEvents: "auto",
                }}
              >
                <Button
                  variant="contained"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBattleType();
                  }}
                  sx={{
                    textTransform: "none",
                    backdropFilter: "saturate(140%) blur(2px)",
                    fontSize: 11,
                  }}
                  startIcon={<SwapHorizIcon sx={{ fontSize: 16 }} />}
                >
                  Toggle Fray
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMeterOpen(false);
                  }}
                  sx={{
                    textTransform: "none",
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.7)",
                    "&:hover": {
                      borderColor: "#fff",
                      background: "rgba(255,255,255,0.08)",
                    },
                    backdropFilter: "saturate(140%) blur(2px)",
                  }}
                >
                  Close
                </Button>
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Slide>
    </Box>
  );
}
