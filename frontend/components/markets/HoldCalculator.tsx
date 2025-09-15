import { useMemo, useState, useEffect } from "react";
import Image from "next/image";

import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  TextField,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Container,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

import type { Commod, Vessel } from "@interfaces";
import { useGlobalContext } from "@context";
import { formatImagePath } from "@utils/helpers";

const fmt0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const fmt2 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const pctStr = (n: number) => `${n.toFixed(1)}%`;

const clamp100 = (n: number) => Math.max(0, Math.min(100, n));

const maxQtyFor = (c: Commod, capMass: number, capVol: number) => {
  const unitMass = Number(c?.unitmass ?? 0);
  const unitVol = Number(c?.unitvolume ?? 0);
  const byMass = unitMass > 0 ? capMass / unitMass : Infinity;
  const byVol = unitVol > 0 ? capVol / unitVol : Infinity;
  const max = Math.floor(Math.min(byMass, byVol));
  return Number.isFinite(max) && max > 0 ? max : 0;
};

function LabeledLinear({
  value,
  color,
  title,
}: {
  value: number;
  color:
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning"
    | undefined;
  title?: string;
}) {
  return (
    <Tooltip title={title ?? ""} placement="top" arrow>
      <Box sx={{ position: "relative" }}>
        <LinearProgress
          variant="determinate"
          value={clamp100(value)}
          color={color}
          sx={{ height: 20, borderRadius: 1 }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            typography: "caption",
            fontWeight: 700,
            opacity: 0.9,
          }}
        >
          {pctStr(clamp100(value))}
        </Box>
      </Box>
    </Tooltip>
  );
}

// Tweak these if you want a narrower/wider cap
const MAX_PAGE_WIDTH = 1200;
const CONTROL_MIN = 240;

