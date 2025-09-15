import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  Box,
} from "@mui/material";

function createData(name, value) {
  return { name, value };
}

export default function VesselMetaInformation({ identity, battle, vessel }) {
  const formatNumber = (num) =>
    Number.isInteger(num) ? String(num) : num.toFixed(1);

  const pillageMaxRaw =
    identity === "player"
      ? battle.playerVessel.maxPillageDamage[battle.enemyVessel.cannonSize]
      : battle.enemyVessel.maxPillageDamage[battle.playerVessel.cannonSize];

  const sinkMaxRaw =
    identity === "player"
      ? battle.playerVessel.maxSinkDamage[battle.enemyVessel.cannonSize]
      : battle.enemyVessel.maxSinkDamage[battle.playerVessel.cannonSize];

  const pillageMax = formatNumber(pillageMaxRaw);
  const sinkMax = formatNumber(sinkMaxRaw);

  const rows = [
    createData("Moves per turn", vessel.movesPerTurn),
    createData("Shots per move", vessel.shotsPerMove),
    createData(
      "Cannon size",
      <Box
        component="span"
        sx={{
          px: 0.6,
          py: 0.1,
          borderRadius: 1,
          fontSize: "0.7rem",
          lineHeight: 1.2,
        }}
      >
        {vessel.cannonSize}
      </Box>
    ),
    createData(
      "Pilly max at",
      `${pillageMax} cb${Number(pillageMax) > 1 ? "'s" : ""}`
    ),
    createData(
      "Sink max at",
      `${sinkMax} cb${Number(sinkMax) > 1 ? "'s" : ""}`
    ),
    createData("Max pirates", vessel.maxPirates),
    ...(battle.expandCardInfo
      ? [
          createData("Max swabbies", vessel.maxSwabbies),
          createData("Mass", vessel.mass.toLocaleString()),
          createData("Volume", vessel.volume.toLocaleString()),
        ]
      : []),
  ];

  return (
    <TableContainer
      sx={{
        p: 0,
        mb: 1.5,
        borderRadius: 1,
        overflow: "hidden",
        border: (t) => `1px solid ${t.palette.divider}`,
        borderLeft: (t) =>
          `2px solid ${identity === "player" ? t.palette.primary.main : "red"}`,
      }}
    >
      <Table
        size="small"
        aria-label="vessel-meta"
        sx={{ tableLayout: "fixed" }}
      >
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow
              key={row.name}
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
                bgcolor: (t) =>
                  idx % 2 === 0 ? "transparent" : t.palette.action.hover,
                "&:hover": {
                  bgcolor: (t) => t.palette.action.selected,
                },
                transition: "background-color 120ms ease",
              }}
            >
              <TableCell
                component="th"
                scope="row"
                sx={{
                  p: 0.25,
                  pl: 1,
                  borderBottom: (t) => `1px solid ${t.palette.divider}`,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.7rem", color: "text.secondary" }}
                  noWrap
                >
                  {row.name}
                </Typography>
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  p: 0.25,
                  pr: 1,
                  borderBottom: (t) => `1px solid ${t.palette.divider}`,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: 0.2,
                  }}
                  noWrap
                >
                  {row.value}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
