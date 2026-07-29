"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Button,
  Stack,
  Typography,
  Card,
  CardContent,
  Grow,
  Fade,
  Avatar,
  Chip,
  Divider,
  Tabs,
  Tab,
  Link,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { useAtom } from "jotai";
import SummaryEmptyState from "#/components/dashboard/SummaryEmptyState";
import { DashboardSideMenuTabAtom } from "#/util/State";
import ArrowOutwardOutlinedIcon from "@mui/icons-material/ArrowOutwardOutlined";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import {
  isPoliticianSelectedAtom,
  DonationSlice,
  TimelineEvent,
  NewsArticle,
  SponsorCategory,
} from "#/util/State";

// ---- Template data ----
const candidate = {
  name: "Jordan Ellis",
  photo: "/candidates/jordan-ellis.jpg",
  standing: "U.S. Senator for Washington",
  party: "Democrat",
  since: "In office since 2019",
};

const timeline: TimelineEvent[] = [
  { year: "2024", label: "Re-elected to U.S. Senate", type: "term" },
  { year: "2019–2024", label: "First term, U.S. Senate", type: "term" },
  {
    year: "2018",
    label: "Won special election for U.S. Senate",
    type: "campaign",
  },
  {
    year: "2014–2018",
    label: "U.S. House of Representatives, WA-7",
    type: "term",
  },
  { year: "2012", label: "Elected to U.S. House", type: "campaign" },
  { year: "2012", label: "Elected to U.S. House", type: "campaign" },
  { year: "2012", label: "Elected to U.S. House", type: "campaign" },
  { year: "2012", label: "Elected to U.S. House", type: "campaign" },
  { year: "2012", label: "Elected to U.S. House", type: "campaign" },
  { year: "2012", label: "Elected to U.S. House", type: "campaign" },
  { year: "2012", label: "Elected to U.S. House", type: "campaign" },
  { year: "2012", label: "Elected to U.S. House", type: "campaign" },
  { year: "2012", label: "Elected to U.S. House", type: "campaign" },
  { year: "2012", label: "Elected to U.S. House", type: "campaign" },
  { year: "2012", label: "Elected to U.S. House", type: "campaign" },
  { year: "2012", label: "Elected to U.S. House", type: "campaign" },
];

const focusAreas = [
  "Healthcare",
  "Climate policy",
  "Veterans affairs",
  "Tax reform",
];

const billsSummary =
  "Sponsored 42 bills this term, concentrated in healthcare access and climate infrastructure. Co-sponsored the Rural Broadband Expansion Act and the Veterans Mental Health Funding Act.";

const donationsByYear: Record<string, DonationSlice[]> = {
  all: [
    { id: 0, label: "Individual donors", value: 1250000 },
    { id: 1, label: "PACs", value: 480000 },
    { id: 2, label: "Party committee", value: 210000 },
    { id: 3, label: "Self-funded", value: 30000 },
  ],
  "2024": [
    { id: 0, label: "Individual donors", value: 520000 },
    { id: 1, label: "PACs", value: 190000 },
    { id: 2, label: "Party committee", value: 90000 },
    { id: 3, label: "Self-funded", value: 10000 },
  ],
  "2023": [
    { id: 0, label: "Individual donors", value: 410000 },
    { id: 1, label: "PACs", value: 160000 },
    { id: 2, label: "Party committee", value: 70000 },
    { id: 3, label: "Self-funded", value: 15000 },
  ],
  "2022": [
    { id: 0, label: "Individual donors", value: 320000 },
    { id: 1, label: "PACs", value: 130000 },
    { id: 2, label: "Party committee", value: 50000 },
    { id: 3, label: "Self-funded", value: 5000 },
  ],
};

