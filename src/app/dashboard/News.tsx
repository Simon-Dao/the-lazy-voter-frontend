"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import List from "@mui/material/List";
import Skeleton from "@mui/material/Skeleton";
import InputBase from "@mui/material/InputBase";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import { alpha } from "@mui/material/styles";
import { useAtom } from "jotai";
import { SelectedPoliticianDetailedAtom } from "#/util/State";

// ---------------------------------------------------------------------------

type NewsArticle = {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  category?: string;
};

const BUCKET_LABELS: Record<string, string> = {
  bio: "About the Candidate",
  standing: "Campaign Standing",
  policy: "Policy & Voting",
  scrutiny: "Scrutiny & Controversy",
};

const BUCKET_COLOR: Record<string, string> = {
  bio: "info.main",
  standing: "success.main",
  policy: "warning.main",
  scrutiny: "error.main",
};

function formatBucketLabel(bucket: string): string {
  return BUCKET_LABELS[bucket] ?? bucket;
}

function formatDate(pubDate: string): string {
  if (!pubDate) return "";
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return pubDate;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

export default function News() {
  const [candidate] = useAtom(SelectedPoliticianDetailedAtom);

  const [selectedBucket, setSelectedBucket] = useState<string>("all");
  const [query, setQuery] = useState("");

  const isLoading = !candidate?.name;
  const hasNewsData = !!candidate?.newsArticles;

  const buckets = useMemo(() => {
    if (!candidate?.newsArticles) return [];
    return Object.keys(candidate.newsArticles);
  }, [candidate?.newsArticles]);

  const bucketCounts = useMemo(() => {
    if (!candidate?.newsArticles) return {} as Record<string, number>;
    return Object.fromEntries(
      Object.entries(candidate.newsArticles).map(([bucket, articles]) => [
        bucket,
        Array.isArray(articles) ? articles.length : 0,
      ]),
    );
  }, [candidate?.newsArticles]);

  const allArticles: (NewsArticle & { bucket: string })[] = useMemo(() => {
    if (!candidate?.newsArticles) return [];
    return Object.entries(candidate.newsArticles).flatMap(
      ([bucket, articles]) =>
        (Array.isArray(articles) ? articles : []).map((article: NewsArticle) => ({
          ...article,
          bucket,
        })),
    );
  }, [candidate?.newsArticles]);

  const visibleArticles = useMemo(() => {
    const base =
      selectedBucket === "all"
        ? allArticles
        : allArticles.filter((a) => a.bucket === selectedBucket);

    return base
      .filter((a) =>
        query.trim().length === 0
          ? true
          : a.title.toLowerCase().includes(query.trim().toLowerCase()) ||
            a.source.toLowerCase().includes(query.trim().toLowerCase()),
      )
      .sort((a, b) => {
        const da = new Date(a.pubDate).getTime();
        const db = new Date(b.pubDate).getTime();
        if (Number.isNaN(da) || Number.isNaN(db)) return 0;
        return db - da;
      });
  }, [allArticles, selectedBucket, query]);

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
            <NewspaperRoundedIcon sx={{ color: "text.secondary" }} />
            {isLoading ? (
              <Skeleton width={160}>
                <Typography variant="h5">.</Typography>
              </Skeleton>
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                News
              </Typography>
            )}
          </Stack>
          {isLoading ? (
            <Skeleton width={280} />
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Recent coverage of {candidate?.name}, grouped by category.
            </Typography>
          )}
        </Stack>

        {!isLoading && buckets.length > 0 && (
          <Tabs
            value={selectedBucket}
            onChange={(_, value: string) => setSelectedBucket(value)}
            variant="scrollable"
            scrollButtons={false}
            sx={{ minHeight: 32 }}
          >
            <Tab label="All" value="all" sx={{ minHeight: 32 }} />
            {buckets.map((bucket) => (
              <Tab
                key={bucket}
                label={formatBucketLabel(bucket)}
                value={bucket}
                sx={{ minHeight: 32 }}
              />
            ))}
          </Tabs>
        )}
      </Stack>

      {/* Master-detail layout: category list on the left, articles for the
          selected category (or all) on the right. */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ alignItems: "stretch" }}
      >
        {/* Category list */}
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
                placeholder="Filter articles..."
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
            {isLoading || !hasNewsData ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Box key={i} sx={{ px: 2, py: 1.5 }}>
                  <Skeleton width="70%" />
                </Box>
              ))
            ) : buckets.length === 0 ? (
              <Box sx={{ py: 5, px: 2, textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "text.disabled" }}>
                  No news categories available.
                </Typography>
              </Box>
            ) : (
              <>
                <CategoryRow
                  label="All"
                  count={allArticles.length}
                  color="text.disabled"
                  active={selectedBucket === "all"}
                  onClick={() => setSelectedBucket("all")}
                />
                {buckets.map((bucket) => (
                  <CategoryRow
                    key={bucket}
                    label={formatBucketLabel(bucket)}
                    count={bucketCounts[bucket] ?? 0}
                    color={BUCKET_COLOR[bucket] ?? "text.disabled"}
                    active={selectedBucket === bucket}
                    onClick={() => setSelectedBucket(bucket)}
                  />
                ))}
              </>
            )}
          </List>
        </Box>

        {/* Detail: articles for the selected category (or all) */}
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
          {isLoading || !hasNewsData ? (
            <Stack spacing={1.5}>
              <Skeleton width="40%" height={32} />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={64} />
              ))}
            </Stack>
          ) : (
            <>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", mb: 0.5 }}
              >
                {selectedBucket !== "all" && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: BUCKET_COLOR[selectedBucket] ?? "text.disabled",
                    }}
                  />
                )}
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedBucket === "all"
                    ? "All Articles"
                    : formatBucketLabel(selectedBucket)}
                </Typography>
              </Stack>

              <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                {visibleArticles.length}{" "}
                {visibleArticles.length === 1 ? "article" : "articles"} found
              </Typography>

              <List
                disablePadding
                sx={{
                  overflowY: "auto",
                  maxHeight: 560,
                  ...customScrollbarSx,
                }}
              >
                {visibleArticles.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: "center" }}>
                    <ArticleRoundedIcon
                      sx={{ color: "text.disabled", fontSize: 28, mb: 0.5 }}
                    />
                    <Typography variant="body2" sx={{ color: "text.disabled" }}>
                      No articles to show for this category.
                    </Typography>
                  </Box>
                ) : (
                  visibleArticles.map((article, index) => (
                    <Box
                      key={`${article.link}-${index}`}
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
                            component={article.link ? "a" : "span"}
                            href={article.link || undefined}
                            target={article.link ? "_blank" : undefined}
                            rel={article.link ? "noopener noreferrer" : undefined}
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color: "text.primary",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.5,
                              "&:hover": article.link
                                ? { textDecoration: "underline" }
                                : undefined,
                            }}
                          >
                            {article.title}
                            {article.link && (
                              <OpenInNewRoundedIcon
                                sx={{ fontSize: 14, color: "text.disabled" }}
                              />
                            )}
                          </Typography>

                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                          >
                            {article.source}
                            {article.pubDate
                              ? ` · ${formatDate(article.pubDate)}`
                              : ""}
                          </Typography>
                        </Stack>

                        {selectedBucket === "all" && (
                          <Chip
                            label={formatBucketLabel(article.bucket)}
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
            </>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

// ---------------------------------------------------------------------------

function CategoryRow({
  label,
  count,
  color,
  active,
  onClick,
}: {
  label: string;
  count: number;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        py: 1.1,
        px: 2,
        cursor: "pointer",
        borderLeft: "3px solid",
        borderColor: active ? "primary.main" : "transparent",
        bgcolor: active ? (t) => alpha(t.palette.primary.main, 0.08) : "transparent",
        "&:hover": {
          bgcolor: (t) =>
            active
              ? alpha(t.palette.primary.main, 0.12)
              : t.palette.mode === "dark"
                ? alpha(t.palette.common.white, 0.04)
                : alpha(t.palette.common.black, 0.03),
        },
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          bgcolor: color,
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
        {label}
      </Typography>

      <Typography
        variant="caption"
        sx={{
          color: "text.disabled",
          flexShrink: 0,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {count}
      </Typography>
    </Box>
  );
}