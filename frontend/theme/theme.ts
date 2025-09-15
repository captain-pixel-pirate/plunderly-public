import {
  createTheme,
  type Theme,
  type ThemeOptions,
} from "@mui/material/styles";

const base: ThemeOptions = {
  typography: {
    fontFamily: [
      '"Poppins"',
      "Georgia",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    h1: { fontSize: "1rem" },
    h2: { fontSize: "1.5rem" },
    body1: { fontSize: ".9rem" },
    body2: { fontSize: ".8rem" },
  },
  components: {
    MuiTypography: { styleOverrides: { root: { fontSize: "15px" } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: "4px 10px" },
      },
    },
  },
};

/** Helper to attach theme-dependent color overrides */
function withColorOverrides(t: Theme): Theme {
  t.components = {
    ...t.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: t.palette.background.paper,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${t.palette.divider}`,
        },
      },
    },
  };
  return t;
}

/** OCEAN */
const ocean = withColorOverrides(
  createTheme({
    ...base,
    palette: {
      mode: "dark",
      primary: { main: "#90E0EF" },
      secondary: { main: "#48CAE4" },
      background: { default: "#0D1B2A", paper: "#1B263B" },
      text: { primary: "#E0E6ED", secondary: "#AABACF", disabled: "#5E6A7D" },
      info: { main: "#00B4D8" },
      divider: "#324A5F",
    },
  })
);

/** NEON WAVE — Cyberpunk teal & purple pop */
const neonWave = withColorOverrides(
  createTheme({
    ...base,
    palette: {
      mode: "dark",
      primary: { main: "#06B6D4" }, // cyan 500
      secondary: { main: "#A855F7" }, // purple 500
      background: { default: "#0A0A0F", paper: "#13131A" },
      text: { primary: "#E0F2FE", secondary: "#C4B5FD", disabled: "#6B7280" },
      info: { main: "#3B82F6" }, // blue 500
      divider: "#272838",
    },
  })
);

/** GRAPHITE — Minimal dark grey with gold accents */
const graphite = withColorOverrides(
  createTheme({
    ...base,
    palette: {
      mode: "dark",
      primary: { main: "#FACC15" }, // yellow 400
      secondary: { main: "#FBBF24" }, // amber 400
      background: { default: "#121212", paper: "#1A1A1A" },
      text: { primary: "#F3F4F6", secondary: "#D1D5DB", disabled: "#6B7280" },
      info: { main: "#EAB308" }, // yellow 500
      divider: "#2D2D2D",
    },
  })
);

/** TROPICAL TWILIGHT — Vibrant teal & mango on a dusk background */
const tropicalTwilight = withColorOverrides(
  createTheme({
    ...base,
    palette: {
      mode: "dark",
      primary: { main: "#2DD4BF" }, // teal 400
      secondary: { main: "#FBBF24" }, // amber 400
      background: { default: "#17333A", paper: "#204750" },
      text: { primary: "#ECFDF5", secondary: "#A5F3FC", disabled: "#374151" },
      info: { main: "#14B8A6" },
      divider: "#2B525A",
    },
  })
);

/** PEARL ABYSS — charcoal + pearly cyan, soft contrast */
const pearlAbyss = withColorOverrides(
  createTheme({
    ...base,
    shape: { borderRadius: 18 },
    palette: {
      mode: "dark",
      primary: { main: "#67E8F9" }, // sky/cyan
      secondary: { main: "#38BDF8" },
      background: { default: "#1F232A", paper: "#272C34" },
      text: { primary: "#E6FBFF", secondary: "#C7F9FF", disabled: "#667085" },
      info: { main: "#06B6D4" },
      divider: "rgba(255,255,255,0.08)",
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: { border: "1px solid rgba(255,255,255,0.06)" },
        },
      },
      MuiTooltip: {
        styleOverrides: { tooltip: { backgroundColor: "#0B1C22" } },
      },
    },
  })
);

const marinaDusk = withColorOverrides(
  createTheme({
    ...base,
    shape: { borderRadius: 10 },
    palette: {
      mode: "dark",
      primary: { main: "#38BDF8" }, // sky 400
      secondary: { main: "#eea5b0ff" }, // rose 400
      background: { default: "#203040", paper: "#294055" },
      text: { primary: "#E2F3FF", secondary: "#FFE4E6", disabled: "#475569" },
      info: { main: "#3B82F6" },
      divider: "#35516A",
    },
    components: {
      MuiButton: {
        styleOverrides: {
          outlinedPrimary: { borderColor: "rgba(56,189,248,.5)" },
        },
      },
    },
  })
);

/** SANDSTONE NOIR — neutral greys with subtle tan warmth */
const sandstoneNoir = withColorOverrides(
  createTheme({
    ...base,
    shape: { borderRadius: 8 },
    palette: {
      mode: "dark",
      primary: { main: "#E5C07B" }, // sand
      secondary: { main: "#9CA3AF" }, // gray
      background: { default: "#242424", paper: "#2E2D2A" },
      text: { primary: "#F5F5F4", secondary: "#E7E5E4", disabled: "#6B7280" },
      info: { main: "#D1B06B" },
      divider: "#3C3A36",
    },
    components: {
      MuiTableHead: {
        styleOverrides: { root: { backgroundColor: "rgba(229,192,123,0.06)" } },
      },
      MuiDivider: { styleOverrides: { root: { opacity: 0.5 } } },
    },
  })
);

/** AURORA BOREALIS — shifting greens & violets on deep night sky */
const auroraBorealis = withColorOverrides(
  createTheme({
    ...base,
    shape: { borderRadius: 12 },
    palette: {
      mode: "dark",
      primary: { main: "#22D3EE" }, // cyan 400
      secondary: { main: "#8B5CF6" }, // violet 500
      background: { default: "#0B1120", paper: "#161E31" },
      text: { primary: "#F0FDFA", secondary: "#C7D2FE", disabled: "#64748B" },
      info: { main: "#34D399" }, // green 400
      divider: "#243045",
    },
  })
);

/** SILVER FROST — icy neutrals with subtle blue */
const silverFrost = withColorOverrides(
  createTheme({
    ...base,
    shape: { borderRadius: 14 },
    palette: {
      mode: "dark",
      primary: { main: "#93C5FD" }, // blue 300
      secondary: { main: "#E5E7EB" }, // gray 200
      background: { default: "#1C1E24", paper: "#2A2D34" },
      text: { primary: "#F9FAFB", secondary: "#D1D5DB", disabled: "#6B7280" },
      info: { main: "#60A5FA" },
      divider: "#3F434D",
    },
  })
);

/** SLATE MIST — balanced gray with soft blue */
const slateMist = withColorOverrides(
  createTheme({
    ...base,
    palette: {
      mode: "dark", // keep dark mode so contrast logic stays correct
      primary: { main: "#60A5FA" }, // blue 400
      secondary: { main: "#A5B4FC" }, // indigo 300
      background: { default: "#2B2F36", paper: "#343A42" }, // mid gray
      text: { primary: "#F3F4F6", secondary: "#CBD5E1", disabled: "#6B7280" },
      info: { main: "#3B82F6" },
      divider: "#444B56",
    },
  })
);

/** CAFE CREMA — cozy taupe with mocha accents */
const cafeCrema = withColorOverrides(
  createTheme({
    ...base,
    palette: {
      mode: "dark",
      primary: { main: "#D6B370" }, // warm sand
      secondary: { main: "#B08968" }, // mocha
      background: { default: "#2C2A28", paper: "#3A3734" }, // warm mid-dark
      text: { primary: "#EDE9E4", secondary: "#D6CCC2", disabled: "#7C7C74" },
      info: { main: "#EAB308" },
      divider: "#4A4743",
    },
  })
);

/** FOGGY LILAC — muted violet with ash gray */
const foggyLilac = withColorOverrides(
  createTheme({
    ...base,
    palette: {
      mode: "dark",
      primary: { main: "#C4B5FD" }, // soft violet
      secondary: { main: "#A78BFA" }, // purple 400
      background: { default: "#2A2730", paper: "#3A3644" }, // muted purple-gray
      text: { primary: "#EDE9FE", secondary: "#D8B4FE", disabled: "#6D6875" },
      info: { main: "#8B5CF6" },
      divider: "#4A4555",
    },
  })
);

export const DIM_THEMES = {
  slateMist,
  cafeCrema,
  foggyLilac,
} as const;

export const THEMES = {
  ocean,
  marinaDusk,
  tropicalTwilight,
  pearlAbyss,
  sandstoneNoir,
  graphite,
  auroraBorealis,
  silverFrost,
  ...DIM_THEMES,
} as const;

export type ThemeKey = keyof typeof THEMES;
export const DEFAULT_THEME: ThemeKey = "ocean";
export const THEME_STORAGE_KEY = "theme-mode";
