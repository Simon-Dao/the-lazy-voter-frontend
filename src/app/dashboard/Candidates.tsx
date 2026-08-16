"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Skeleton from "@mui/material/Skeleton";
import InputBase from "@mui/material/InputBase";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { alpha } from "@mui/material/styles";
import { PoliticianBasicInfo, STATE_MAP } from "#/util/State";

// ---------------------------------------------------------------------------

const PARTY_COLOR: Record<string, string> = {
  democrat: "info.main",
  democratic: "info.main",
  dem: "info.main",
  republican: "error.main",
  rep: "error.main",
  gop: "error.main",
  independent: "success.main",
  ind: "success.main",
  libertarian: "warning.main",
  green: "success.dark",
};

function getPartyColor(party: string | undefined | null): string {
  if (!party) return "text.disabled";
  const normalized = party.trim().toLowerCase();
  const match = Object.keys(PARTY_COLOR).find((key) =>
    normalized.includes(key),
  );
  return match ? PARTY_COLOR[match] : "text.disabled";
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

type CandidatesProps = {
  addPolitician: (politician: PoliticianBasicInfo) => void;
  selectedPoliticianIds?: string[]; // optional: highlight already-picked candidates
};

export default function Candidates({
  addPolitician,
  selectedPoliticianIds = [],
}: CandidatesProps) {
  const [selectedState, setSelectedState] = useState<string>("WA");
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<PoliticianBasicInfo[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [partyFilter, setPartyFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [incumbencyFilter, setIncumbencyFilter] = useState<
    "all" | "incumbent" | "challenger"
  >("all");

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
        if (!cancelled) setCandidates(data ?? []);
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

  // Reset filters whenever the state changes so stale filters don't hide
  // everything in the new state.
  useEffect(() => {
    setPartyFilter("all");
    setRoleFilter("all");
    setIncumbencyFilter("all");
    setDistrictFilter("");
    setQuery("");
  }, [selectedState]);

  const partyOptions = useMemo(() => {
    return Array.from(new Set(candidates.map((c) => c.party).filter(Boolean)));
  }, [candidates]);

  const roleOptions = useMemo(() => {
    return ['House', 'Senate']
  }, [candidates]);

  const districtOptions = useMemo(() => {
    return Array.from(
      new Set(
        candidates
          .map((c) => (c as any).district)
          .filter((d) => d !== undefined && d !== null && d !== ""),
      ),
    ).sort((a, b) => Number(a) - Number(b));
  }, [candidates]);

  const visibleCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesQuery =
        query.trim().length === 0 ||
        c.name.toLowerCase().includes(query.trim().toLowerCase());

      const matchesParty = partyFilter === "all" || c.party === partyFilter;
      const matchesRole = roleFilter === "all" || c.role === roleFilter;


      const matchesIncumbency =
        incumbencyFilter === "all" ||
        ((c as any).incumbent_challenge === "C" &&
          incumbencyFilter === "challenger") ||
        ((c as any).incumbent_challenge !== "C" &&
          incumbencyFilter === "incumbent");

      const matchesDistrict =
        districtFilter === "" ||
        String((c as any).district ?? "") === districtFilter;

      return (
        matchesQuery &&
        matchesParty &&
        matchesRole &&
        matchesIncumbency &&
        matchesDistrict
      );
    });
  }, [
    candidates,
    query,
    partyFilter,
    roleFilter,
    incumbencyFilter,
    districtFilter,
  ]);

  const activeFilterCount = [
    partyFilter !== "all",
    roleFilter !== "all",
    incumbencyFilter !== "all",
    districtFilter !== "",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setPartyFilter("all");
    setRoleFilter("all");
    setIncumbencyFilter("all");
    setDistrictFilter("");
  };

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

          {/* Filter bar */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1,
              mb: 2,
              pb: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ alignItems: "center", mr: 0.5 }}
            >
              <FilterListRoundedIcon
                fontSize="small"
                sx={{ color: "text.disabled" }}
              />
              <Typography
                variant="caption"
                sx={{ color: "text.disabled", fontWeight: 600 }}
              >
                Filters
              </Typography>
            </Stack>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="party-filter-label">Party</InputLabel>
              <Select
                labelId="party-filter-label"
                label="Party"
                value={partyFilter}
                onChange={(e) => setPartyFilter(e.target.value)}
              >
                <MenuItem value="all">All parties</MenuItem>
                {partyOptions.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="role-filter-label">Office</InputLabel>
              <Select
                labelId="role-filter-label"
                label="Office"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="all">All offices</MenuItem>
                {roleOptions.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {JSON.stringify(candidates)}
            {districtOptions.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel id="district-filter-label">District</InputLabel>
                <Select
                  labelId="district-filter-label"
                  label="District"
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                >
                  <MenuItem value="">All districts</MenuItem>
                  {districtOptions.map((d) => (
                    <MenuItem key={String(d)} value={String(d)}>
                      District {String(d)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <ToggleButtonGroup
              size="small"
              value={incumbencyFilter}
              exclusive
              onChange={(_, value) => {
                if (value !== null) setIncumbencyFilter(value);
              }}
            >
              <ToggleButton value="all" sx={{ px: 1.5, textTransform: "none" }}>
                All
              </ToggleButton>
              <ToggleButton
                value="incumbent"
                sx={{ px: 1.5, textTransform: "none" }}
              >
                Incumbent
              </ToggleButton>
              <ToggleButton
                value="challenger"
                sx={{ px: 1.5, textTransform: "none" }}
              >
                Challenger
              </ToggleButton>
            </ToggleButtonGroup>

            {activeFilterCount > 0 && (
              <Button
                size="small"
                onClick={clearFilters}
                startIcon={<CloseRoundedIcon fontSize="small" />}
                sx={{ textTransform: "none" }}
              >
                Clear filters ({activeFilterCount})
              </Button>
            )}
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
                No candidates match your filters.
              </Typography>
              {activeFilterCount > 0 && (
                <Button
                  size="small"
                  onClick={clearFilters}
                  sx={{ mt: 1, textTransform: "none" }}
                >
                  Clear filters
                </Button>
              )}
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
              {visibleCandidates.map((candidate, index) => {
                const isSelected = selectedPoliticianIds.includes(
                  candidate.u_id,
                );
                return (
                  <Box
                    key={candidate.u_id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      py: 1.5,
                      px: 1,
                      borderTop: index === 0 ? "none" : "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: (t) =>
                          t.palette.mode === "dark"
                            ? alpha(t.palette.common.white, 0.03)
                            : alpha(t.palette.common.black, 0.02),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: getPartyColor(candidate.party),
                        flexShrink: 0,
                      }}
                    />

                    <Stack spacing={0.25} sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{ fontWeight: 600 }}
                      >
                        {candidate.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{ fontWeight: 500 }}
                      >
                        {[
                          candidate.incumbent_challenge,
                          candidate.role,
                          candidate.party,
                          candidate.state,
                          (candidate as any).district
                            ? `District ${(candidate as any).district}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </Typography>
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

                    <Tooltip
                      title={isSelected ? "Already added" : "Add to dashboard"}
                    >
                      <span>
                        <IconButton
                          size="small"
                          disabled={isSelected}
                          onClick={() => addPolitician(candidate)}
                          sx={{
                            flexShrink: 0,
                            color: isSelected ? "success.main" : "primary.main",
                          }}
                        >
                          {isSelected ? (
                            <CheckCircleRoundedIcon fontSize="small" />
                          ) : (
                            <AddCircleRoundedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                );
              })}
            </List>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
