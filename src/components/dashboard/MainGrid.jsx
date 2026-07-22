"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { PieChart } from "@mui/x-charts/PieChart";

// ---- Template data ----

const candidate = {
  name: "Jordan Ellis",
  photo: "/candidates/jordan-ellis.jpg",
  standing: "U.S. Senator for Washington",
  party: "Independent",
  since: "In office since 2019",
};

const timeline = [
  { year: "2024", label: "Re-elected to U.S. Senate", type: "term" },
  { year: "2019–2024", label: "First term, U.S. Senate", type: "term" },
  { year: "2018", label: "Won special election for U.S. Senate", type: "campaign" },
  { year: "2014–2018", label: "U.S. House of Representatives, WA-7", type: "term" },
  { year: "2012", label: "Elected to U.S. House", type: "campaign" },
];

const focusAreas = ["Healthcare", "Climate policy", "Veterans affairs", "Tax reform"];

const billsSummary =
  "Sponsored 42 bills this term, concentrated in healthcare access and climate infrastructure. Co-sponsored the Rural Broadband Expansion Act and the Veterans Mental Health Funding Act.";

const donationsByYear = {
  all: [
    { id: 0, label: "Individual donors", value: 1250000 },
    { id: 1, label: "PACs", value: 480000 },
    { id: 2, label: "Party committee", value: 210000 },
    { id: 3, label: "Self-funded", value: 30000 },
  ],
  2024: [
    { id: 0, label: "Individual donors", value: 520000 },
    { id: 1, label: "PACs", value: 190000 },
    { id: 2, label: "Party committee", value: 90000 },
    { id: 3, label: "Self-funded", value: 10000 },
  ],
  2023: [
    { id: 0, label: "Individual donors", value: 410000 },
    { id: 1, label: "PACs", value: 160000 },
    { id: 2, label: "Party committee", value: 70000 },
    { id: 3, label: "Self-funded", value: 15000 },
  ],
  2022: [
    { id: 0, label: "Individual donors", value: 320000 },
    { id: 1, label: "PACs", value: 130000 },
    { id: 2, label: "Party committee", value: 50000 },
    { id: 3, label: "Self-funded", value: 5000 },
  ],
};

const topSponsorCategories = [
  { name: "Healthcare", amount: "$410,000" },
  { name: "Technology", amount: "$275,000" },
  { name: "Energy", amount: "$190,000" },
  { name: "Finance", amount: "$140,000" },
];

const newsArticles = [
  {
    title: "Senator Ellis introduces rural broadband bill",
    source: "Seattle Times",
    date: "Jun 2, 2026",
    href: "#",
  },
  {
    title: "Q2 fundraising numbers show steady small-dollar growth",
    source: "Politico",
    date: "May 14, 2026",
    href: "#",
  },
  {
    title: "Ellis pushes back on proposed climate rider",
    source: "AP News",
    date: "Apr 30, 2026",
    href: "#",
  },
];

// ---- Component ----

export default function CandidateProfile() {
  const [year, setYear] = React.useState("all");
  const donations = donationsByYear[year];
  const totalDonations = donations.reduce((sum, d) => sum + d.value, 0);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: { sm: "100%", md: "1700px" },
        pt: { xs: "40px", md: "100px" },
      }}
    >
      {/* Header */}
      <Grid container spacing={2} columns={12} sx={{ mb: 3 }}>
        <Grid size={12}>
          <Card variant="outlined">
            <CardContent>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                sx={{ alignItems: { xs: "flex-start", sm: "center" } }}
              >
                <Avatar
                  src={candidate.photo}
                  alt={candidate.name}
                  sx={{ width: 96, height: 96 }}
                />
                <Stack spacing={0.5}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {candidate.name}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "text.secondary" }}>
                    {candidate.standing}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    <Chip label={candidate.party} size="small" />
                    <Chip
                      label={candidate.since}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} columns={12}>
        {/* Left column */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={2}>
            {/* Bills / focus summary */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Legislative focus
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mb: 1.5 }}>
                  {focusAreas.map((area) => (
                    <Chip key={area} label={area} size="small" color="primary" variant="outlined" />
                  ))}
                </Stack>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {billsSummary}
                </Typography>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Campaign and office timeline
                </Typography>
                <Stack spacing={0}>
                  {timeline.map((event, index) => (
                    <Stack key={index} direction="row" spacing={2}>
                      <Stack sx={{ alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor:
                              event.type === "term" ? "primary.main" : "text.disabled",
                            mt: 0.7,
                          }}
                        />
                        {index < timeline.length - 1 && (
                          <Box
                            sx={{
                              width: "1px",
                              flexGrow: 1,
                              bgcolor: "divider",
                              minHeight: 24,
                            }}
                          />
                        )}
                      </Stack>
                      <Stack sx={{ pb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {event.year}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {event.label}
                        </Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* News */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Related news
                </Typography>
                <List disablePadding>
                  {newsArticles.map((article, index) => (
                    <ListItem
                      key={index}
                      disablePadding
                      sx={{
                        py: 1,
                        borderBottom:
                          index < newsArticles.length - 1 ? "1px solid" : "none",
                        borderColor: "divider",
                      }}
                    >
                      <ListItemText
                        primary={
                          <Link href={article.href} variant="body2" sx={{ fontWeight: 500 }}>
                            {article.title}
                          </Link>
                        }
                        secondary={`${article.source} · ${article.date}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right column */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2}>
            {/* Donations pie chart */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Campaign donations
                </Typography>
                <Tabs
                  value={year}
                  onChange={(_, value) => setYear(value)}
                  variant="scrollable"
                  scrollButtons={false}
                  sx={{ minHeight: 32, mb: 1 }}
                >
                  <Tab label="All years" value="all" sx={{ minHeight: 32 }} />
                  <Tab label="2024" value={2024} sx={{ minHeight: 32 }} />
                  <Tab label="2023" value={2023} sx={{ minHeight: 32 }} />
                  <Tab label="2022" value={2022} sx={{ minHeight: 32 }} />
                </Tabs>
                <PieChart
                  series={[
                    {
                      data: donations,
                      innerRadius: 40,
                      paddingAngle: 1,
                      cornerRadius: 2,
                    },
                  ]}
                  height={220}
                  slotProps={{ legend: { hidden: true } }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", textAlign: "center", mt: 1 }}
                >
                  Total: ${totalDonations.toLocaleString()}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Stack spacing={0.75}>
                  {donations.map((d) => (
                    <Stack key={d.id} direction="row" sx={{ justifyContent: "space-between" }}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {d.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ${d.value.toLocaleString()}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Top sponsor categories */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Top sponsor categories
                </Typography>
                <List disablePadding>
                  {topSponsorCategories.map((cat, index) => (
                    <ListItem
                      key={cat.name}
                      disablePadding
                      sx={{
                        py: 0.75,
                        justifyContent: "space-between",
                        borderBottom:
                          index < topSponsorCategories.length - 1 ? "1px solid" : "none",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="body2">{cat.name}</Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {cat.amount}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}