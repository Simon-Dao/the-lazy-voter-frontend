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

const steps = [
  {
    title: "Check your registration",
    body: "Confirm you're registered at your current address. Registration deadlines vary by state, some allow same-day registration.",
    link: "https://vote.gov",
    linkText: "Check status at vote.gov",
  },
  {
    title: "Find your polling place",
    body: "Locate your assigned polling location, or confirm your county's mail-in ballot drop-off sites and hours.",
    link: "https://www.vote.org/polling-place-locator/",
    linkText: "Find your polling place",
  },
  {
    title: "Know your options",
    body: "Vote in person on Election Day, vote early where available, or request an absentee/mail-in ballot ahead of the deadline.",
    link: "https://www.eac.gov/voters/register-and-vote-in-your-state",
    linkText: "State-by-state voting rules",
  },
  {
    title: "Bring valid ID",
    body: "Many states require photo ID at the polls. Requirements differ by state, so check yours before you go.",
    link: "https://www.nass.org/can-I-vote/voter-id-requirements",
    linkText: "Check your state's ID rules",
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

          <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center", mb: 6 }}>
            <Typography variant="h2" sx={{ fontWeight: 600 }}>
              How to vote in federal elections
            </Typography>
            <Typography variant="h6" sx={{ color:"text.secondary", maxWidth: 640 }}>
              Federal elections happen every two years, with a general election on the first
              Tuesday after the first Monday in November. Here's what to do before you vote.
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {steps.map((step) => (
              <Grid key={step.title} size={{ xs: 12, sm: 6 }}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color:"text.secondary",mb: 2 }}>
                      {step.body}
                    </Typography>
                    <Link href={step.link} sx={{color:"info.main"}} target="_blank" rel="noopener" variant="body2">
                      {step.linkText}
                    </Link>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Footer />
    </Stack>
  );
}