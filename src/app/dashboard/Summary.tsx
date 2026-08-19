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
  NewsArticle,
  DashboardSideMenuTabAtom,
  NewsCategory,
} from "#/util/State";

const currency = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

// Breakdown fields for the stacked bar — order matters (matches bar segment order)
const CONTRIBUTION_BREAKDOWN: { key: string; label: string; color: string }[] =
  [
    {
      key: "large_donors",
      label: "Large Individual Contributions",
      color: "#0d3b2e",
    },
    {
      key: "small_donors",
      label: "Small Individual Contributions (< $200)",
      color: "#2ecc71",
    },
    { key: "pac", label: "PAC Contributions", color: "#c9b8f5" },
    { key: "other", label: "Other", color: "#f5a623" },
  ];

const percent = (n: number, total: number) =>
  total > 0 ? `${((n / total) * 100).toFixed(2)}%` : "0.00%";

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
  const [newsCategory, setNewsCategory] = useState<NewsCategory>("scrutiny");

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
  const firstArticlePerBucket = Object.keys(candidate?.newsArticles ?? {})
    .map((bucket) => {
      const article = candidate?.newsArticles?.[bucket]?.[0];
      return article ? { ...article, bucket } : null;
    })
    .filter(
      (entry): entry is NewsArticle & { bucket: string } => entry !== null,
    );
  const topDonationCategories =
    candidate?.donationsByYear?.[electionYear] ?? [];
  const totalDonations = topDonationCategories.reduce(
    (sum, d) => sum + d.value,
    0,
  );

  const campaignTotalsForYear = candidate?.campaignTotals?.[electionYear] as
    | Record<string, number | undefined>
    | undefined;

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
                    component="div"
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
          {/* News */}
          <Grow
            in={show}
            timeout={LOADING_ANIMATION_DURATION}
            style={{ transitionDelay: LOADING_DELAY_2 }}
          >
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Button
                  variant="contained"
                  endIcon={<ArrowOutwardOutlinedIcon />}
                  onClick={() => {
                    setTab(2);
                  }}
                >
                  News
                </Button>
                <List disablePadding>
                  {firstArticlePerBucket.map((article, i) => (
                    <ListItem
                      key={article.link || i}
                      disablePadding
                      sx={{
                        py: 1,
                        borderBottom:
                          i < firstArticlePerBucket.length - 1
                            ? "1px solid"
                            : "none",
                        borderColor: "divider",
                      }}
                    >
                      <ListItemText
                        primary={
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: "center" }}
                          >
                            <Chip
                              label={article.bucket}
                              size="small"
                              variant="outlined"
                              sx={{
                                textTransform: "capitalize",
                                height: 20,
                                fontSize: 11,
                              }}
                            />
                            <Link
                              href={article.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {article.title}
                            </Link>
                          </Stack>
                        }
                        secondary={`${article.source}${
                          article.source && article.pubDate ? " · " : ""
                        }${article.pubDate ? new Date(article.pubDate).toLocaleDateString() : ""}`}
                      />
                    </ListItem>
                  ))}
                </List>
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
                              setTab(3);
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
                              return b.localeCompare(a);
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
                <Grow
                  in={show}
                  timeout={LOADING_ANIMATION_DURATION}
                  style={{ transitionDelay: LOADING_DELAY_1 }}
                >
                  {/* Financial Totals */}
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Financial Totals
                      </Typography>

                      {!candidate?.campaignTotals ? (
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
                          {Object.keys(candidate?.campaignTotals ?? {})
                            .sort((a, b) => {
                              if (a === "all") return -1;
                              if (b === "all") return 1;
                              return b.localeCompare(a);
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

                      {/* Campaign Committee Contribution Sources breakdown */}
                      {!candidate?.campaignTotals ? (
                        <Stack spacing={2} sx={{ mb: 1 }}>
                          <Skeleton
                            variant="rounded"
                            width="100%"
                            height={40}
                          />
                          <List disablePadding dense>
                            {Array.from({ length: 4 }).map((_, i) => (
                              <ListItem
                                key={i}
                                disablePadding
                                sx={{
                                  py: 1,
                                  justifyContent: "space-between",
                                  borderTop: i === 0 ? "none" : "1px solid",
                                  borderColor: "divider",
                                }}
                              >
                                <Skeleton width="50%" />
                                <Skeleton width="20%" />
                              </ListItem>
                            ))}
                          </List>
                        </Stack>
                      ) : (
                        (() => {
                          const total = CONTRIBUTION_BREAKDOWN.reduce(
                            (sum, field) =>
                              sum +
                              (Number(campaignTotalsForYear?.[field.key]) || 0),
                            0,
                          );

                          return (
                            <Box sx={{ mb: 1 }}>
                              {/* Stacked bar */}
                              <Box
                                sx={{
                                  display: "flex",
                                  width: "100%",
                                  height: 40,
                                  borderRadius: 1,
                                  overflow: "hidden",
                                  mb: 2,
                                }}
                              >
                                {CONTRIBUTION_BREAKDOWN.map((field) => {
                                  const value =
                                    Number(
                                      campaignTotalsForYear?.[field.key],
                                    ) || 0;
                                  const widthPct =
                                    total > 0 ? (value / total) * 100 : 0;
                                  if (widthPct <= 0) return null;
                                  return (
                                    <Box
                                      key={field.key}
                                      sx={{
                                        width: `${widthPct}%`,
                                        bgcolor: field.color,
                                        minWidth: value > 0 ? 4 : 0,
                                      }}
                                    />
                                  );
                                })}
                              </Box>

                              {/* Legend / breakdown list */}
                              <List disablePadding dense>
                                {CONTRIBUTION_BREAKDOWN.map((field, i) => {
                                  const value =
                                    Number(
                                      campaignTotalsForYear?.[field.key],
                                    ) || 0;
                                  return (
                                    <ListItem
                                      key={field.key}
                                      disablePadding
                                      sx={{
                                        py: 1,
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 1.5,
                                        borderTop:
                                          i === 0 ? "none" : "1px solid",
                                        borderColor: "divider",
                                      }}
                                    >
                                      <Stack
                                        direction="row"
                                        spacing={1.5}
                                        sx={{
                                          alignItems: "center",
                                          minWidth: 0,
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: "50%",
                                            bgcolor: field.color,
                                            flexShrink: 0,
                                          }}
                                        />
                                        <Typography variant="body2" noWrap>
                                          {field.label}
                                        </Typography>
                                      </Stack>

                                      <Stack
                                        direction="row"
                                        spacing={2}
                                        sx={{ flexShrink: 0 }}
                                      >
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontWeight: 600,
                                            fontVariantNumeric: "tabular-nums",
                                          }}
                                        >
                                          {currency(value)}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: "text.secondary",
                                            width: 56,
                                            textAlign: "right",
                                          }}
                                        >
                                          {percent(value, total)}
                                        </Typography>
                                      </Stack>
                                    </ListItem>
                                  );
                                })}
                              </List>
                            </Box>
                          );
                        })()
                      )}

                      <Divider sx={{ mb: 2 }} />

                      <Typography sx={{ fontWeight: 600, mb: 1 }}>
                        {isLoading ? (
                          <Skeleton variant="rounded" width={220} height={36} />
                        ) : (
                          <Button
                            variant="contained"
                            endIcon={<ArrowOutwardOutlinedIcon />}
                            onClick={() => {
                              setTab(4);
                            }}
                          >
                            Large Individual Contributions
                          </Button>
                        )}
                      </Typography>

                      <Typography sx={{ fontWeight: 600, mb: 1 }}>
                        {isLoading ? (
                          <Skeleton variant="rounded" width={220} height={36} />
                        ) : (
                          <>
                            Please note that this data comes from the top{" "}
                            {candidate?.totalDonations} donations
                          </>
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
                              return b.localeCompare(a);
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
                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                      Top Donors
                    </Typography>

                    {!candidate?.topDonorsByYear ? (
                      <Stack spacing={1.5}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Stack
                            key={i}
                            direction="row"
                            spacing={1.5}
                            sx={{ alignItems: "center" }}
                          >
                            <Skeleton
                              variant="circular"
                              width={28}
                              height={28}
                            />
                            <Skeleton width="60%" />
                            <Skeleton width="20%" sx={{ ml: "auto" }} />
                          </Stack>
                        ))}
                      </Stack>
                    ) : (
                      // Top donors per year
                      <List disablePadding>
                        {(Array.isArray(
                          candidate?.topDonorsByYear?.[electionYear],
                        )
                          ? candidate.topDonorsByYear[electionYear]
                          : []
                        )
                          .sort((a, b) => b.value - a.value)
                          .slice(0, 10)
                          .map((donor, i) => (
                            <ListItem
                              key={donor.name}
                              disablePadding
                              sx={{
                                py: 1,
                                justifyContent: "space-between",
                                borderColor: "divider",
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={1.5}
                                sx={{ alignItems: "center", minWidth: 0 }}
                              >
                                <Box
                                  sx={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    flexShrink: 0,
                                    color: "text.secondary",
                                  }}
                                >
                                  {i + 1}
                                </Box>
                                <Typography
                                  variant="body2"
                                  noWrap
                                  sx={{ fontWeight: 500 }}
                                >
                                  {donor.name}
                                </Typography>
                              </Stack>

                              <Typography
                                variant="body2"
                                sx={{
                                  color: "text.secondary",
                                  flexShrink: 0,
                                  fontVariantNumeric: "tabular-nums",
                                }}
                              >
                                ${Number(donor.value).toLocaleString()}
                              </Typography>
                            </ListItem>
                          ))}
                      </List>
                    )}
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
