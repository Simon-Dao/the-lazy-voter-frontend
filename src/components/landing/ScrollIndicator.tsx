"use client";

import { Box, Typography } from "@mui/material";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

export default function ScrollIndicator({ targetId }: { targetId?: string }) {
  const handleClick = () => {
    if (targetId) {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: "flex",
        justifyContent: "center",
        cursor: "pointer",
        color: "primary.main",
        "& svg": {
          fontSize: 32,
          animation: "bounce 1.8s ease-in-out infinite",
        },
        
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          "@keyframes bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(5px)" },
          },
        }}
        
      >
      <Typography variant="h4">Learn how Congress works</Typography>
      <KeyboardArrowDownRoundedIcon />
      </Box>
    </Box>
  );
}
