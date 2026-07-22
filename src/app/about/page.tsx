"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import AppAppBar from "../../components/landing/AppAppBar";
import Footer from "../../components/landing/Footer";

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
          hello
        </Container>
      </Box>

      <Footer />
    </Stack>
  );
}
