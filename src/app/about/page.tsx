"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Link from "@mui/material/Link";
import Fade from "@mui/material/Fade";
import Grow from "@mui/material/Grow";
import AppAppBar from "../../components/landing/AppAppBar";
import Footer from "../../components/landing/Footer";
import LogoCollection from "../../components/about/LogoCollection";

const repos = [
  {
    name: "Frontend / API / AWS Infrastructure",
    body: "Frontend: Next.js App Router site, statically exported and served through CloudFront. Serverless AWS backend with Lambda and API Gateway, plus Terraform-managed infrastructure and CI/CD.",
    href: "https://github.com/Simon-Dao/the-lazy-voter-frontend",
  },
  {
    name: "Data Aggregation",
    body: "ETL pipelines created with Pyspark and Databricks to aggregate and store candidate data",
    href: "https://github.com/Simon-Dao/the-lazy-voter-backend",
  },
];

// Animation timings
const REVEAL_DURATION = 400; // how long each element's own animation takes
const REVEAL_STEP = 130; // ms between each element starting, top to bottom
const REVEAL_START = 100; // ms before the very first element starts

// Ordered, top-to-bottom list of every animated element on the page.
// Index in this array = position in the top-to-bottom reveal sequence.
const REVEAL_KEYS = [
  "header",
  "whyThisExists",
  "howItWorks",
  "logoCollection",
  "repo0",
  "repo1",
  "createdBySimon",
  "createdByIndependent",
] as const;

type RevealKey = (typeof REVEAL_KEYS)[number];

export default function Page(props: { disableCustomTheme?: boolean }) {
  const [shown, setShown] = useState<Record<RevealKey, boolean>>(() =>
    Object.fromEntries(REVEAL_KEYS.map((key) => [key, false])) as Record<
      RevealKey,
      boolean
    >,
  );

  useEffect(() => {
    const timers = REVEAL_KEYS.map((key, i) =>
      setTimeout(() => {
        setShown((prev) => ({ ...prev, [key]: true }));
      }, REVEAL_START + i * REVEAL_STEP),
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <Stack direction="column" sx={{ minHeight: "100vh" }}>
      <AppAppBar />

      <Box
        id="hero"
        sx={(theme) => ({
          flex: 1,
          width: "100%",
          backgroundRepeat: "no-repeat",
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)",
          ...theme.applyStyles("dark", {
            backgroundImage:
              "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)",
          }),
        })}
      >
        <Container
          sx={{
            pt: { xs: 14, sm: 20 },
            pb: { xs: 8, sm: 12 },
          }}
        >
          <Fade in={shown.header} timeout={REVEAL_DURATION}>
            <Stack
              spacing={2}
              sx={{ alignItems: "center", textAlign: "center", mb: 8 }}
            >
              <Typography variant="h2" sx={{ fontWeight: 600 }}>
                About TheLazyVoter
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: "text.secondary", maxWidth: 640 }}
              >
                A single place to see who's representing you, who's funding them,
                and what they're actually doing in office.
              </Typography>
            </Stack>
          </Fade>

          <Grid container spacing={4} sx={{ mb: 8 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Grow in={shown.whyThisExists} timeout={REVEAL_DURATION}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5 }}>
                    Why this exists
                  </Typography>
                  <Typography variant="body1" sx={{ color: "text.secondary" }}>
                    Following federal politics means piecing together campaign
                    finance filings, voting records, and bill sponsorships from a
                    handful of scattered government sites, each with its own format
                    and quirks. TheLazyVoter pulls that data together into one
                    place, so you don't have to.
                  </Typography>
                </Box>
              </Grow>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Grow in={shown.howItWorks} timeout={REVEAL_DURATION}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5 }}>
                    How it works
                  </Typography>
                  <Typography variant="body1" sx={{ color: "text.secondary" }}>
                    Data is pulled from official federal sources, cleaned, and
                    matched across systems so records for the same person -
                    candidacy filings, committee assignments, sponsored bills - link
                    up correctly, even when identifiers differ between agencies.
                  </Typography>
                </Box>
              </Grow>
            </Grid>
          </Grid>

          <Grow in={shown.logoCollection} timeout={REVEAL_DURATION}>
            <Box>
              <LogoCollection />
            </Box>
          </Grow>

          <Typography
            variant="h5"
            sx={{ fontWeight: 600, mb: 3, mt: 8, textAlign: "center" }}
          >
            Source code
          </Typography>
          <Grid container spacing={3} sx={{ mb: 8 }}>
            {repos.map((repo, i) => (
              <Grid key={repo.name} size={{ xs: 12, sm: 6 }}>
                <Grow
                  in={shown[(`repo${i}` as RevealKey)]}
                  timeout={REVEAL_DURATION}
                >
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                        {repo.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mb: 1.5 }}
                      >
                        {repo.body}
                      </Typography>
                      <Link
                        href={repo.href}
                        target="_blank"
                        rel="noopener"
                        variant="body2"
                      >
                        View on GitHub
                      </Link>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>

          <Typography
            variant="h5"
            sx={{ fontWeight: 600, mb: 3, mt: 8, textAlign: "center" }}
          >
            Created By
          </Typography>

          <Stack
            direction="row"
            spacing={3}
            sx={{
              width: "100%",
              justifyContent: "center",
              alignItems: "stretch",
              mb: 8,
            }}
          >
            <Stack sx={{ alignItems: "center" }}>
              <Grow in={shown.createdBySimon} timeout={REVEAL_DURATION}>
                <Card variant="outlined" sx={{ maxWidth: 480, width: "100%" }}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Simon Dao
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mb: 2 }}
                    >
                      TheLazyVoter is built and maintained solo by Simon Dao,
                      covering the full stack from data pipelines to frontend.
                    </Typography>
                    <Link
                      href="https://simondao.me"
                      target="_blank"
                      rel="noopener"
                      variant="body2"
                    >
                      simondao.me
                    </Link>
                  </CardContent>
                </Card>
              </Grow>
            </Stack>

            <Stack
              spacing={1.5}
              sx={{ alignItems: "center", textAlign: "center" }}
            >
              <Grow in={shown.createdByIndependent} timeout={REVEAL_DURATION}>
                <Card variant="outlined" sx={{ maxWidth: 480, width: "100%" }}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Built independently
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mb: 2 }}
                    >
                      TheLazyVoter is an independent project, not affiliated with
                      any campaign, party, or government agency. Have feedback or
                      found something that looks wrong?{" "} Email me! {" "}
                      <Link href="mailto:SimonNDao13@gmail.com">
                        SimonNDao13@gmail.com
                      </Link>
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Footer />
    </Stack>
  );
}