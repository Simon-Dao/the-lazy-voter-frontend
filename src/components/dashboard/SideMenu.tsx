"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import * as React from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import SearchBar from "../common/SearchBar";
import { tabs } from "#/util/Constants";
import ChatBot from "#/components/dashboard/ChatBot";

const DRAWER_WIDTH = 240;
const TOP_OFFSET = 100;
const REOPEN_BUTTON_DELAY = 80;

type SideMenuProps = {
  tab: number;
  setTab: Dispatch<SetStateAction<number>>;
  children?: React.ReactNode;
};

export default function SideMenu({ tab, setTab, children }: SideMenuProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [open, setOpen] = useState(true);
  const [showReopenButton, setShowReopenButton] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    setOpen(!isSmallScreen);
  }, [isSmallScreen]);

  useEffect(() => {
    if (open) {
      setShowReopenButton(false);
      return;
    }
    const timer = setTimeout(
      () => setShowReopenButton(true),
      REOPEN_BUTTON_DELAY,
    );
    return () => clearTimeout(timer);
  }, [open]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const [value, setValue] = useState<string>();
  const onSearchBarChange = (e: any) => {
    setValue(e.target.value);
  };
  const onSubmit = () => {
    alert("submitted");
  };

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const toggleChat = (newOpen: boolean) => () => {
    setChatOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Search
        </Typography>
        <IconButton size="small" onClick={toggleDrawer(false)}>
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <SearchBar
          value={value}
          onChange={onSearchBarChange}
          onSubmit={onSubmit}
          placeholder="Search politicians..."
          fullWidth
        />
      </Box>

      <Divider />

      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={tab}
          onChange={handleChange}
          aria-label="Vertical tabs"
          slotProps={{
            indicator: {
              sx: { left: 0, width: 3, borderRadius: 1 },
            },
          }}
          sx={{
            "& .MuiTab-root": {
              alignItems: "flex-start",
              textAlign: "left",
              textTransform: "none",
              minHeight: 44,
              px: 2,
              fontSize: 14,
              fontWeight: 500,
              color: "text.secondary",
              borderRadius: 1,
              mx: 1,
              my: 0.25,
              transition: "background-color 0.15s ease",
              "&:hover": {
                bgcolor: "action.hover",
              },
              "&.Mui-selected": {
                color: "primary.main",
                bgcolor: "action.selected",
              },
            },
          }}
        >
          {tabs.map((tabLabel, i) => (
            <Tab
              key={i}
              label={tabLabel}
              id={`vertical-tab-${i}`}
              aria-controls={`vertical-tabpanel-${i}`}
              disableRipple
            />
          ))}
        </Tabs>
      </Box>

      <Divider />

      <Box sx={{ p: 1.5 }}>
        <Box
          onClick={toggleChat(true)}
          role="button"
          tabIndex={0}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            px: 1.5,
            py: 1.25,
            borderRadius: 1,
            cursor: "pointer",
            color: "text.secondary",
            transition: "background-color 0.15s ease",
            "&:hover": {
              bgcolor: "action.hover",
              color: "text.primary",
            },
          }}
        >
          <ForumOutlinedIcon fontSize="small" />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Ask AI to Summarize
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100%", pt: `${TOP_OFFSET}px` }}>
      <Drawer
        variant={isSmallScreen ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={toggleDrawer(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: !isSmallScreen && open ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          whiteSpace: "nowrap",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: open
                ? theme.transitions.easing.easeOut
                : theme.transitions.easing.sharp,
              duration: open
                ? theme.transitions.duration.enteringScreen
                : theme.transitions.duration.leavingScreen,
            }),
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            maxWidth: "85vw",
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
            top: TOP_OFFSET,
            height: `calc(100% - ${TOP_OFFSET}px)`,
          },
        }}
      >
        {DrawerList}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          transition: (theme) =>
            theme.transitions.create("margin", {
              easing: open
                ? theme.transitions.easing.easeOut
                : theme.transitions.easing.sharp,
              duration: open
                ? theme.transitions.duration.enteringScreen
                : theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        {children}
      </Box>

      {showReopenButton && (
        <IconButton
          onClick={toggleDrawer(true)}
          size="small"
          sx={{
            position: "fixed",
            top: TOP_OFFSET + 8,
            left: 8,
            zIndex: (theme) => theme.zIndex.drawer + 1,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "background.paper",
          }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>
      )}

      {/* <ChatBot chatOpen={chatOpen} setChatOpen={setChatOpen} /> */}
    </Box>
  );
}
