"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Fade from "@mui/material/Fade";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import WestRoundedIcon from "@mui/icons-material/WestRounded";

// Animation timings
const FADE_DURATION = 500;
const FADE_DELAY = 100;

export default function SummaryEmptyState() {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(true), []);

  return (
    <Fade in={show} timeout={FADE_DURATION} style={{ transitionDelay: `${FADE_DELAY}ms` }}>
      <Box
        sx={{
          width: "100%",
          minHeight: { xs: "50vh", md: "60vh" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack
          spacing={2}
          sx={{
            alignItems: "center",
            textAlign: "center",
            maxWidth: 420,
            px: 2,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "action.hover",
              mb: 1,
            }}
          >
            <PersonSearchRoundedIcon
              sx={{ fontSize: 36, color: "text.secondary" }}
            />
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            No politician selected
          </Typography>

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Search for a senator or representative in the side menu to see
            their campaign finance, voting record, and sponsored bills.
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              color: "text.disabled",
              display: { xs: "none", md: "flex" },
              mt: 1,
            }}
          >
            <WestRoundedIcon
              sx={{
                fontSize: 20,
                animation: "nudge 1.6s ease-in-out infinite",
                "@keyframes nudge": {
                  "0%, 100%": { transform: "translateX(0)" },
                  "50%": { transform: "translateX(-6px)" },
                },
              }}
            />
            <Typography variant="caption">Try the search bar</Typography>
          </Stack>
        </Stack>
      </Box>
    </Fade>
  );
}