const billCategoriesByYear: Record<string, DonationSlice[]> = {
  all: [
    { id: 0, label: "Isreal", value: 15 },
    { id: 1, label: "Big Pharma", value: 2 },
    { id: 2, label: "Killing Kids", value: 1 },
    { id: 3, label: "Epstein", value: 14 },
  ],
  "2024": [
    { id: 0, label: "Isreal", value: 5 },
    { id: 1, label: "Big Pharma", value: 1 },
    { id: 2, label: "Killing Kids", value: 1 },
    { id: 3, label: "Epstein", value: 7 },
  ],
  "2023": [
    { id: 0, label: "Isreal", value: 3 },
    { id: 1, label: "Big Pharma", value: 1 },
    { id: 2, label: "Killing Kids", value: 0 },
    { id: 3, label: "Epstein", value: 7 },
  ],
  "2022": [
    { id: 0, label: "Isreal", value: 7 },
    { id: 1, label: "Big Pharma", value: 0 },
    { id: 2, label: "Killing Kids", value: 0 },
    { id: 3, label: "Epstein", value: 0 },
  ],
};

// Top sponsor categories now vary by year, matching the donations tab structure
const topSponsorCategoriesByYear: Record<string, SponsorCategory[]> = {
  all: [
    { name: "Healthcare", amount: "$410,000" },
    { name: "Technology", amount: "$275,000" },
    { name: "Energy", amount: "$190,000" },
    { name: "Finance", amount: "$140,000" },
  ],
  "2024": [
    { name: "Healthcare", amount: "$170,000" },
    { name: "Technology", amount: "$120,000" },
    { name: "Energy", amount: "$80,000" },
    { name: "Finance", amount: "$60,000" },
  ],
  "2023": [
    { name: "Healthcare", amount: "$140,000" },
    { name: "Technology", amount: "$95,000" },
    { name: "Energy", amount: "$65,000" },
    { name: "Finance", amount: "$45,000" },
  ],
  "2022": [
    { name: "Healthcare", amount: "$100,000" },
    { name: "Technology", amount: "$60,000" },
    { name: "Energy", amount: "$45,000" },
    { name: "Finance", amount: "$35,000" },
  ],
};