export default function HoldCalculator() {
  const { commods, vessels } = useGlobalContext();

  const eligibleCommods: Commod[] = useMemo(
    () =>
      commods.items.filter(
        (item: Commod) =>
          item?.unitmass && item?.unitvolume && item?.commodclass
      ),
    [commods.items]
  );

  const groupedByCategory = useMemo(() => {
    return eligibleCommods.reduce(
      (acc: Record<string, Commod[]>, commod: Commod) => {
        const category = commod?.commodclass?.commodclass ?? "Uncategorized";
        if (!acc[category]) acc[category] = [];
        acc[category].push(commod);
        return acc;
      },
      {} as Record<string, Commod[]>
    );
  }, [eligibleCommods]);

  const [selectedByCategory, setSelectedByCategory] = useState<
    Record<string, Commod[]>
  >({});
  const [selectedVesselId, setSelectedVesselId] = useState<string>("7");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Flatten all selected commods
  const allSelected: Commod[] = useMemo(
    () => Object.values(selectedByCategory).flat(),
    [selectedByCategory]
  );

  // Clean up quantities for de-selected items
  useEffect(() => {
    const keep = new Set(allSelected.map((c) => String(c.id)));
    setQuantities((prev) => {
      const next: Record<string, number> = {};
      for (const [k, v] of Object.entries(prev)) {
        if (keep.has(k)) next[k] = v;
      }
      return next;
    });
  }, [allSelected]);

  const handleCategoryChange =
    (category: string) => (event: SelectChangeEvent<string[]>) => {
      const selectedIds = event.target.value as string[];
      const options = groupedByCategory[category] || [];
      const nextSelection = selectedIds
        .map((id) => options.find((c) => String(c.id) === String(id)))
        .filter((c): c is Commod => Boolean(c));

      setSelectedByCategory((prev) => ({ ...prev, [category]: nextSelection }));
    };

  const handleQtyChange =
    (commodId: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const raw = e.target.value;
      const n = Number(raw);
      setQuantities((prev) => ({
        ...prev,
        [commodId]: Number.isFinite(n) && n >= 0 ? n : 0,
      }));
    };

  const MenuProps = { PaperProps: { sx: { maxHeight: 320 } } };

  const vesselItems = vessels ?? [];
  const selectedVessel =
    vesselItems.find(
      (v: Vessel) => String(v.id) === String(selectedVesselId)
    ) ?? null;

  // Totals from selections × quantities
  const { totalMass, totalVol } = useMemo(() => {
    let m = 0;
    let v = 0;
    for (const c of allSelected) {
      const id = String(c.id);
      const qty = quantities[id] ?? 0;
      const unitMass = Number((c as Commod)?.unitmass ?? 0);
      const unitVol = Number((c as Commod)?.unitvolume ?? 0);
      if (qty > 0) {
        m += unitMass * qty;
        v += unitVol * qty;
      }
    }
    return { totalMass: m, totalVol: v };
  }, [allSelected, quantities]);

  const capMass = selectedVessel ? selectedVessel.mass : 0;
  const capVol = selectedVessel ? selectedVessel.volume : 0;

  const pct = (num: number, den: number) => (den > 0 ? (num / den) * 100 : 0);

  const massPct = clamp100(pct(totalMass, capMass));
  const volPct = clamp100(pct(totalVol, capVol));

  const overMass = capMass > 0 ? Math.max(0, totalMass - capMass) : 0;
  const overVol = capVol > 0 ? Math.max(0, totalVol - capVol) : 0;

  const statusColor = (over: number, percent: number) =>
    over > 0 ? "error" : percent >= 90 ? "warning" : "primary";

  return (
    <Container
      maxWidth={false}
      sx={{
        // Hard cap width and center the content on ultrawide screens
        maxWidth: `${MAX_PAGE_WIDTH}px`,
        mx: "auto",
        px: { xs: 1.5, sm: 2, md: 3 },
        py: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        Hold Calculator — Select Commodities by Category
      </Typography>

      {/* Controls: responsive grid instead of a long flex row */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: `repeat(2, minmax(${CONTROL_MIN}px, 1fr))`,
            md: `repeat(3, minmax(${CONTROL_MIN}px, 1fr))`,
          },
          // auto-fit lets it fill rows more fluidly on wider screens, but we want a cap anyway
          columnGap: 1.5,
          rowGap: 1.5,
          alignItems: "start",
          mb: 2,
        }}
      >
        {/* Vessel single-select (compact) */}
        <FormControl size="small" sx={{ minWidth: CONTROL_MIN }}>
          <InputLabel id="vessel-label">Vessel</InputLabel>
          <Select
            labelId="vessel-label"
            label="Vessel"
            value={selectedVesselId}
            onChange={(e) => setSelectedVesselId(String(e.target.value || ""))}
            displayEmpty
            MenuProps={MenuProps}
            sx={{ "& .MuiSelect-select": { py: 0.5 } }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {vesselItems.map((v: Vessel) => {
              const id = String(v.id);
              return (
                <MenuItem key={id} value={id} dense>
                  {v.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        {/* Category multi-selects */}
        {Object.entries(groupedByCategory).map(([category, items]) => {
          const valueIds = (selectedByCategory[category] || []).map((c) =>
            String(c.id)
          );

          return (
            <FormControl
              key={category}
              size="small"
              sx={{ minWidth: CONTROL_MIN }}
            >
              <InputLabel id={`${category}-label`}>{category}</InputLabel>
              <Select
                labelId={`${category}-label`}
                multiple
                value={valueIds}
                label={category}
                onChange={handleCategoryChange(category)}
                renderValue={(selected) => (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      maxHeight: 76,
                      overflow: "auto",
                    }}
                  >
                    {(selected as string[]).map((id) => {
                      const found = items.find(
                        (c) => String(c.id) === String(id)
                      );
                      return (
                        <Chip
                          key={id}
                          label={found?.commodname}
                          size="small"
                          sx={{ height: 22, "& .MuiChip-label": { px: 0.75 } }}
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
                sx={{ "& .MuiSelect-select": { py: 0.5 } }}
              >
                {items.map((item) => {
                  const id = String(item.id);
                  return (
                    <MenuItem key={id} value={id} dense>
                      {item.commodname}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          );
        })}
      </Box>

      {allSelected.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Quantities
          </Typography>
          <Stack spacing={1.25}>
            {allSelected.map((c) => {
              const id = String(c.id);
              const label = c.commodname;
              const qty = quantities[id] ?? 0;

              const unitMass = Number((c as Commod)?.unitmass ?? 0);
              const unitVol = Number((c as Commod)?.unitvolume ?? 0);

              const itemMass = unitMass * qty;
              const itemVol = unitVol * qty;

              const maxQty = maxQtyFor(c, capMass, capVol);
              const massPctOfCap = clamp100((itemMass / (capMass || 1)) * 100);
              const volPctOfCap = clamp100((itemVol / (capVol || 1)) * 100);

              return (
                <Box
                  key={id}
                  sx={{
                    display: "grid",
                    gap: 1,
                    // Collapse to stacked on xs; structured columns on sm+
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "minmax(200px, 1fr) 120px 120px 140px 140px",
                    },
                    alignItems: "center",
                  }}
                >
                  <Box display="flex" gap={1} alignItems="center" minWidth={0}>
                    <Image
                      src={`/images/goods/${formatImagePath(c.commodname)}.png`}
                      width={20}
                      height={20}
                      alt={c.commodname}
                    />
                    <Typography
                      variant="body2"
                      noWrap
                      title={label}
                      sx={{ minWidth: 0 }}
                    >
                      {label}
                    </Typography>
                  </Box>

                  <TextField
                    size="small"
                    type="number"
                    inputProps={{ min: 0, step: "1" }}
                    value={qty}
                    onChange={handleQtyChange(id)}
                    label="Qty"
                    sx={{ maxWidth: { xs: "100%", sm: 120 } }}
                  />

                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.8 }}
                    title="Max qty if filled only with this item"
                  >
                    max: <strong>{fmt0.format(maxQty)}</strong>
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.9 }}
                    title="Portion of vessel mass capacity used by this item"
                  >
                    mass fill: <strong>{pctStr(massPctOfCap)}</strong>
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.9 }}
                    title="Portion of vessel volume capacity used by this item"
                  >
                    vol fill: <strong>{pctStr(volPctOfCap)}</strong>
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Paper>
      )}

      {/* Capacity summary */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Capacity Summary
        </Typography>

        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Mass{" "}
            {selectedVessel
              ? `(cap: ${fmt2.format(capMass)})`
              : "(select a vessel)"}{" "}
            — <strong>{fmt2.format(totalMass)}</strong>
            {overMass > 0 && (
              <Typography component="span" color="error" sx={{ ml: 1 }}>
                OVER by {fmt2.format(overMass)}
              </Typography>
            )}
          </Typography>

          <LabeledLinear
            value={massPct}
            color={statusColor(overMass, massPct)}
            title={`Using ${pctStr(massPct)} of mass capacity`}
          />
        </Box>

        <Box>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Volume{" "}
            {selectedVessel
              ? `(cap: ${fmt2.format(capVol)})`
              : "(select a vessel)"}{" "}
            — <strong>{fmt2.format(totalVol)}</strong>
            {overVol > 0 && (
              <Typography component="span" color="error" sx={{ ml: 1 }}>
                OVER by {fmt2.format(overVol)}
              </Typography>
            )}
          </Typography>

          <LabeledLinear
            value={volPct}
            color={statusColor(overVol, volPct)}
            title={`Using ${pctStr(volPct)} of volume capacity`}
          />
        </Box>
      </Paper>
    </Container>
  );
}
