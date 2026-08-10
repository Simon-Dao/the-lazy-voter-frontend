"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Skeleton from "@mui/material/Skeleton";
import InputBase from "@mui/material/InputBase";
import Pagination from "@mui/material/Pagination";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { alpha } from "@mui/material/styles";
import { useAtom } from "jotai";
import { SelectedPoliticianDetailedAtom } from "#/util/State";

// ---------------------------------------------------------------------------
// A small fixed color palette, cycled through by index so each donation
// source gets a stable, distinct dot color regardless of its name.
// ---------------------------------------------------------------------------

const SOURCE_COLORS = [
  "info.main",
  "success.main",
  "error.main",
  "warning.main",
  "secondary.main",
  "primary.main",
];

function colorForIndex(i: number): string {
  return SOURCE_COLORS[i % SOURCE_COLORS.length];
}

function formatSourceName(name: string): string {
  return name
    .split("_")
    .map((word) => (word.length ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

type Donor = {
  contributor_name: string;
  total_amount: number;
  donation_count: number;
  last_contribution_date: string;
};

const DONORS_PER_PAGE = 8;

// ---------------------------------------------------------------------------

const customScrollbarSx = {
  scrollbarWidth: "thin",
  scrollbarColor: "hsl(220, 20%, 35%) transparent",
  "&::-webkit-scrollbar": { height: 8, width: 8 },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "hsl(220, 20%, 35%)",
    borderRadius: 8,
    border: "2px solid transparent",
    backgroundClip: "padding-box",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "hsl(220, 20%, 42%)",
  },
} as const;

export default function Finances() {
  const [candidate] = useAtom(SelectedPoliticianDetailedAtom);

  const [year, setYear] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const [donors, setDonors] = useState<Donor[]>([]);
  const [donorsLoading, setDonorsLoading] = useState(false);
  const [donorsPage, setDonorsPage] = useState(1);
  const [donorsTotal, setDonorsTotal] = useState(0);

  const isLoading = !candidate?.name;
  const hasDonationData = !!candidate?.donationsByYear;

  const years = useMemo(() => {
    if (!candidate?.donationsByYear) return [];
    return Object.keys(candidate.donationsByYear).filter((x) => x != 'all').sort((a, b) => {
      if (a === "all") return -1;
      if (b === "all") return 1;
      return b.localeCompare(a);
    });
  }, [candidate?.donationsByYear]);

  // Keep the year selection valid if the candidate (and their available
  // years) changes out from under us.
  useEffect(() => {
    if (years.length === 0) return;
    if (!years.includes(year)) {
      setYear(years[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [years]);

  const sourcesForYear = useMemo(() => {
    if (!candidate?.donationsByYear) return [];
    return candidate.donationsByYear[year] ?? [];
  }, [candidate?.donationsByYear, year]);

  const visibleSources = useMemo(() => {
    return [...sourcesForYear]
      .filter((s) =>
        query.trim().length === 0
          ? true
          : formatSourceName(s.name)
              .toLowerCase()
              .includes(query.trim().toLowerCase()),
      )
      .sort((a, b) => b.value - a.value);
  }, [sourcesForYear, query]);

  // Keep a sensible source selected as the year or search changes.
  useEffect(() => {
    if (visibleSources.length === 0) {
      setSelectedSource(null);
      return;
    }
    if (!visibleSources.some((s) => s.name === selectedSource)) {
      setSelectedSource(visibleSources[0].name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleSources]);

  const activeSource = sourcesForYear.find((s) => s.name === selectedSource);

  const yearTotal = useMemo(() => {
    if (year === "all" && typeof candidate?.totalDonations === "number") {
      return candidate.totalDonations;
    }
    return sourcesForYear.reduce((sum, s) => sum + s.value, 0);
  }, [candidate?.totalDonations, sourcesForYear, year]);

  const maxSourceValue = useMemo(
    () => visibleSources.reduce((max, s) => Math.max(max, s.value), 0),
    [visibleSources],
  );

  // Reset to page 1 whenever the source or year changes.
  useEffect(() => {
    setDonorsPage(1);
  }, [selectedSource, year]);

  useEffect(() => {
    if (!candidate?.u_id || !selectedSource) {
      setDonors([]);
      setDonorsTotal(0);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      setDonorsLoading(true);
      try {
        const params = new URLSearchParams({
          election_year: year,
          industry_category: selectedSource as string,
          page: String(donorsPage),
          per_page: String(DONORS_PER_PAGE),
        });

        const response = await fetch(
          `https://thelazyvoter.org/api/politicians/${candidate?.u_id}/finance/donors?${params.toString()}`,
        );
        const data: { rows: Donor[]; total: number } = await response.json();

        if (!cancelled) {
          setDonors(data.rows ?? []);
          setDonorsTotal(data.total ?? 0);
        }
      } catch (error) {
        console.error("Failed to fetch donors for", candidate?.u_id, error);
        if (!cancelled) {
          setDonors([]);
          setDonorsTotal(0);
        }
      } finally {
        if (!cancelled) setDonorsLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [candidate?.u_id, selectedSource, year, donorsPage]);

  const donorsPageCount = Math.max(1, Math.ceil(donorsTotal / DONORS_PER_PAGE));
  const donorsRangeStart = donorsTotal === 0 ? 0 : (donorsPage - 1) * DONORS_PER_PAGE + 1;
  const donorsRangeEnd = Math.min(donorsPage * DONORS_PER_PAGE, donorsTotal);

  const maxDonorValue = useMemo(
    () => donors.reduce((max, d) => Math.max(max, d.total_amount), 0),
    [donors],
  );

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: { sm: "100%", md: "1700px" },
        pt: { xs: "40px", md: "100px" },
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          mb: 2.5,
          gap: 1.5,
        }}
      >
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <AccountBalanceIcon sx={{ color: "text.secondary" }} />
            {isLoading ? (
              <Skeleton width={220}>
                <Typography variant="h5">.</Typography>
              </Skeleton>
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Finances
              </Typography>
            )}
          </Stack>
          {isLoading ? (
            <Skeleton width={280} />
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Campaign contributions to {candidate?.name}, by source.
            </Typography>
          )}
          {!isLoading && hasDonationData && (
            <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
              {currencyFormatter.format(yearTotal)}
              <Typography
                component="span"
                variant="body2"
                sx={{ color: "text.secondary", fontWeight: 400, ml: 1 }}
              >
                total raised {year === "all" ? "" : `in ${year}`}
              </Typography>
            </Typography>
          )}
        </Stack>

        {!isLoading && years.length > 0 && (
          <Tabs
            value={year}
            onChange={(_, value: string) => setYear(value)}
            variant="scrollable"
            scrollButtons={false}
            sx={{ minHeight: 32 }}
          >
            {years.map((y) => (
              <Tab
                key={y}
                label={y === "all" ? "All years" : y}
                value={y}
                sx={{ minHeight: 32 }}
              />
            ))}
          </Tabs>
        )}
      </Stack>

      {/* Master-detail layout: donation sources on the left, detail
          (selected source breakdown + top donors) on the right. */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ alignItems: "stretch" }}
      >
        {/* Source list */}
        <Box
          sx={{
            width: { xs: "100%", md: 320 },
            flexShrink: 0,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.25,
                py: 0.75,
                borderRadius: 2,
                bgcolor: (t) =>
                  t.palette.mode === "dark"
                    ? alpha(t.palette.common.white, 0.04)
                    : alpha(t.palette.common.black, 0.03),
              }}
            >
              <SearchRoundedIcon fontSize="small" sx={{ color: "text.disabled" }} />
              <InputBase
                placeholder="Filter sources..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ fontSize: 14, flexGrow: 1 }}
              />
            </Box>
          </Box>

          <List
            disablePadding
            sx={{
              overflowY: "auto",
              maxHeight: 560,
              ...customScrollbarSx,
            }}
          >
            {isLoading || !hasDonationData ? (
              Array.from({ length: 7 }).map((_, i) => (
                <Box key={i} sx={{ px: 2, py: 1.5 }}>
                  <Skeleton width="70%" />
                </Box>
              ))
            ) : visibleSources.length === 0 ? (
              <Box sx={{ py: 5, px: 2, textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "text.disabled" }}>
                  {query
                    ? `No sources match "${query}".`
                    : "No donation data for this year."}
                </Typography>
              </Box>
            ) : (
              visibleSources.map((source, i) => {
                const active = source.name === selectedSource;
                const pct =
                  maxSourceValue > 0 ? (source.value / maxSourceValue) * 100 : 0;
                return (
                  <ListItemButton
                    key={source.name}
                    selected={active}
                    onClick={() => setSelectedSource(source.name)}
                    sx={{
                      py: 1.1,
                      px: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      borderLeft: "3px solid",
                      borderColor: active ? "primary.main" : "transparent",
                      "&.Mui-selected": {
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                      },
                      "&.Mui-selected:hover": {
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      sx={{ alignItems: "center", width: "100%" }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: colorForIndex(i),
                          flexShrink: 0,
                          mr: 1.25,
                        }}
                      />
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          flexGrow: 1,
                          minWidth: 0,
                          fontWeight: active ? 600 : 500,
                        }}
                      >
                        {formatSourceName(source.name)}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.disabled",
                          flexShrink: 0,
                          fontVariantNumeric: "tabular-nums",
                          ml: 1,
                        }}
                      >
                        {compactCurrencyFormatter.format(source.value)}
                      </Typography>
                    </Stack>

                    <Box
                      sx={{
                        mt: 0.75,
                        ml: "17px",
                        height: 4,
                        borderRadius: 2,
                        bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${pct}%`,
                          height: "100%",
                          borderRadius: 2,
                          bgcolor: colorForIndex(i),
                        }}
                      />
                    </Box>
                  </ListItemButton>
                );
              })
            )}
          </List>
        </Box>

        {/* Detail: selected source breakdown + paginated top donors */}
        <Box
          sx={{
            flexGrow: 1,
            minWidth: 0,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            p: 2.5,
            display: "flex",
            flexDirection: "column",
            height: { xs: "auto", md: 624 },
          }}
        >
          {isLoading || !hasDonationData ? (
            <Stack spacing={1.5}>
              <Skeleton width="40%" height={32} />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={56} />
              ))}
            </Stack>
          ) : !activeSource ? (
            <Box sx={{ py: 10, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "text.disabled" }}>
                Select a source to see details.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
                minHeight: 0,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", mb: 0.5, flexShrink: 0 }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: colorForIndex(
                      visibleSources.findIndex((s) => s.name === activeSource.name),
                    ),
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {formatSourceName(activeSource.name)}
                </Typography>
              </Stack>

              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mb: 2.5, flexShrink: 0 }}
              >
                {currencyFormatter.format(activeSource.value)}
                {yearTotal > 0 &&
                  ` · ${((activeSource.value / yearTotal) * 100).toFixed(1)}% of total`}
              </Typography>

              {/* Top donors */}
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", mb: 1, flexShrink: 0 }}
              >
                <PaidRoundedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Top Donors {year === "all" ? "" : `(${year})`}
                </Typography>
              </Stack>

              <List
                disablePadding
                sx={{
                  overflowY: "auto",
                  flexGrow: 1,
                  minHeight: 0,
                  ...customScrollbarSx,
                }}
              >
                {donorsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Box key={i} sx={{ py: 1.1 }}>
                      <Skeleton variant="rounded" height={40} />
                    </Box>
                  ))
                ) : donors.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: "center" }}>
                    <PersonRoundedIcon
                      sx={{ color: "text.disabled", fontSize: 28, mb: 0.5 }}
                    />
                    <Typography variant="body2" sx={{ color: "text.disabled" }}>
                      No donor data available for this year.
                    </Typography>
                  </Box>
                ) : (
                  donors.map((donor, index) => {
                    const pct =
                      maxDonorValue > 0
                        ? (donor.total_amount / maxDonorValue) * 100
                        : 0;
                    const rank = donorsRangeStart + index;
                    return (
                      <Box
                        key={donor.contributor_name}
                        sx={{
                          py: 1.1,
                          borderTop: index === 0 ? "none" : "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Stack
                          direction="row"
                          sx={{ justifyContent: "space-between", alignItems: "center" }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: "center", minWidth: 0 }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.disabled",
                                width: 24,
                                flexShrink: 0,
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              {rank}
                            </Typography>
                            <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                              {donor.contributor_name}
                            </Typography>
                          </Stack>
                          <Stack
                            direction="row"
                            spacing={0.75}
                            sx={{ alignItems: "baseline", flexShrink: 0, ml: 1 }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: "text.disabled" }}
                            >
                              {donor.donation_count}{" "}
                              {donor.donation_count === 1 ? "donation" : "donations"}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              {currencyFormatter.format(donor.total_amount)}
                            </Typography>
                          </Stack>
                        </Stack>
                        <Box
                          sx={{
                            mt: 0.5,
                            ml: "32px",
                            height: 3,
                            borderRadius: 2,
                            bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              width: `${pct}%`,
                              height: "100%",
                              borderRadius: 2,
                              bgcolor: "text.secondary",
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })
                )}
              </List>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 1.5,
                  pt: 1.5,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  flexShrink: 0,
                }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {donorsTotal === 0
                    ? "0 results"
                    : `Showing ${donorsRangeStart}–${donorsRangeEnd} of ${donorsTotal} · ${DONORS_PER_PAGE} per page`}
                </Typography>

                <Pagination
                  count={donorsPageCount}
                  page={donorsPage}
                  onChange={(_, value) => setDonorsPage(value)}
                  disabled={donorsLoading}
                  size="small"
                  shape="rounded"
                />
              </Stack>
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
}