const newsArticles: NewsArticle[] = [
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

// Animation Timings
const LOADING_ANIMATION_DURATION = 500;
const LOADING_DELAY_0 = "0ms";
const LOADING_DELAY_1 = "100ms";
const LOADING_DELAY_2 = "200ms";

// ---- Custom scrollbar sx (reusable) ----
const customScrollbarSx = {
  scrollbarWidth: "thin",
  scrollbarColor: "hsl(220, 20%, 35%) transparent",
  "&::-webkit-scrollbar": {
    height: 8,
    width: 8,
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "hsl(220, 20%, 35%)",
    borderRadius: 8,
    border: "2px solid transparent",
    backgroundClip: "padding-box",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "hsl(220, 20%, 42%)",
  },
  "&::-webkit-scrollbar-corner": {
    background: "transparent",
  },
} as const;

// ---- Helpers ----
function getChipPartyColor(party: string): "primary" | "error" | "default" {
  switch (party.charAt(0).toUpperCase()) {
    case "D":
      return "primary";
    case "R":
      return "error";
    default:
      return "default";
  }
}

function getPartyColor(theme: any, party: string): string {
  switch (party.charAt(0).toUpperCase()) {
    case "D":
      return theme.palette.primary.main;
    case "R":
      return theme.palette.error.main;
    case "I":
      return theme.palette.grey[600];
    default:
      return theme.palette.grey[400];
  }
}

// ---- Component ----

export default function Summary() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isPortrait = useMediaQuery("(orientation: portrait)");

  const [year, setYear] = useState<string>("all");
  const [personSelected, setPersonSelectedAtom] = useAtom(
    isPoliticianSelectedAtom,
  );
  const [tab, setTab] = useAtom(DashboardSideMenuTabAtom);

  const [show, setShow] = useState(false);
  useEffect(() => setShow(true), []);

  const donations = donationsByYear[year];
  const billCategories = billCategoriesByYear[year];
  const topSponsorCategories = topSponsorCategoriesByYear[year];
  const totalDonations = donations.reduce(
    (sum: number, d: DonationSlice) => sum + d.value,
    0,
  );

  return (
    <>
      {personSelected ? (
        <Box
          sx={{
            width: "100%",
            maxWidth: { sm: "100%", md: "1700px" },
            pt: { xs: "40px", md: "100px" },
          }}
        >
          <Stack
            direction={{ sm: "column", md: "row" }}
            spacing={2}
            sx={{ width: "100%", mb: 2 }}
          >
            {/* Header */}
            <Grow
              in={show}
              timeout={LOADING_ANIMATION_DURATION}
              style={{ transitionDelay: LOADING_DELAY_0 }}
            >
              <Card
                elevation={0}
                sx={{ flexShrink: 0, width: { sm: "100%", md: "fit-content" } }}
              >
                <CardContent
                  sx={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={3}
                    sx={{ alignItems: "center" }}
                  >
                    <Avatar
                      src={candidate.photo}
                      alt={candidate.name}
                      sx={{
                        width: 96,
                        height: 96,
                        border: "3px solid",
                        borderColor: getPartyColor(theme, candidate.party),
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    />
                    <Stack spacing={0.5}>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
                      >
                        {candidate.name}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: "text.secondary", whiteSpace: "nowrap" }}
                      >
                        {candidate.standing}
                      </Typography>
                      <Stack direction="row" spacing={1} >
                        <Chip
                          label={candidate.party}
                          size="small"
                          color={getChipPartyColor(candidate.party)}
                        />
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
            </Grow>

            {/* Timeline */}
            <Grow
              in={show}
              timeout={LOADING_ANIMATION_DURATION}
              style={{ transitionDelay: LOADING_DELAY_1 }}
            >
              <Card
                variant="outlined"
                sx={{ flexGrow: 1, minWidth: 0, overflow: "hidden" }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2, px: 2 }}
                >
                  Campaign and office timeline
                </Typography>
                <CardContent sx={{ overflowX: "auto", ...customScrollbarSx }}>
                  <Stack
                    direction="row"
                    spacing={0}
                    sx={{ width: "max-content", minWidth: "100%" }}
                  >
                    {timeline.map((event, index) => (
                      <Stack
                        key={index}
                        sx={{ width: 140, flexShrink: 0, alignItems: "center" }}
                      >
                        <Stack
                          direction="row"
                          sx={{ width: "100%", alignItems: "center" }}
                        >
                          <Box
                            sx={{
                              flexGrow: 1,
                              height: "1px",
                              bgcolor: index > 0 ? "divider" : "transparent",
                            }}
                          />
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              flexShrink: 0,
                              bgcolor:
                                event.type === "term"
                                  ? "primary.main"
                                  : "text.disabled",
                            }}
                          />
                          <Box
                            sx={{
                              flexGrow: 1,
                              height: "1px",
                              bgcolor:
                                index < timeline.length - 1
                                  ? "divider"
                                  : "transparent",
                            }}
                          />
                        </Stack>
                        <Stack sx={{ alignItems: "center", px: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {event.year}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              textAlign: "center",
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                            }}
                          >
                            {event.label}
                          </Typography>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grow>
          </Stack>

          <Grid container spacing={2} columns={12}>
            {/* Left column */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack spacing={2}>
                {/* Bills / focus summary */}
                <Grow
                  in={show}
                  timeout={LOADING_ANIMATION_DURATION}
                  style={{ transitionDelay: LOADING_DELAY_1 }}
                >
                  <Card variant="outlined">
                    <CardContent>
                      <Typography sx={{ fontWeight: 600, mb: 1 }}>
                        <Button
                          variant="contained"
                          endIcon={<ArrowOutwardOutlinedIcon />}
                          onClick={() => {
                            setTab(1);
                          }}
                        >
                          Bills Sponsored / Co-sponsored
                        </Button>
                      </Typography>
                      <Tabs
                        value={year}
                        onChange={(_, value: string) => setYear(value)}
                        variant="scrollable"
                        scrollButtons={false}
                        sx={{ minHeight: 32, mb: 1 }}
                      >
                        <Tab
                          label="All years"
                          value="all"
                          sx={{ minHeight: 32 }}
                        />
                        <Tab label="2024" value="2024" sx={{ minHeight: 32 }} />
                        <Tab label="2023" value="2023" sx={{ minHeight: 32 }} />
                        <Tab label="2022" value="2022" sx={{ minHeight: 32 }} />
                      </Tabs>
                      <PieChart
                        series={[
                          {
                            data: billCategories,
                            innerRadius: 40,
                            paddingAngle: 1,
                            cornerRadius: 2,
                          },
                        ]}
                        height={260}
                        slotProps={{
                          legend: {
                            direction: "horizontal",
                            position: {
                              vertical: "bottom",
                              horizontal: "center",
                            },
                          },
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          textAlign: "center",
                          mt: 1,
                        }}
                      >
                        Total: ${totalDonations.toLocaleString()}
                      </Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Stack spacing={0.75}>
                        {donations.map((d) => (
                          <Stack
                            key={d.id}
                            direction="row"
                            sx={{ justifyContent: "space-between" }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary" }}
                            >
                              {d.label}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              ${d.value.toLocaleString()}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grow>
              </Stack>
            </Grid>

            {/* Right column */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack spacing={2}>
                {/* Donations pie chart + top sponsor categories (merged) */}
                <Grow
                  in={show}
                  timeout={LOADING_ANIMATION_DURATION}
                  style={{ transitionDelay: LOADING_DELAY_1 }}
                >
                  <Card variant="outlined">
                    <CardContent>
                      <Typography sx={{ fontWeight: 600, mb: 1 }}>
                        <Button
                          variant="contained"
                          endIcon={<ArrowOutwardOutlinedIcon />}
                          onClick={() => {
                            setTab(2);
                          }}
                        >
                          Campaign Donations
                        </Button>
                      </Typography>
                      <Tabs
                        value={year}
                        onChange={(_, value: string) => setYear(value)}
                        variant="scrollable"
                        scrollButtons={false}
                        sx={{ minHeight: 32, mb: 1 }}
                      >
                        <Tab
                          label="All years"
                          value="all"
                          sx={{ minHeight: 32 }}
                        />
                        <Tab label="2024" value="2024" sx={{ minHeight: 32 }} />
                        <Tab label="2023" value="2023" sx={{ minHeight: 32 }} />
                        <Tab label="2022" value="2022" sx={{ minHeight: 32 }} />
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
                        height={260}
                        slotProps={{
                          legend: {
                            direction: "horizontal",
                            position: {
                              vertical: "bottom",
                              horizontal: "center",
                            },
                          },
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          textAlign: "center",
                          mt: 1,
                        }}
                      >
                        Total: ${totalDonations.toLocaleString()}
                      </Typography>

                      <Divider sx={{ my: 1.5 }} />
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
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
                                index < topSponsorCategories.length - 1
                                  ? "1px solid"
                                  : "none",
                              borderColor: "divider",
                            }}
                          >
                            <Typography variant="body2">{cat.name}</Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary" }}
                            >
                              {cat.amount}
                            </Typography>
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grow>

                {/* News */}
                <Grow
                  in={show}
                  timeout={LOADING_ANIMATION_DURATION}
                  style={{ transitionDelay: LOADING_DELAY_2 }}
                >
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
                                index < newsArticles.length - 1
                                  ? "1px solid"
                                  : "none",
                              borderColor: "divider",
                            }}
                          >
                            <ListItemText
                              primary={
                                <Link
                                  href={article.href}
                                  variant="body2"
                                  sx={{ fontWeight: 500 }}
                                >
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
                </Grow>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <SummaryEmptyState />
      )}
    </>
  );
}
