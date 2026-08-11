"use client";

import React, { useState, useRef, useCallback } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import {
  TextField,
  ClickAwayListener,
  Box,
  Stack,
  Typography,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useTheme, alpha } from "@mui/material/styles";
import { POLITICIANS_SEARCH_API_URL } from "#/util/Constants";
import { PoliticianBasicInfo } from "#/util/State";
import { useAtom } from "jotai";
import { IsPoliticianSelectedAtom } from "#/util/State";

type SearchBarProps = {
  onSelectPolitician: (politician: PoliticianBasicInfo) => void;
};

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 250;

const PARTY_COLOR: Record<string, string> = {
  Democrat: "info.main",
  Republican: "error.main",
  Independent: "success.main",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function SearchBar({ onSelectPolitician }: SearchBarProps) {
  const theme = useTheme();

  const [isPoliticianSelected, setIsPoliticianSelected] = useAtom(
    IsPoliticianSelectedAtom,
  );
  const [inputValue, setInputValue] = useState<string>("");
  const [options, setOptions] = useState<PoliticianBasicInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const fetchSearchResults = useCallback(async (prefix: string) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const url = `${POLITICIANS_SEARCH_API_URL}?q=${encodeURIComponent(prefix)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data: any = await response.json();
      const content: PoliticianBasicInfo[] = data.content;

      // Ignore stale responses from out-of-order requests.
      if (requestId === requestIdRef.current) {
        setOptions(content);
        setOpen(content.length > 0);
      }
    } catch (error) {
      console.error("Fetch failed:", error);
      if (requestId === requestIdRef.current) {
        setOptions([]);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const handleInputChange = (event: React.SyntheticEvent, newValue: string) => {
    setInputValue(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const cleaned = newValue.trim();

    if (cleaned.length < MIN_QUERY_LENGTH) {
      setOptions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSearchResults(cleaned);
    }, DEBOUNCE_MS);
  };

  const handleSelect = (
    event: React.SyntheticEvent,
    selected: PoliticianBasicInfo | null,
  ) => {
    if (!selected) return;

    onSelectPolitician({
      u_id: selected.u_id,
      name: selected.name,
      latestYear: selected.latestYear,
      role: selected.role,
      party: selected.party,
      state: selected.state,
      status: selected.status,
    });

    // Reset after adding so the field is ready for the next search.
    setInputValue("");
    setOptions([]);
    setOpen(false);
    setIsPoliticianSelected(true);
  };

  return (
    <>
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            padding: 0,
          }}
        >
          <Autocomplete
            options={options}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, val) => option.u_id === val.u_id}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onChange={handleSelect}
            open={open}
            onOpen={() => {
              if (options.length > 0) setOpen(true);
            }}
            onClose={() => setOpen(false)}
            loading={loading}
            filterOptions={(x) => x} // server already filters by prefix
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  mt: 1,
                  borderRadius: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 12px 32px rgba(0,0,0,0.45)"
                      : "0 12px 32px rgba(15,23,42,0.12)",
                  overflow: "hidden",
                },
              },
              listbox: {
                sx: {
                  p: 0.75,
                  "& .MuiAutocomplete-option": {
                    borderRadius: 1.75,
                    mx: 0,
                    px: 1.25,
                  },
                },
              },
            }}
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
                key={option.u_id}
                sx={{
                  display: "flex !important",
                  alignItems: "center",
                  gap: 1.5,
                  py: "10px !important",
                  transition: "background-color 120ms ease",
                }}
              >
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 0.2,
                    color: "background.paper",
                    flexShrink: 0,
                    bgcolor: PARTY_COLOR[option.party] ?? "text.disabled",
                    boxShadow: (t) =>
                      `0 0 0 2px ${alpha(t.palette.background.paper, 1)}, 0 0 0 3px ${alpha(
                        t.palette.mode === "dark" ? "#fff" : "#000",
                        0.06,
                      )}`,
                  }}
                >
                  {getInitials(option.name)}
                </Box>

                <Stack spacing={0.25} sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{ color: "text.primary", fontWeight: 600 }}
                  >
                    {option.name}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ alignItems: "center" }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: PARTY_COLOR[option.party] ?? "text.disabled",
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      sx={{ fontWeight: 500 }}
                    >
                      {[option.role, option.party, option.state]
                        .filter(Boolean)
                        .join(" · ")}
                    </Typography>
                  </Stack>
                </Stack>

                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  since {option.latestYear}
                </Typography>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search congressman..."
                variant="outlined"
                size="small"
                sx={{
                  width: "100%",
                  "& .MuiAutocomplete-popupIndicator": { display: "none" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    bgcolor: (t) =>
                      t.palette.mode === "dark"
                        ? alpha(t.palette.common.white, 0.04)
                        : alpha(t.palette.common.black, 0.03),
                    transition:
                      "background-color 150ms ease, box-shadow 150ms ease",
                    "& fieldset": {
                      borderColor: "divider",
                      transition: "border-color 150ms ease",
                    },
                    "&:hover fieldset": {
                      borderColor: "text.secondary",
                    },
                    "&.Mui-focused": {
                      bgcolor: "background.paper",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "primary.main",
                      borderWidth: 1.5,
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    py: 1.1,
                  },
                }}
                slotProps={{
                  ...params.slotProps,
                  input: {
                    ...params.slotProps?.input,
                    startAdornment: (
                      <InputAdornment position="start" sx={{ ml: 0.25 }}>
                        <SearchRoundedIcon
                          fontSize="small"
                          sx={{ color: "text.disabled" }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {loading ? (
                          <CircularProgress
                            size={15}
                            thickness={5}
                            sx={{ color: "text.disabled", mr: 0.5 }}
                          />
                        ) : null}
                        {params.slotProps?.input?.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
          />
        </Box>
      </ClickAwayListener>
    </>
  );
}