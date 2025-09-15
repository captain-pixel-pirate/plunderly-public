"use client";

import { useEffect, useRef, useState } from "react";

import { Box, Container, Grid, Typography } from "@mui/material";

import { useAvailableHeight } from "@hooks";
import { ToolCardPreview } from "@components/home";

const toolCardPreviewInfo = [
  {
    title: "Greedy Counter+",
    description:
      "All in one greedy bashing counter with detailed battle stats.",
    image: "/images/cards/greedy-battle.png",
    link: "/greedy-counter",
  },
  {
    title: "Shoppe Recipes",
    description:
      "Calculate commodity, tax, and labor costs accurately to maximize productivity.",
    image: "/images/cards/recipe.png",
    link: "/shoppe-recipes",
  },
  {
    title: "Labor Management",
    description:
      "Keep track of all your labor alts in an organized and easy to parse format.",
    image: "/images/cards/workers.png",
    link: "/labor-management",
  },
  {
    title: "First Mate",
    description: "Track pillage damage and score accurately.",
    image: "/images/cards/sea_battle.png",
    link: "/first-mate",
  },
  {
    title: "Commodity Market",
    description: "View dockside markets, island commodity spawns, and more.",
    image: "/images/cards/commodity-market.png",
    link: "/commodity-markets",
  },
];

export default function Home() {
  const availableHeight = useAvailableHeight();

  // Measure footer height so we can reserve space for it
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [footerH, setFooterH] = useState<number>(60);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const update = () =>
      setFooterH(Math.ceil(el.getBoundingClientRect().height));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <Box
      component="main"
      sx={{
        "--footer-h": `${footerH}px`,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minHeight: availableHeight ?? "100svh",
        background: "transparent",
        backgroundImage: `
          radial-gradient(1200px 600px at 50% -10%, rgba(255,255,255,0.06), transparent 60%),
          radial-gradient(800px 400px at 50% 120%, rgba(255,255,255,0.04), transparent 60%),
          linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02)),
          repeating-linear-gradient(0deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 1px, transparent 1px, transparent 10px)
        `,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          zIndex: 1,
          flex: "1 0 auto",
          display: "flex",
          flexDirection: "column",
          gap: { xs: 4, md: 5 },
          pt: 3,
          pb: "calc(var(--footer-h) + 16px)",
        }}
      >
        {/* Hero */}
        <Box sx={{ textAlign: "center", px: { xs: 1, sm: 2 } }}>
          <Typography
            component="h1"
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              color: "#fff",
              textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
              letterSpacing: 0.3,
              mb: 1.5,
            }}
          >
            Plunderly
          </Typography>

          <Typography
            component="p"
            sx={{
              mx: "auto",
              maxWidth: 720,
              fontWeight: 300,
              fontSize: { xs: ".95rem", md: "1.05rem" },
              lineHeight: 1.6,
              color: "#ddd",
              textShadow: "0 1px 2px rgba(0,0,0,0.5)",
            }}
          >
            Tools for Puzzle Pirates, including a greedy counter, shoppe
            recipes, labor management, and pillage battle tracking — all in one
            modern, easy-to-use web app.
          </Typography>

          <Typography
            component="p"
            sx={{ pt: 1.5, fontWeight: 500, color: "#eee" }}
          >
            Get Started Below!
          </Typography>
        </Box>

        <Grid
          container
          spacing={{ xs: 2, sm: 3, md: 4 }}
          sx={{
            alignItems: "stretch",
            justifyContent: "center",
          }}
        >
          {toolCardPreviewInfo.map((tool) => (
            <Grid
              key={tool.link}
              item
              xs="auto" // <-- instead of xs={12}
              sm={6}
              md={4}
              lg={3}
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  "& > *": { flexGrow: 1 },
                  transition: "transform 0.18s ease, box-shadow 0.18s ease",
                  willChange: "transform",
                  "&:hover": {
                    transform: { md: "translateY(-4px)" },
                    boxShadow: { md: "0px 8px 22px rgba(0,0,0,0.25)" },
                  },
                  "&:focus-within": {
                    outline: "2px solid rgba(255,255,255,0.6)",
                    outlineOffset: "2px",
                    borderRadius: 2,
                  },
                }}
              >
                <ToolCardPreview {...tool} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box
        component="footer"
        ref={footerRef}
        sx={{
          position: "sticky",
          bottom: 0,
          zIndex: 2,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "saturate(140%) blur(6px)",
          px: { xs: 1, sm: 2 },
          py: { xs: 1, sm: 1.25 },
          textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            sx={{ color: "grey", fontSize: ".6rem", lineHeight: 1.4 }}
          >
            Plunderly is an unofficial fan tool, not affiliated with Grey
            Havens, Three Rings, or Sega. Puzzle Pirates™ is a trademark of Grey
            Havens.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
