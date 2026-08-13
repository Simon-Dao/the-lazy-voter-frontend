"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Skeleton from "@mui/material/Skeleton";
import InputBase from "@mui/material/InputBase";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import { alpha } from "@mui/material/styles";
import { PoliticianBasicInfo, STATE_MAP } from "#/util/State";

// ---------------------------------------------------------------------------

const PARTY_COLOR: Record<string, string> = {
  Democrat: "info.main",
  Republican: "error.main",
  Independent: "success.main",
};

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

type CandidatesProps = {
  addPolitician: (politician: PoliticianBasicInfo) => void;
};

export default function Candidates({ addPolitician }: CandidatesProps) {
  const [selectedState, setSelectedState] = useState<string>("WA");
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<PoliticianBasicInfo[]>([]);
  const [loading, setLoading] = useState(false);

  // NOTE: assumes an endpoint that returns all politicians for a given state.
  // Adjust the URL/param name to match your actual backend route.
  useEffect(() => {
    let cancelled = false;

    async function fetchByState() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://thelazyvoter.org/api/politicians/search/by-state?state=${selectedState}`,
        );
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setCandidates(data.content ?? data ?? []);
      } catch (error) {
        console.error("Failed to fetch candidates for", selectedState, error);
        if (!cancelled) setCandidates([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchByState();
    return () => {
      cancelled = true;
    };
  }, [selectedState]);

  const visibleCandidates = useMemo(() => {
    return candidates.filter((c) =>
      query.trim().length === 0
        ? true
        : c.name.toLowerCase().includes(query.trim().toLowerCase()),
    );
  }, [candidates, query]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: { sm: "100%", md: "1700px" },
        pt: { xs: "40px", md: "100px" },
      }}
    >
      {/* Header */}
      <Stack spacing={0.5} sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <PersonSearchRoundedIcon sx={{ color: "text.secondary" }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Candidates
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Browse politicians by state to find who represents you, or who's
          running.
        </Typography>
      </Stack>

      {/* Master-detail layout: state list on the left, candidates on the right */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ alignItems: "stretch" }}
      >
        {/* State list */}
        <Box
          sx={{
            width: { xs: "100%", md: 280 },
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
            sx={{
              p: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <PublicRoundedIcon
              fontSize="small"
              sx={{ color: "text.secondary" }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Select a state
            </Typography>
          </Box>

          <List
            disablePadding
            sx={{
              overflowY: "auto",
              maxHeight: 560,
              ...customScrollbarSx,
            }}
          >
            {[...STATE_MAP.keys()].map((state) => {
              const active = state === selectedState;
              return (
                <ListItemButton
                  key={state}
                  selected={active}
                  onClick={() => setSelectedState(state)}
                  sx={{
                    py: 1,
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
                  <Typography
                    variant="body2"
                    sx={{ flexGrow: 1, fontWeight: active ? 600 : 500 }}
                  >
                    {STATE_MAP.get(state)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.disabled",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {state}
                  </Typography>
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        {/* Candidates for selected state */}
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
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{
              justifyContent: "space-between",
              alignItems: { sm: "center" },
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {STATE_MAP.get(selectedState)}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.25,
                py: 0.75,
                borderRadius: 2,
                width: { xs: "100%", sm: 240 },
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
                placeholder="Filter by name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ fontSize: 14, flexGrow: 1 }}
              />
            </Box>
          </Stack>

          {loading ? (
            <Stack spacing={1.5}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={64} />
              ))}
            </Stack>
          ) : visibleCandidates.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "text.disabled" }}>
                No candidates found for this state.
              </Typography>
            </Box>
          ) : (
            <List
              disablePadding
              sx={{
                overflowY: "auto",
                maxHeight: 560,
                ...customScrollbarSx,
              }}
            >
              {visibleCandidates.map((candidate, index) => (
                <ListItemButton
                  key={candidate.u_id}
                  onClick={() => addPolitician(candidate)}
                  sx={{
                    py: 1.5,
                    px: 1,
                    borderTop: index === 0 ? "none" : "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    gap: 1.5,
                  }}
                >
                  <Stack spacing={0.25} sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                      {candidate.name}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{ alignItems: "center" }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{ fontWeight: 500 }}
                      >
                        {[candidate.incumbent_challenge == 'C' ? 'Challenger' : "Incumbent", candidate.role, candidate.party, candidate.state, candidate.district]
                          .filter(Boolean)
                          .join(" · ")}
                      </Typography>
                    </Stack>
                  </Stack>

                  {candidate.status && (
                    <Chip
                      label={candidate.status}
                      size="small"
                      sx={{
                        flexShrink: 0,
                        fontWeight: 600,
                        bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
                      }}
                    />
                  )}

                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    
                  </Typography>
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
