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
  Avatar,
  Chip,
  Divider,
  Tabs,
  Tab,
  Link,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Skeleton,
  LinearProgress,
} from "@mui/material";

import { BarChart } from "@mui/x-charts/BarChart";

import { useAtom } from "jotai";
import SummaryEmptyState from "#/components/dashboard/SummaryEmptyState";
import ArrowOutwardOutlinedIcon from "@mui/icons-material/ArrowOutwardOutlined";
import { useTheme } from "@mui/material/styles";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import {
  PoliticiansDetailedAtom,
  SelectedPoliticianDetailedAtom,
} from "#/util/State";

import {
  IsPoliticianSelectedAtom,
  DonationSlice,
  TimelineEvent,
  NewsArticle,
  DashboardSideMenuTabAtom,
} from "#/util/State";

const timeline: TimelineEvent[] = [
  { year: "2010", label: "Ran for House (TN-3)", type: "campaign" },
  { year: "2011", label: "Began term as House (TN-3)", type: "term" },
  { year: "2012", label: "Ran for House (TN-3)", type: "campaign" },
  { year: "2013", label: "Began term as House (TN-3)", type: "term" },
  {
    year: "2024",
    label: "Ran for re-election to House (TN-3)",
    type: "campaign",
  },
  { year: "2025", label: "Began term as House (TN-3)", type: "term" },
];

