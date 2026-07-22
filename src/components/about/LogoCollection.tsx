"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";

const sources = [
  {
    name: "FEC",
    logo: "/logos/fec_logo.webp",
    body: "Campaign finance data - contributions, expenditures, and committee filings for federal candidates.",
    href: "https://www.fec.gov",
  },
  {
    name: "Congress.gov",
    logo: "/logos/congressdotgov_logo.png",
    body: "Sponsorship records, votes, and bill text for members of the U.S. Congress.",
    href: "https://www.congress.gov",
  },
  {
    name: "LegiScan",
    logo: "/logos/legiscan_logo.png",
    body: "Bill tracking and legislative activity across state and federal sessions.",
    href: "https://legiscan.com",
  },
];

const logoStyle = {
  width: "72px",
  height: "72px",
  borderRadius: "10px",
  objectFit: "contain" as const,
};

export default function LogoCollection() {
  return (
    <Box id="logoCollection" sx={{ py: 4 }}>
      <Typography
        component="p"
        variant="subtitle2"
        align="center"
        sx={{ color: "text.secondary", mb: 4 }}
      >
        This website displays data from the following public data sources
      </Typography>
      <Grid container spacing={3} sx={{ justifyContent: "center" }}>
        {sources.map((source) => (
          <Grid key={source.name} size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 1,
                px: 2,
              }}
            >
              <img
                src={source.logo}
                alt={`${source.name} logo`}
                style={logoStyle}
              />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {source.name}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {source.body}
              </Typography>
              <Link href={source.href} target="_blank" rel="noopener" variant="body2">
                Visit site
              </Link>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}