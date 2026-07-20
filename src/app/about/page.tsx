"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NextLink from "next/link";

export default function Page() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, sm: 10 } }}>
      <Button
        component={NextLink}
        href="/"
        startIcon={<ArrowBackIcon />}
        variant="contained"
        color="primary"
        size="large"
        sx={{ mb: 4 }}
      >
        Back to home
      </Button>

      <Typography variant="h3" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
        Privacy Policy
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
        Last updated: 7/19/2026
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        Welcome to TheLazyVoter (&quot;we,&quot; &quot;us,&quot; or
        &quot;our&quot;), accessible at thelazyvoter.org (the &quot;Site&quot;).
        By accessing or using the Site, you agree to be bound by these Terms of
        Service (&quot;Terms&quot;). If you do not agree, please do not use the
        Site.
      </Typography>

      <Divider sx={{ mb: 4 }} />

      <Box sx={{ mt: 2 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{ fontWeight: 600, mb: 1.5 }}
        >
          13. Contact us
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Questions about these Terms can be directed to{" "}
          <Link href="mailto:SimonNDao13@gmail.com">
            SimonNDao13@gmail.com
          </Link>
          .
        </Typography>
      </Box>
    </Container>
  );
}