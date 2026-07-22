"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Link from "@mui/material/Link";
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

export default function Page(props: { disableCustomTheme?: boolean }) {
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

          <Grid container spacing={4} sx={{ mb: 8 }}>
            <Grid size={{ xs: 12, md: 6 }}>
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
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5 }}>
                How it works
              </Typography>
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                Data is pulled from official federal sources, cleaned, and
                matched across systems so records for the same person -
                candidacy filings, committee assignments, sponsored bills - link
                up correctly, even when identifiers differ between agencies.
              </Typography>
            </Grid>
          </Grid>

          <LogoCollection />
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, mb: 3, mt: 8, textAlign: "center" }}
          >
            Source code
          </Typography>
          <Grid container spacing={3} sx={{ mb: 8 }}>
            {repos.map((repo) => (
              <Grid key={repo.name} size={{ xs: 12, sm: 6 }}>
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
            </Stack>

            <Stack
              spacing={1.5}
              sx={{ alignItems: "center", textAlign: "center" }}
            >
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
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Footer />
    </Stack>
  );
}
