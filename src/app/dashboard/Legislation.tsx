"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Pagination from "@mui/material/Pagination";
import Skeleton from "@mui/material/Skeleton";
import InputBase from "@mui/material/InputBase";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { alpha } from "@mui/material/styles";
import { useAtom } from "jotai";
import { SelectedPoliticianDetailedAtom } from "#/util/State";

// ---------------------------------------------------------------------------
// Categories are grouped into four policy domains, each with its own color,
// carried through as a small dot next to each topic.
// ---------------------------------------------------------------------------

type PolicyDomain = "Economy" | "Society" | "Security" | "Governance";

type Bill = {
  title: string;
  description: string;
  state_link: string;
  status_desc: string;
  bill_number: string;
  status_date: string;
};

const DOMAIN_BY_CATEGORY: Record<string, PolicyDomain> = {
  agriculture: "Economy",
  commerce: "Economy",
  financial: "Economy",
  labor: "Economy",
  tax: "Economy",
  technology: "Economy",
  transportation: "Economy",
  housing: "Economy",

  abortion: "Society",
  civil_rights: "Society",
  education: "Society",
  healthcare: "Society",
  social_security: "Society",
  native: "Society",

  criminal_justice: "Security",
  defense: "Security",
  drug: "Security",
  firearms: "Security",
  judiciary: "Security",
  weapons: "Security",
  foreign: "Security",

  election: "Governance",
  energy: "Governance",
  environment: "Governance",
  postal: "Governance",
  veterans: "Governance",
  immigration: "Governance",
  miscellaneous: "Governance",
};

const DOMAIN_COLOR: Record<PolicyDomain, string> = {
  Economy: "info.main",
  Society: "success.main",
  Security: "error.main",
  Governance: "warning.main",
};

function getDomain(categoryName: string): PolicyDomain {
  return DOMAIN_BY_CATEGORY[categoryName] ?? "Governance";
}

