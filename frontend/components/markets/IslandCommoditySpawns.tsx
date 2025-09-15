import { useMemo, useState } from "react";
import Image from "next/image";

import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Stack,
  Paper,
  Grid,
  Tooltip,
} from "@mui/material";
import LandscapeIcon from "@mui/icons-material/Landscape";
import PublicIcon from "@mui/icons-material/Public";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import StraightenIcon from "@mui/icons-material/Straighten";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import MapIcon from "@mui/icons-material/Map";

import { useGlobalContext } from "@context/GlobalContext";
import { formatImagePath } from "@utils/helpers";
import { Island, Commod, Archipelago } from "@interfaces";

const ALL_VALUE = "__ALL__";
const ANY_VALUE = "__ANY__";

const formatNumber = (n?: number | null) => {
  if (n === null || n === undefined) return "—";
  try {
    return new Intl.NumberFormat().format(n);
  } catch {
    return String(n);
  }
};

export default function IslandCommoditySpawns() {
  const { commods, oceans } = useGlobalContext();

  const basicCommodItems = commods.items.filter(
    (item) =>
      item.commodclassid === 1 &&
      item.commodname !== "Varnish" &&
      item.commodname !== "Lacquer" &&
      item.commodname !== "Hemp oil" &&
      item.commodname !== "Kraken's ink"
  );

  const [selectedSearchParameters, setSelectedSearchParameters] = useState({
    // Default to "Any" => empty array means no commodity filter
    commodities: [] as typeof basicCommodItems,
    ocean: oceans[0] || null,
    archipelago: null as null | { name: string },
  });

  const handleChange = (
    field: keyof typeof selectedSearchParameters,
    value: (typeof selectedSearchParameters)[typeof field]
  ) => {
    setSelectedSearchParameters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ----- SEARCH LOGIC -----
  const filteredIslands = useMemo(() => {
    const { commodities, ocean, archipelago } = selectedSearchParameters;

    if (!ocean) return [] as Island[];

    const selectedIds = new Set(commodities.map((c) => c.id));
    const arches = archipelago ? [archipelago] : ocean.archipelagos ?? [];

    const islandsInScope =
      (arches as Archipelago[]).flatMap(
        (a) => a.islands?.map((isle) => ({ ...isle, _arch: a.name })) ?? []
      ) ?? [];

    // If "Any" (no selected commodities), return all islands in scope
    if (selectedIds.size === 0) {
      return islandsInScope.sort((a, b) => {
        const archCmp = String(a._arch || a.archipelago).localeCompare(
          String(b._arch || b.archipelago)
        );
        if (archCmp !== 0) return archCmp;
        return a.islandname.localeCompare(b.islandname);
      });
    }

    // Otherwise, filter islands that spawn ALL selected commodities
    const result = islandsInScope.filter((island) => {
      const spawnIds = new Set((island.spawns ?? []).map((s) => s.id));
      for (const id of selectedIds) {
        if (!spawnIds.has(id)) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      const archCmp = String(a._arch || a.archipelago).localeCompare(
        String(b._arch || b.archipelago)
      );
      if (archCmp !== 0) return archCmp;
      return a.islandname.localeCompare(b.islandname);
    });

    return result;
  }, [selectedSearchParameters]);

  const commoditiesLabelId = "commodities-select-label";

  const FilterBar = (
    <Paper
      variant="outlined"
      sx={{ p: 2, borderRadius: 3, backdropFilter: "blur(2px)" }}
    >
      <Grid container spacing={2}>
        {/* Commodities Multi-Select (supports "Any") */}
        <Grid item xs={12} md={6} lg={6}>
          <FormControl fullWidth>
            <InputLabel id={commoditiesLabelId} shrink>
              Commodities
            </InputLabel>
            <Select
              labelId={commoditiesLabelId}
              multiple
              displayEmpty
              label="Commodities"
              value={selectedSearchParameters.commodities.map((c) => c.id)}
              renderValue={(selected) => {
                const ids = selected as (string | number)[];
                if (!ids || ids.length === 0) {
                  return <Typography sx={{ opacity: 0.7 }}>Any</Typography>;
                }
                const items = ids
                  .map((id) => basicCommodItems.find((c) => c.id === id))
                  .filter(Boolean) as typeof basicCommodItems;
                return (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {items.map((c) => (
                      <Chip key={c.id} label={c.commodname} size="small" />
                    ))}
                  </Box>
                );
              }}
              onChange={(e) => {
                const raw = (e.target.value as (string | number)[]) || [];
                if (raw.includes(ANY_VALUE)) {
                  handleChange("commodities", []);
                  return;
                }
                const selectedItems = raw
                  .map((id) => basicCommodItems.find((c) => c.id === id))
                  .filter(Boolean) as typeof basicCommodItems;
                handleChange("commodities", selectedItems);
              }}
            >
              <MenuItem value={ANY_VALUE}>
                <em>Any (no filter)</em>
              </MenuItem>
              {basicCommodItems.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.commodname}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Ocean Select */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Ocean</InputLabel>
            <Select
              value={selectedSearchParameters.ocean?.id || ""}
              label="Ocean"
              onChange={(e) => {
                const newOcean =
                  oceans.find((o) => o.id === e.target.value) || oceans[0];

                setSelectedSearchParameters((prev) => ({
                  ...prev,
                  ocean: newOcean,
                  archipelago: null, // reset archipelago when ocean changes
                }));
              }}
            >
              {oceans.map((ocean) => (
                <MenuItem key={ocean.id} value={ocean.id}>
                  {ocean.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Archipelago Select */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth disabled={!selectedSearchParameters.ocean}>
            <InputLabel>Archipelago</InputLabel>
            <Select
              value={
                selectedSearchParameters.archipelago
                  ? selectedSearchParameters.archipelago.name
                  : ALL_VALUE
              }
              label="Archipelago"
              onChange={(e) => {
                const v = e.target.value;
                if (v === ALL_VALUE) {
                  handleChange("archipelago", null);
                } else {
                  handleChange(
                    "archipelago",
                    selectedSearchParameters.ocean?.archipelagos.find(
                      (a) => a.name === v
                    ) || null
                  );
                }
              }}
            >
              <MenuItem value={ALL_VALUE}>All</MenuItem>
              {selectedSearchParameters.ocean?.archipelagos.map((arch) => (
                <MenuItem key={arch.name} value={arch.name}>
                  {arch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Box
        sx={{
          maxWidth: 1100,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box textAlign="center">
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Search Commodity Spawns
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Find islands that spawn selected commodities. Choose an ocean and
            optionally narrow by archipelago.
          </Typography>
        </Box>

        {/* Controls */}
        {FilterBar}

        <Divider sx={{ my: 1 }} />

        {/* Results Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Results ({filteredIslands.length})
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {selectedSearchParameters.commodities.length === 0
              ? "Showing all islands in scope"
              : "Showing islands that spawn all selected commodities"}
          </Typography>
        </Stack>

        {/* Results Grid */}
        {filteredIslands.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{ p: 4, borderRadius: 3, textAlign: "center" }}
          >
            <Typography sx={{ opacity: 0.8 }}>
              No islands match the current filters.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {filteredIslands.map((island: Island) => {
              const spawnIds = new Set(
                (island.spawns ?? []).map((s: Commod) => s.id)
              );
              const selected = selectedSearchParameters.commodities;
              const matched = selected.filter((c) => spawnIds.has(c.id));
              const extras = (island.spawns ?? []).filter(
                (s: Commod) => !matched.some((m) => m.id === s.id)
              );

              const {
                id,
                archipelago,
                governor,
                islandType,
                islandname,
                population,
                size,
                property_tax,
              } = island;

              const archDisplay = String(
                (island as Island).archipelago || archipelago
              );

              return (
                <Grid key={id} item xs={12} sm={12} md={6}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 3, height: "100%" }}
                  >
                    {/* Header Row */}
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <LandscapeIcon sx={{ fontSize: 28, opacity: 0.6 }} />

                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" fontWeight={700} noWrap>
                          {islandname}
                        </Typography>
                        {/* Subline with location context (no chips) */}
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ opacity: 0.8, mt: 0.25, flexWrap: "wrap" }}
                        >
                          <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                          >
                            <PublicIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption">
                              {selectedSearchParameters.ocean?.name}
                            </Typography>
                          </Stack>
                          <Typography variant="caption">•</Typography>
                          <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                          >
                            <MapIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption">
                              {archDisplay}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>

                    {/* Detail line (as text, not chips) */}
                    <Box sx={{ mt: 1 }}>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        flexWrap="wrap"
                        sx={{ opacity: 0.9 }}
                      >
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                        >
                          <StraightenIcon sx={{ fontSize: 18 }} />
                          <Typography variant="body2">
                            <b>{size || "—"}</b>
                          </Typography>
                        </Stack>
                        <Typography variant="body2">•</Typography>
                        {islandType === "colonized" ? (
                          <>
                            <Stack
                              direction="row"
                              spacing={0.75}
                              alignItems="center"
                            >
                              <OutlinedFlagIcon sx={{ fontSize: 18 }} />
                              <Typography variant="body2">
                                <b>
                                  {islandType
                                    ? islandType.charAt(0).toUpperCase() +
                                      islandType.slice(1)
                                    : "—"}
                                </b>
                              </Typography>
                            </Stack>
                            <Typography variant="body2">•</Typography>
                            <Stack
                              direction="row"
                              spacing={0.75}
                              alignItems="center"
                            >
                              <Image
                                src="/images/icons/governor.png"
                                width={18}
                                height={18}
                                alt="governor"
                              />
                              <Typography variant="body2">
                                <b>{governor || "—"}</b>
                              </Typography>
                            </Stack>
                            <Typography variant="body2">•</Typography>
                            <Stack
                              direction="row"
                              spacing={0.75}
                              alignItems="center"
                            >
                              <PeopleAltIcon sx={{ fontSize: 18 }} />
                              <Typography variant="body2">
                                <b>{formatNumber(population)}</b>
                              </Typography>
                            </Stack>
                            <Typography variant="body2">•</Typography>
                            <Stack
                              direction="row"
                              spacing={0.75}
                              alignItems="center"
                            >
                              <Typography variant="body2">
                                Tax: <b>{property_tax}</b>
                              </Typography>
                            </Stack>{" "}
                          </>
                        ) : islandType === "market" ? (
                          <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                          >
                            <OutlinedFlagIcon sx={{ fontSize: 18 }} />
                            <Typography variant="body2">
                              <b>Uncolonized with Commodity Market</b>
                            </Typography>
                          </Stack>
                        ) : (
                          <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                          >
                            <OutlinedFlagIcon sx={{ fontSize: 18 }} />
                            <Typography variant="body2">
                              <b>Uncolonized - no market.</b>
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    </Box>

                    {/* Commodities */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
                        Spawns
                      </Typography>
                      <Box
                        sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}
                      >
                        {selected.length === 0 ? (
                          (island.spawns ?? []).map((c: Commod) => (
                            <Chip
                              key={`a-${c.id}`}
                              label={c.commodname}
                              size="small"
                              variant="outlined"
                              icon={
                                <Image
                                  src={`/images/goods/${formatImagePath(
                                    c.commodname
                                  )}.png`}
                                  alt={c.commodname}
                                  width={16}
                                  height={16}
                                />
                              }
                            />
                          ))
                        ) : (
                          <>
                            {matched.map((c: Commod) => (
                              <Chip
                                key={`m-${c.id}`}
                                label={c.commodname}
                                size="small"
                                icon={
                                  <Image
                                    src={`/images/goods/${formatImagePath(
                                      c.commodname
                                    )}.png`}
                                    alt={c.commodname}
                                    width={16}
                                    height={16}
                                  />
                                }
                              />
                            ))}
                            {extras.map((c: Commod) => (
                              <Tooltip
                                key={`x-${c.id}`}
                                title="Also spawns here"
                              >
                                <Chip
                                  label={c.commodname}
                                  size="small"
                                  variant="outlined"
                                  sx={{ opacity: 0.7 }}
                                  icon={
                                    <Image
                                      src={`/images/goods/${formatImagePath(
                                        c.commodname
                                      )}.png`}
                                      alt={c.commodname}
                                      width={16}
                                      height={16}
                                    />
                                  }
                                />
                              </Tooltip>
                            ))}
                          </>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
