"use client";

import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import * as React from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import SearchBar from "#/components/dashboard/SearchBar";
import { tabs } from "#/util/Constants";
import { useAtom } from "jotai";
import {
  PoliticianBasicInfo,
  IsPoliticianSelectedAtom,
  DashboardSideMenuTabAtom,
  PoliticiansDetailedAtom,
  PoliticianUIDType,
  PoliticianDetailed,
  SelectedPoliticianDetailedAtom,
  PoliticianBasicInfosAtom,
  SelectedPoliticianUIDAtom
} from "#/util/State";

const DRAWER_WIDTH = 300;
const TOP_OFFSET = 100;
const REOPEN_BUTTON_DELAY = 80;

type SideMenuProps = {
  children?: React.ReactNode;
  addPolitician: (politician: PoliticianBasicInfo) => void;
};

export default function SideMenu({ children, addPolitician }: SideMenuProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isPortrait = useMediaQuery("(orientation: portrait)");

  const topOffset = isPortrait ? 0 : TOP_OFFSET;

  const [tab, setTab] = useAtom(DashboardSideMenuTabAtom);
  const [open, setOpen] = useState(true);
  const [showReopenButton, setShowReopenButton] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isPoliticianSelected, setIsPoliticianSelected] = useAtom(
    IsPoliticianSelectedAtom,
  );
  const [politiciansDetailed, setPoliticiansDetailed] = useAtom(
    PoliticiansDetailedAtom,
  );

  const [politicianBasicInfos, setPoliticianBasicInfos] = useAtom(PoliticianBasicInfosAtom);
  
  const [selectedPoliticianDetailed, setSelectedPoliticianDetailed] = useAtom(
    SelectedPoliticianDetailedAtom,
  );
  // Only one politician can be selected at a time. `false` = none selected.
  const [selectedPoliticianId, setSelectedPoliticianId] = useAtom(
    SelectedPoliticianUIDAtom,
  );

  const dragItemIndex = useRef<number | null>(null);

  useEffect(() => {
    if (politicianBasicInfos.length == 0) {
      setIsPoliticianSelected(false);
    }
  }, [politicianBasicInfos]);

  useEffect(() => {
    setOpen(!isSmallScreen);
  }, [isSmallScreen]);

  useEffect(() => {
    setSelectedPoliticianDetailed(
      politiciansDetailed.find((p) => p.u_id === selectedPoliticianId),
    );
  }, [selectedPoliticianId, politiciansDetailed]);

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

  const handlePoliticianChange = (
    event: React.SyntheticEvent,
    u_id: string,
  ) => {
    setSelectedPoliticianId(u_id);
  };

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const toggleChat = (newOpen: boolean) => () => {
    setChatOpen(newOpen);
  };

  const removePolitician = (u_id: string) => {
    setPoliticianBasicInfos((prev) => {
      const updated = prev.filter((p) => p.u_id !== u_id);

      // If we removed the selected politician, fall back to the next one.
      setSelectedPoliticianId((current: PoliticianUIDType) =>
        current === u_id ? (updated[0]?.u_id ?? false) : current,
      );

      setPoliticiansDetailed((current: PoliticianDetailed[]) =>
        current.filter((p) => p.u_id !== u_id),
      );

      return updated;
    });
  };

  const handleDragStart = (index: number) => {
    dragItemIndex.current = index;
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (index: number) => {
    const fromIndex = dragItemIndex.current;
    if (fromIndex === null || fromIndex === index) return;

    setPoliticianBasicInfos((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(index, 0, moved);
      return updated;
    });
    dragItemIndex.current = null;
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
        <SearchBar onSelectPolitician={addPolitician} />
      </Box>

      <Divider />

      {/*
        This wrapper must be a flex column with a bounded height (flexGrow: 1
        from the parent, minHeight: 0 here) so its children can size against
        it. Without minHeight: 0, flex items default to min-height: auto and
        refuse to shrink below their content size, which silently breaks
        scrolling on the politician list below.
      */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
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
            flexShrink: 0,
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
              label={tabLabel + (i != 0 && !isPoliticianSelected ? "🔒" : "")}
              id={`vertical-tab-${i}`}
              aria-controls={`vertical-tabpanel-${i}`}
              disableRipple
              disabled={i != 0 ? !isPoliticianSelected : false}
            />
          ))}
        </Tabs>

        <Divider sx={{ my: 1, flexShrink: 0 }} />

        {/*
          flex: 1 lets this section claim whatever space is left after the
          main Tabs above it — that's what gives it a bounded height to
          scroll against. minHeight: 0 again overrides the flex default so
          it can actually shrink and scroll instead of growing to fit all
          the politician tabs.
        */}
        <Box
          sx={{
            px: 1.5,
            pt: 1,
            pb: 0.5,
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: "text.secondary",
              px: 0.5,
              flexShrink: 0,
            }}
          >
            Selected Politician
          </Typography>

          {politicianBasicInfos.length === 0 ? (
            <Typography
              variant="body2"
              sx={{
                color: "text.disabled",
                fontStyle: "italic",
                px: 2,
                pb: 1,
              }}
            >
              Use search above to add a politician
            </Typography>
          ) : (
            <Tabs
              orientation="vertical"
              value={selectedPoliticianId}
              onChange={handlePoliticianChange}
              aria-label="Selected politician tabs"
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
                  py: 0.75,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "text.secondary",
                  borderRadius: 1,
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
              {politicianBasicInfos.map((politician, index) => (
                <Tab
                  onClick={() => setIsPoliticianSelected(true)}
                  key={politician.u_id}
                  value={politician.u_id}
                  id={`politician-tab-${politician.u_id}`}
                  aria-controls={`politician-tabpanel-${politician.u_id}`}
                  disableRipple
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  sx={{ cursor: "grab", padding: "5px !important" }}
                  label={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        width: "100%",
                      }}
                    >
                      <DragIndicatorIcon
                        fontSize="small"
                        sx={{ color: "text.disabled" }}
                      />

                      <Box sx={{ flexGrow: 1, minWidth: 0, textAlign: "left" }}>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ fontWeight: 500, lineHeight: 1.2 }}
                        >
                          {politician.name.length >= 20
                            ? politician.name.substring(0, 20) + "..."
                            : politician.name}
                        </Typography>
                        {politician.party && (
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", lineHeight: 1 }}
                            noWrap
                          >
                            {politician.party.charAt(0).toUpperCase() == "R"
                              ? "Rep"
                              : politician.party.charAt(0).toUpperCase() == "D"
                                ? "Dem"
                                : "Ind"}{" "}
                            | {politician.role} | {politician.state}
                          </Typography>
                        )}
                      </Box>

                      <IconButton
                        size="small"
                        component="span"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePolitician(politician.u_id);
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                />
              ))}
            </Tabs>
          )}
        </Box>
      </Box>

      <Divider />

      {/* <Box sx={{ p: 1.5 }}>
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
      </Box> */}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100%", pt: `${topOffset}px` }}>
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
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
            top: topOffset,
            height: `calc(100% - ${topOffset}px)`,
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
            top: topOffset + 8,
            left: 8,
            zIndex: (theme) => theme.zIndex.drawer + 1,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "background.paper",
          }}
        >
          <SearchIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
