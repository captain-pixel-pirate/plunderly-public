"use client";

import Image from "next/image";
import React, { useState } from "react";

import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TablePagination,
  Box,
  LinearProgress,
  Typography,
  Tooltip,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import GreedyCounterModal from "./GreedyCountModal";
import { useGlobalContext } from "@context";
import { formatNumberWithCommas } from "@utils/helpers";

interface Battle {
  index: number;
  totalGreedyStrikes: number;
  won: boolean;
  incomplete: boolean;
  players: number;
  enemies: number;
  poe: number;
  goods: number;
  greedyStrikes: { [key: string]: number };
}

interface Props {
  battles: Battle[];
}

const BattleTable: React.FC<Props> = ({ battles }) => {
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const theme = useTheme();

  const { userSettings, setUserSettings } = useGlobalContext();
  const { greedySettings } = userSettings;

  const handleChangePage = (
    _: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const paginatedBattles = battles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Find the highest strike count to normalize our bar widths
  const mostStrikesInABattle = Math.max(
    ...battles.map((b) => b.totalGreedyStrikes),
    1
  );

  return (
    <Paper elevation={3}>
      <TableContainer sx={{ minWidth: "100%" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Battle #</TableCell>
              <TableCell align="center">Fray (PvE)</TableCell>
              <TableCell align="center">Result</TableCell>
              <TableCell align="center">Poe • Goods</TableCell>
              <TableCell align="center">
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={0.5}
                >
                  Total Strikes
                  <Tooltip
                    title={`Fill bar represents bash result compared to your record of ${mostStrikesInABattle} bashes.`}
                  >
                    <InfoOutlinedIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell align="center">Greedy Strikes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedBattles.map((battle, idx) => {
              const strikeRatio =
                (battle.totalGreedyStrikes / mostStrikesInABattle) * 100;
              const isFirstRow = page === 0 && idx === 0;

              return (
                <TableRow
                  key={battle.index}
                  hover
                  sx={
                    isFirstRow
                      ? {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.15
                          ),
                          "& .MuiTableCell-root": {
                            fontWeight: "bold",
                          },
                          boxShadow: 3,
                          borderRadius: 2,
                          borderLeft: "6px solid",
                          borderColor: "info.main",
                        }
                      : {}
                  }
                >
                  <TableCell align="center">{battle.index}</TableCell>
                  <TableCell align="center">
                    {battle.players} v {battle.enemies}
                  </TableCell>
                  <TableCell align="center">
                    {battle.incomplete
                      ? "Incomplete"
                      : battle.won
                      ? "Victory"
                      : "Loss"}
                  </TableCell>

                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {battle.poe > 0 ? (
                        <>
                          <Image
                            src="/images/icons/poe.png"
                            alt="poe"
                            width={16}
                            height={16}
                            style={{ paddingRight: "2px" }}
                          />
                          {formatNumberWithCommas(battle.poe)}
                        </>
                      ) : (
                        <span style={{ paddingRight: "2px" }}>0</span>
                      )}
                      <span style={{ paddingLeft: "2px", paddingRight: "2px" }}>
                        •
                      </span>{" "}
                      {battle.goods}
                      {battle.goods > 0 && (
                        <Image
                          src="/images/icons/commodities.png"
                          alt="poe"
                          width={16}
                          height={16}
                          style={{ paddingLeft: "2px" }}
                        />
                      )}
                    </Box>
                  </TableCell>

                  {/* Visual bar for total strikes */}
                  <TableCell align="center">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 100 }}>
                        <LinearProgress
                          variant="determinate"
                          value={strikeRatio}
                        />
                      </Box>
                      <Typography variant="body2">
                        {battle.totalGreedyStrikes}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell align="center">
                    <GreedyCounterModal
                      battleNum={battle.index}
                      battle={battle}
                      greedySettings={greedySettings}
                      setUserSettings={setUserSettings}
                      primary={isFirstRow}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={battles.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[25]}
      />
    </Paper>
  );
};

export default BattleTable;