function formatCategoryName(name: string): string {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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

const BILLS_PER_PAGE = 8;

export default function Legislation() {
  const [candidate] = useAtom(SelectedPoliticianDetailedAtom);

  const [termStart, setTermStart] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [visibleBills, setVisibleBills] = useState<Bill[]>([]);
  const [billsLoading, setBillsLoading] = useState(false);
  const [billsPage, setBillsPage] = useState(1);

  const isLoading = !candidate?.name;
  const hasCategoryData = !!candidate?.billCategoriesByYear;

  const years = useMemo(() => {
    if (!candidate?.billCategoriesByYear) return [];
    setTermStart(Object.keys(candidate?.billCategoriesByYear)[0]);

    return Object.keys(candidate.billCategoriesByYear).sort((a, b) => {
      if (a === "all") return -1;
      if (b === "all") return 1;
      return b.localeCompare(a);
    });
  }, [candidate?.billCategoriesByYear]);

  const categoriesForYear = useMemo(() => {
    if (!candidate?.billCategoriesByYear) return [];
    return candidate.billCategoriesByYear[termStart] ?? [];
  }, [candidate?.billCategoriesByYear, termStart]);

  // Reset to page 1 whenever the topic or term changes.
  useEffect(() => {
    setBillsPage(1);
  }, [selectedTopic, termStart]);

  useEffect(() => {
    if (!candidate?.u_id || !selectedTopic) {
      setVisibleBills([]);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      setBillsLoading(true);
      try {
        const params = new URLSearchParams({
          term_start_date: termStart,
          category_name: selectedTopic as string,
          page: String(billsPage),
          per_page: String(BILLS_PER_PAGE),
        });

        const response = await fetch(
          `https://thelazyvoter.org/api/politicians/${candidate?.u_id}/legislation?${params.toString()}`,
        );
        const bills: Bill[] = await response.json();

        if (!cancelled) setVisibleBills(bills);
      } catch (error) {
        console.error("Failed to fetch Bills for", candidate?.u_id, error);
        if (!cancelled) setVisibleBills([]);
      } finally {
        if (!cancelled) setBillsLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [candidate?.u_id, selectedTopic, termStart, billsPage]);

  const visibleTopics = useMemo(() => {
    return [...categoriesForYear]
      .filter((c) =>
        query.trim().length === 0
          ? true
          : formatCategoryName(c.name)
              .toLowerCase()
              .includes(query.trim().toLowerCase()),
      )
      .sort((a, b) => b.value - a.value);
  }, [categoriesForYear, query]);

  // Keep a sensible topic selected as the year or search changes.
  useEffect(() => {
    if (visibleTopics.length === 0) {
      setSelectedTopic(null);
      return;
    }
    if (!visibleTopics.some((c) => c.name === selectedTopic)) {
      setSelectedTopic(visibleTopics[0].name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleTopics]);

  const activeCategory = visibleTopics.find((c) => c.name === selectedTopic);

  // The topic's total bill count is already known from the category data,
  // so pagination math doesn't need a round trip through the API.
  const billsTotal = activeCategory?.value ?? 0;
  const billsPageCount = Math.max(1, Math.ceil(billsTotal / BILLS_PER_PAGE));
  const billsRangeStart = billsTotal === 0 ? 0 : (billsPage - 1) * BILLS_PER_PAGE + 1;
  const billsRangeEnd = Math.min(billsPage * BILLS_PER_PAGE, billsTotal);

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
            <GavelRoundedIcon sx={{ color: "text.secondary" }} />
            {isLoading ? (
              <Skeleton width={220}>
                <Typography variant="h5">.</Typography>
              </Skeleton>
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Legislation
              </Typography>
            )}
          </Stack>
          {isLoading ? (
            <Skeleton width={280} />
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Bills {candidate?.name} has sponsored or co-sponsored, by topic.
            </Typography>
          )}
        </Stack>

        {!isLoading && years.length > 0 && (
          <Tabs
            value={termStart}
            onChange={(_, value: string) => setTermStart(value)}
            variant="scrollable"
            scrollButtons={false}
            sx={{ minHeight: 32 }}
          >
            {years
              .filter((x) => x != "all")
              .map((y) => (
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

      {/* Master-detail layout: topic list on the left, detail for the
          selected topic on the right. Only one topic's detail is visible
          at a time, so nothing reflows or stacks as you browse. */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ alignItems: "stretch" }}
      >
        {/* Topic list */}
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
          <Box
            sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}
          >
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
              <SearchRoundedIcon
                fontSize="small"
                sx={{ color: "text.disabled" }}
              />
              <InputBase
                placeholder="Filter topics..."
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
            {isLoading || !hasCategoryData ? (
              Array.from({ length: 7 }).map((_, i) => (
                <Box key={i} sx={{ px: 2, py: 1.5 }}>
                  <Skeleton width="70%" />
                </Box>
              ))
            ) : visibleTopics.length === 0 ? (
              <Box sx={{ py: 5, px: 2, textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "text.disabled" }}>
                  No topics match "{query}".
                </Typography>
              </Box>
            ) : (
              visibleTopics.map((cat) => {
                const domain = getDomain(cat.name);
                const active = cat.name === selectedTopic;
                return (
                  <ListItemButton
                    key={cat.name}
                    selected={active}
                    onClick={() => setSelectedTopic(cat.name)}
                    sx={{
                      py: 1.1,
                      px: 2,
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
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: DOMAIN_COLOR[domain],
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
                      {formatCategoryName(cat.name)}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.disabled",
                        flexShrink: 0,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {cat.value}
                    </Typography>
                  </ListItemButton>
                );
              })
            )}
          </List>
        </Box>

        {/* Detail: bills for the selected topic, fetched from the API. */}
        <Box
          sx={{
            flexGrow: 1,
            minWidth: 0,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            p: 2.5,
          }}
        >
          {isLoading || !hasCategoryData ? (
            <Stack spacing={1.5}>
              <Skeleton width="40%" height={32} />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={56} />
              ))}
            </Stack>
          ) : !activeCategory ? (
            <Box sx={{ py: 10, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "text.disabled" }}>
                Select a topic to see its bills.
              </Typography>
            </Box>
          ) : (
            <>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", mb: 0.5 }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: DOMAIN_COLOR[getDomain(activeCategory.name)],
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {formatCategoryName(activeCategory.name)}
                </Typography>
              </Stack>

              <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                {activeCategory.value}{" "}
                {activeCategory.value === 1 ? "bill" : "bills"} sponsored or
                co-sponsored
              </Typography>

              <List
                disablePadding
                sx={{
                  overflowY: "auto",
                  maxHeight: 480,
                  ...customScrollbarSx,
                }}
              >
                {billsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Box key={i} sx={{ py: 1.25 }}>
                      <Skeleton variant="rounded" height={56} />
                    </Box>
                  ))
                ) : visibleBills.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: "center" }}>
                    <DescriptionRoundedIcon
                      sx={{ color: "text.disabled", fontSize: 28, mb: 0.5 }}
                    />
                    <Typography variant="body2" sx={{ color: "text.disabled" }}>
                      No bills to show for this topic.
                    </Typography>
                  </Box>
                ) : (
                  visibleBills.map((bill, index) => (
                    <Box
                      key={`${bill.bill_number}-${index}`}
                      sx={{
                        py: 1.25,
                        borderTop: index === 0 ? "none" : "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        sx={{
                          justifyContent: "space-between",
                          alignItems: { sm: "flex-start" },
                          gap: 0.5,
                        }}
                      >
                        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                          <Typography
                            component={bill.state_link ? "a" : "span"}
                            href={bill.state_link || undefined}
                            target={bill.state_link ? "_blank" : undefined}
                            rel={bill.state_link ? "noopener noreferrer" : undefined}
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color: "text.primary",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.5,
                              "&:hover": bill.state_link
                                ? { textDecoration: "underline" }
                                : undefined,
                            }}
                          >
                            {bill.title}
                            {bill.state_link && (
                              <OpenInNewRoundedIcon
                                sx={{ fontSize: 14, color: "text.disabled" }}
                              />
                            )}
                          </Typography>

                          {bill.description && (
                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary" }}
                            >
                              {bill.description}
                            </Typography>
                          )}

                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                          >
                            {bill.bill_number}
                            {bill.status_date ? ` · ${bill.status_date}` : ""}
                          </Typography>
                        </Stack>

                        {bill.status_desc && (
                          <Chip
                            label={bill.status_desc}
                            size="small"
                            sx={{
                              alignSelf: { xs: "flex-start", sm: "center" },
                              flexShrink: 0,
                              fontWeight: 600,
                              bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
                            }}
                          />
                        )}
                      </Stack>
                    </Box>
                  ))
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
                }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {billsTotal === 0
                    ? "0 results"
                    : `Showing ${billsRangeStart}–${billsRangeEnd} of ${billsTotal} · ${BILLS_PER_PAGE} per page`}
                </Typography>

                <Pagination
                  count={billsPageCount}
                  page={billsPage}
                  onChange={(_, value) => setBillsPage(value)}
                  disabled={billsLoading}
                  size="small"
                  shape="rounded"
                />
              </Stack>
            </>
          )}
        </Box>
      </Stack>

    </Box>
  );
}