// Top sponsor categories now vary by year, matching the donations tab structure
const donationsByYear: Record<string, DonationSlice[]> = {
  all: [
    { name: "Healthcare", value: 410000 },
    { name: "Technology", value: 275000 },
    { name: "Energy", value: 190000 },
    { name: "Finance", value: 140000 },
  ],
  "2024": [
    { name: "Healthcare", value: 170000 },
    { name: "Technology", value: 120000 },
    { name: "Energy", value: 80000 },
    { name: "Finance", value: 60000 },
  ],
  "2023": [
    { name: "Healthcare", value: 140000 },
    { name: "Technology", value: 95000 },
    { name: "Energy", value: 65000 },
    { name: "Finance", value: 45000 },
  ],
  "2022": [
    { name: "Healthcare", value: 100000 },
    { name: "Technology", value: 60000 },
    { name: "Energy", value: 45000 },
    { name: "Finance", value: 35000 },
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
function getChipPartyColor(
  party: string | undefined,
): "primary" | "error" | "default" {
  if (!party) {
    return "default";
  }

  switch (party.charAt(0).toUpperCase()) {
    case "D":
      return "primary";
    case "R":
      return "error";
    default:
      return "default";
  }
}

function getPartyColor(theme: any, party: string | undefined): string {
  if (!party) {
    return theme.palette.grey[400];
  }

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
  const candidateSummary = null;
  const [electionYear, setElectionYear] = useState<string>("all");
  const [termYear, setTermYear] = useState<string>("all");
  const [personSelected, setPersonSelectedAtom] = useAtom(
    IsPoliticianSelectedAtom,
  );

  // Only one politician can be selected at a time. `false` = none selected.
  const [selectedPoliticianId, setSelectedPoliticianId] = useAtom(
    SelectedPoliticianDetailedAtom,
  );

  const [politicianDetailed, setPoliticianDetailed] = useAtom(
    PoliticiansDetailedAtom,
  );

  const [tab, setTab] = useAtom(DashboardSideMenuTabAtom);

  const [show, setShow] = useState(false);
  useEffect(() => setShow(true), []);

  const [candidate, setSelectedPoliticianDetailed] = useAtom(
    SelectedPoliticianDetailedAtom,
  );
  useEffect(() => {
    setElectionYear("all");
    setTermYear("all");
  }, [candidate?.name]);

  const topBillCategories = candidate?.billCategoriesByYear?.[termYear] ?? [];
  const totalSponsored = topBillCategories.reduce((sum, d) => sum + d.value, 0);

  const topDonationCategories =
    candidate?.donationsByYear?.[electionYear] ?? [];
  const totalDonations = topDonationCategories.reduce(
    (sum, d) => sum + d.value,
    0,
  );

  // A single readiness flag drives every skeleton/loading state below.
  // Once the candidate record has come back from the API, everything
  // derived from it (timeline, charts, lists, news) can render for real.
  const isLoading = !candidate?.name;

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
                    {candidate?.photoSrc ? (
                      <Avatar
                        src={candidate?.photoSrc}
                        alt={candidate?.name}
                        sx={{
                          width: 96,
                          height: 96,
                          border: "3px solid",
                          borderColor: getPartyColor(theme, candidate?.party),
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        }}
                      />
                    ) : (
                      <Skeleton variant="circular">
                        <Avatar
                          sx={{
                            width: 96,
                            height: 96,
                            border: "3px solid",
                            borderColor: getPartyColor(theme, candidate?.party),
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          }}
                        />
                      </Skeleton>
                    )}

                    <Stack spacing={0.5}>
                      {candidate?.name ? (
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
                        >
                          {candidate?.name}
                        </Typography>
                      ) : (
                        <Skeleton width="140px">
                          <Typography variant="h5">.</Typography>
                        </Skeleton>
                      )}

                      {candidate?.status ? (
                        <Typography
                          variant="body1"
                          sx={{ color: "text.secondary", whiteSpace: "nowrap" }}
                        >
                          {candidate?.status}
                        </Typography>
                      ) : (
                        <Skeleton width="110px">
                          <Typography variant="body1">.</Typography>
                        </Skeleton>
                      )}

                      <Stack direction="row" spacing={1}>
                        {candidate?.status ? (
                          <>
                            <Chip
                              label={candidate?.party}
                              size="small"
                              color={getChipPartyColor(candidate?.party)}
                            />
                            <Chip
                              label={candidate?.latestYear}
                              size="small"
                              variant="outlined"
                            />
                          </>
                        ) : (
                          <>
                            <Skeleton
                              variant="rounded"
                              width={60}
                              height={24}
                            />
                            <Skeleton
                              variant="rounded"
                              width={60}
                              height={24}
                            />
                          </>
                        )}
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grow>
            {/* Summary */}
            <Grow
              in={show}
              timeout={LOADING_ANIMATION_DURATION}
              style={{ transitionDelay: LOADING_DELAY_1 }}
            >
              <Card
                variant="outlined"
                sx={{ flexGrow: 1, minWidth: 0, overflow: "hidden" }}
              >
                {}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    px: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <SmartToyIcon />
                  AI Summary
                </Typography>
                <CardContent sx={{ overflowX: "auto", ...customScrollbarSx }}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ fontWeight: 600, mb: 2, px: 2 }}
                  >
                    {candidateSummary ? (
                      candidateSummary
                    ) : (
                      <Stack spacing={1} sx={{ width: "100%", py: 1 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: "center" }}
                        >
                          <CircularProgress
                            size="1.1rem"
                            aria-label="Loading…"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Generating summary…
                          </Typography>
                        </Stack>
                        <Skeleton variant="text" width="95%" />
                        <Skeleton variant="text" width="88%" />
                        <Skeleton variant="text" width="70%" />
                      </Stack>
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grow>
          </Stack>

          {/* Timeline */}
          <Grow
            in={show}
            timeout={LOADING_ANIMATION_DURATION}
            style={{ transitionDelay: LOADING_DELAY_1 }}
          >
            <Card
              variant="outlined"
              sx={{
                flexGrow: 1,
                minWidth: 0,
                overflow: "hidden",
                marginBottom: 2,
                minHeight: "100px",
                transition: "200ms",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, px: 2 }}>
                Campaign and office timeline
              </Typography>
              <CardContent sx={{ overflowX: "scroll", ...customScrollbarSx }}>
                <Stack
                  direction="row"
                  spacing={0}
                  sx={{ width: "max-content", minWidth: "100%" }}
                >
                  {candidate?.timeline ? (
                    candidate.timeline.map((event, index) => (
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
                              height: "2px",
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
                              height: "2px",
                              bgcolor:
                                index < (candidate?.timeline?.length ?? 0) - 1
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
                    ))
                  ) : (
                    <Stack sx={{ width: "100%", my: 1 }} spacing={1}>
                      <Box sx={{ width: "100%" }}>
                        <LinearProgress aria-label="Loading…" />
                      </Box>
                      <Stack direction="row" spacing={4} sx={{ px: 1 }}>
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Stack
                            key={i}
                            sx={{ alignItems: "center", width: 140 }}
                          >
                            <Skeleton
                              variant="circular"
                              width={10}
                              height={10}
                            />
                            <Skeleton width={50} sx={{ mt: 0.5 }} />
                            <Skeleton width={100} />
                          </Stack>
                        ))}
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grow>

          <Grid container spacing={2} columns={12}>
            {/* Left column */}
            <Grid size={{ xs: 12, lg: 6 }}>
              {/* Bills / focus summary */}
              <Stack spacing={2}>
                <Grow
                  in={show}
                  timeout={LOADING_ANIMATION_DURATION}
                  style={{ transitionDelay: LOADING_DELAY_1 }}
                >
                  <Card variant="outlined">
                    <CardContent>
                      <Typography sx={{ fontWeight: 600, mb: 1 }}>
                        {isLoading ? (
                          <Skeleton variant="rounded" width={260} height={36} />
                        ) : (
                          <Button
                            variant="contained"
                            endIcon={<ArrowOutwardOutlinedIcon />}
                            onClick={() => {
                              setTab(1);
                            }}
                          >
                            Bills Sponsored / Co-sponsored
                          </Button>
                        )}
                      </Typography>
                      {!candidate?.billCategoriesByYear ? (
                        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                          {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} width={60} height={32} />
                          ))}
                        </Stack>
                      ) : (
                        <Tabs
                          value={termYear}
                          onChange={(_, value: string) => setTermYear(value)}
                          variant="scrollable"
                          scrollButtons={true}
                          sx={{ minHeight: 32, mb: 1 }}
                        >
                          {Object.keys(candidate?.billCategoriesByYear ?? {})
                            .sort((a, b) => {
                              if (a === "all") return -1;
                              if (b === "all") return 1;
                              return a.localeCompare(b);
                            })
                            .map((year) => (
                              <Tab
                                key={year}
                                label={year === "all" ? "All" : year}
                                value={year}
                                sx={{ minHeight: 32 }}
                              />
                            ))}
                        </Tabs>
                      )}
                      {!candidate?.billCategoriesByYear ? (
                        <Stack sx={{ alignItems: "center", py: 2 }}>
                          <Skeleton
                            variant="rounded"
                            width="100%"
                            height={320}
                          />
                        </Stack>
                      ) : (
                        <BarChart
                          dataset={[...topBillCategories].sort(
                            (a, b) => b.value - a.value,
                          )}
                          yAxis={[
                            { scaleType: "band", dataKey: "name", width: 140 },
                          ]}
                          series={[{ dataKey: "value", label: "Bills" }]}
                          layout="horizontal"
                          height={Math.max(280, topBillCategories.length * 28)}
                        />
                      )}
                      {!candidate?.billCategoriesByYear ? (
                        <Skeleton width="50%" sx={{ mx: "auto", mt: 1 }} />
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            textAlign: "center",
                            mt: 1,
                          }}
                        >
                          Bills Sponsored: {totalSponsored.toLocaleString()}
                        </Typography>
                      )}
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
                        {isLoading ? (
                          <Skeleton variant="rounded" width={220} height={36} />
                        ) : (
                          <Button
                            variant="contained"
                            endIcon={<ArrowOutwardOutlinedIcon />}
                            onClick={() => {
                              setTab(2);
                            }}
                          >
                            Campaign Donations
                          </Button>
                        )}
                      </Typography>
                      {!candidate?.donationsByYear ? (
                        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                          {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} width={60} height={32} />
                          ))}
                        </Stack>
                      ) : (
                        <Tabs
                          value={electionYear}
                          onChange={(_, value: string) =>
                            setElectionYear(value)
                          }
                          variant="scrollable"
                          scrollButtons={true}
                          sx={{ minHeight: 32, mb: 1 }}
                        >
                          {Object.keys(candidate?.donationsByYear ?? {})
                            .sort((a, b) => {
                              if (a === "all") return -1;
                              if (b === "all") return 1;
                              return a.localeCompare(b);
                            })
                            .map((year) => (
                              <Tab
                                key={year}
                                label={year === "all" ? "All" : year}
                                value={year}
                                sx={{ minHeight: 32 }}
                              />
                            ))}
                        </Tabs>
                      )}
                      {!candidate?.donationsByYear ? (
                        <Stack sx={{ alignItems: "center", py: 2 }}>
                          <Skeleton
                            variant="rounded"
                            width="100%"
                            height={320}
                          />
                        </Stack>
                      ) : (
                        <BarChart
                          dataset={[...topDonationCategories].sort(
                            (a, b) => b.value - a.value,
                          )}
                          yAxis={[
                            { scaleType: "band", dataKey: "name", width: 140 },
                          ]}
                          series={[
                            {
                              dataKey: "value",
                              label: "Donations",
                              valueFormatter: (v: number | null) =>
                                `$${(v ?? 0).toLocaleString()}`,
                            },
                          ]}
                          layout="horizontal"
                          height={Math.max(
                            280,
                            topDonationCategories.length * 28,
                          )}
                        />
                      )}
                      {!candidate?.donationsByYear ? (
                        <Skeleton width="40%" sx={{ mx: "auto", mt: 1 }} />
                      ) : (
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
                      )}
                    </CardContent>
                  </Card>
                </Grow>

                {/* News */}
                {/* <Grow
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
                        {isLoading
                          ? Array.from({ length: 3 }).map((_, index) => (
                              <ListItem
                                key={index}
                                disablePadding
                                sx={{
                                  py: 1,
                                  borderBottom:
                                    index < 2 ? "1px solid" : "none",
                                  borderColor: "divider",
                                }}
                              >
                                <ListItemText
                                  primary={<Skeleton width="80%" />}
                                  secondary={<Skeleton width="40%" />}
                                />
                              </ListItem>
                            ))
                          : newsArticles.map((article, index) => (
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
                </Grow> */}
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
