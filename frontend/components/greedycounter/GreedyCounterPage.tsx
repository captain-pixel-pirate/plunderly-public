"use client";

import { useState } from "react";

import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from "@mui/material";

import { BattlesContainer } from "@components/greedycounter";
import { useAvailableHeight } from "@hooks";
import { processChatFile } from "@utils/log-parser";
import { GreedyCounter } from "@interfaces";

export default function GreedyCounterPage() {
  const availableHeight = useAvailableHeight();

  const [result, setResult] = useState<GreedyCounter | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result;
        if (typeof text === "string") {
          setIsLoading(true);
          try {
            const parsedResult = await processChatFile(text);
            setResult(parsedResult as GreedyCounter);
          } catch (error) {
            console.error("Error processing file:", error);
          } finally {
            setIsLoading(false);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: availableHeight,
        overflow: "auto",
        px: 2,
        py: 3,
        backgroundImage: `
          radial-gradient(1200px 600px at 50% -10%, rgba(255,255,255,0.06), transparent 60%),
          radial-gradient(800px 400px at 50% 120%, rgba(255,255,255,0.04), transparent 60%),
          linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02)),
          repeating-linear-gradient(0deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 1px, transparent 1px, transparent 10px)
        `,
      }}
    >
      {/* Overlay gradient */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      />

      {/* Content container */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          p: 2,
          borderRadius: 3,
          width: "100%",
        }}
      >
        {/* Title + Upload */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontWeight: 600,
              letterSpacing: 0.5,
              fontSize: "1.4rem",
            }}
          >
            Greedy Counter+
          </Typography>

          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Button
              size="small"
              variant="contained"
              component="label"
              sx={{
                minWidth: 0,
                px: 1.5,
                py: 0.5,
                fontSize: "0.75rem",
                borderRadius: 2,
              }}
            >
              {result ? "Reupload" : "Upload"}
              <input type="file" hidden onChange={handleFileUpload} />
            </Button>
            {isLoading && <CircularProgress size={18} />}
          </Box>
        </Box>

        {/* Guide */}
        {!result && !isLoading && (
          <Paper
            elevation={3}
            sx={{
              p: 2,
              width: "100%",
              bgcolor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(4px)",
              borderRadius: 2,
              color: "white",
              fontSize: "0.85rem",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Guide: Using Greedy Counter+
            </Typography>
            <Typography sx={{ mb: 1 }}>
              ⚠️ <strong> Stay for the entire fray</strong> or you&apos;ll miss
              greedy strike messages.
              <br />
              ⚠️ Wait for{" "}
              <strong>&ldquo;The victors plundered...&rdquo;</strong> message to
              appear before uploading.
            </Typography>

            <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.2)" }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Step 1: Saving Chat Logs (In-Game)
            </Typography>
            <Typography component="ul" sx={{ pl: 3, mb: 1 }}>
              <li>
                Select <strong>Ye</strong>.
              </li>
              <li>
                Go to <strong>Options &gt; Chat</strong>.
              </li>
              <li>
                Under <strong>Chat Logging</strong>, select{" "}
                <strong>Choose</strong>
              </li>
              <li>Save the file (the name doesn&apos;t matter).</li>
            </Typography>

            <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.2)" }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Step 2: Loading the File (Website)
            </Typography>
            <Typography component="ul" sx={{ pl: 3, mb: 1 }}>
              <li>
                Click the <strong>Upload</strong> button.
              </li>
              <li>Select the saved chat log file.</li>
              <li>The site will automatically show results thereafter.</li>
            </Typography>

            <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.2)" }} />

            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              This method adheres to the game&apos;s Terms of Service (TOS). For
              details, check the Puzzle Pirates TOS under the section &ldquo;
              <strong>Reading yohoho.log</strong>&rdquo;.
            </Typography>
          </Paper>
        )}

        {/* Results */}
        {result && !isLoading && <BattlesContainer result={result} />}
      </Box>
    </Box>
  );
}
