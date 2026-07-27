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
} from "@mui/material";
import { POLITICIANS_SEARCH_API_URL } from "#/util/Constants";
import { PoliticianBasicInfo } from "#/util/State";
import { useAtom } from 'jotai';
import { isPoliticianSelectedAtom } from '#/util/State';

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

  const [isPoliticianSelected, setIsPoliticianSelected] = useAtom(isPoliticianSelectedAtom);
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
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
                key={option.u_id}
                sx={{
                  display: "flex !important",
                  alignItems: "center",
                  gap: 1.5,
                  py: 1,
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: "action.hover",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "text.secondary",
                    flexShrink: 0,
                  }}
                >
                  {getInitials(option.name)}
                </Box>

                <Stack spacing={0} sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{ color: "text.primary" }}
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
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        bgcolor: PARTY_COLOR[option.party] ?? "text.disabled",
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {[option.role, option.party, option.state]
                        .filter(Boolean)
                        .join(" · ")}
                    </Typography>
                  </Stack>
                </Stack>

                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  since {option.latestYear}
                </Typography>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search politicians..."
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiAutocomplete-popupIndicator": { display: "none" },
                  width: "100%",
                }}
                slotProps={{
                  ...params.slotProps,
                  input: {
                    ...params.slotProps?.input,
                    endAdornment: (
                      <>
                        {loading ? (
                          <CircularProgress color="inherit" size={16} />
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