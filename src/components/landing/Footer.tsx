"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import GitHubIcon from "@mui/icons-material/GitHub";

function Copyright() {
  return (
    <Typography variant="body2" sx={{ color: "text.secondary"}}>
      {"Copyright © "}
        TheLazyVoter

      {" " + new Date().getFullYear()}
    </Typography>
  );
}

export default function Footer() {
  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 4, sm: 8 },
        py: { xs: 8, sm: 10 },
        textAlign: { sm: "center", md: "left" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <div className="flex">
          
          {/* Info Section */}
          <Copyright />
          <Typography sx={{ display: "inline", mx: 0.5, opacity: 0.5 }}>
            &nbsp;•&nbsp;
          </Typography>
          <Link
            variant="body2"
            href="/privacy-policy"
            sx={{
              color: "text.secondary",
            }}
          >
            Privacy Policy
          </Link>
          <Typography sx={{ display: "inline", mx: 0.5, opacity: 0.5 }}>
            &nbsp;•&nbsp;
          </Typography>
          <Link
            variant="body2"
            href="/terms-of-service"
            sx={{
              color: "text.secondary",
            }}
          >
            Terms of Service
          </Link>
        </div>

        {/* Github Links */}
        <Stack direction="row" spacing={1}>
          <Button
            component="a"
            href="https://github.com/Simon-Dao/the-lazy-voter-backend"
            startIcon={<GitHubIcon />}
            color="inherit"
            size="small"
          >
            Backend Source
          </Button>
          <Button
            component="a"
            href="https://github.com/Simon-Dao/the-lazy-voter-frontend"
            startIcon={<GitHubIcon />}
            color="inherit"
            size="small"
          >
            Frontend Source
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
