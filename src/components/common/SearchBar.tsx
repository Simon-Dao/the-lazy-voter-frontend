import React from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  ClickAwayListener,
  Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export type SearchResult = {
  id: string;
  label: string;
  secondaryLabel?: string;
};

type SearchBarProps = {
  value?: string;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  placeholder?: string;
  onSubmit?: (value: string) => void;
  fullWidth?: boolean;
  results?: SearchResult[];
  loading?: boolean;
  onResultSelect?: (result: SearchResult) => void;
};

export default function SearchBar({
  value = "",
  onChange,
  placeholder = "Search",
  onSubmit,
  fullWidth = true,
  results = [],
  loading = false,
  onResultSelect,
}: SearchBarProps) {
  const [open, setOpen] = React.useState(false);

  const handleSubmit = () => {
    onSubmit?.(value);
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: "relative", width: fullWidth ? "100%" : "auto" , padding: 0 }}>
        <TextField
          fullWidth={fullWidth}
          value={value}
          onChange={(event) => {
            onChange?.(event);
            setOpen(true);
          }}
          onFocus={() => value && setOpen(true)}
          placeholder={placeholder}
          variant="outlined"
          size="small"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSubmit();
            }
          }}
        />
      </Box>
    </ClickAwayListener>
  );
}
