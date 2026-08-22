"use client";

import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import SideMenu from "../../components/dashboard/SideMenu";
import AppTheme from "../../shared-theme/AppTheme";
import AppAppBar from "../../components/landing/AppAppBar";
import Summary from "#/app/dashboard/Summary";
import Legislation from "#/app/dashboard/Legislation";
import News from "#/app/dashboard/News";
import Finances from "#/app/dashboard/Finances";
import Candidates from "#/app/dashboard/Candidates";
import { useState, useEffect } from "react";
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

import {
  chartsCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../../theme/customizations";

const xThemeComponents = {
  ...chartsCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

// Called by SearchBar when the user picks a politician from search results.


export default function Dashboard(props: { disableCustomTheme?: boolean }) {
  const [tab, setTab] = useAtom(DashboardSideMenuTabAtom);

  const [politicianBasicInfos, setPoliticianBasicInfos] = useAtom(PoliticianBasicInfosAtom);
  const [politiciansDetailed, setPoliticiansDetailed] = useAtom(
    PoliticiansDetailedAtom,
  );
  const [selectedPoliticianId, setSelectedPoliticianId] = useAtom(
    SelectedPoliticianUIDAtom,
  );

  const addPolitician = async (politician: PoliticianBasicInfo) => {
  setPoliticianBasicInfos((prev) => {
    if (prev.some((p) => p.u_id === politician.u_id)) return prev;
    return [...prev, politician];
  });
  setSelectedPoliticianId(politician.u_id);

  const placeholder: PoliticianDetailed = {
    u_id: politician.u_id,
    name: politician.name,
    latestYear: politician.latestYear,
    party: politician.party,
    state: politician.state,
    status: politician.status,
    timeline: undefined,
    billCategoriesByYear: undefined,
    donationsByYear: undefined,
    topDonorsByYear: undefined,
    totalDonations: undefined,
    campaignTotals: undefined,
    campaignFields: undefined,
    newsArticles: undefined,
    photoSrc: "",
  };

  // Add a placeholder entry immediately so the UI has something to render
  setPoliticiansDetailed((prev: any) => [...prev, placeholder]);

  const patch = (fields: Partial<PoliticianDetailed>) => {
    setPoliticiansDetailed((prev: any) =>
      prev.map((p: PoliticianDetailed) =>
        p.u_id === politician.u_id ? { ...p, ...fields } : p,
      ),
    );
  };

  // Fetch Image
  const fetchImage = async () => {
      patch({
        photoSrc: `https://thelazyvoter.org/avatars/${politician.u_id}.jpg`,
      });
  };

  // Fetch AI Summary
  const fetchAISummary = async () => {
    try {
      const req = await fetch(
        `https://thelazyvoter.org/api/politicians/${politician.u_id}/finance/donors/campaign_totals`,
      );
      const data = await req.json();
      patch({ aiSummary: data.totals, campaignFields: data.fields });
    } catch (error) {
      console.error(
        "Failed to fetch campaign totals for",
        politician.u_id,
        error,
      );
    }
  };

  // Fetch Campaign Totals
  const fetchCampaignTotals = async () => {
    try {
      const req = await fetch(
        `https://thelazyvoter.org/api/politicians/${politician.u_id}/finance/donors/campaign_totals`,
      );
      const data = await req.json();
      patch({ campaignTotals: data.totals, campaignFields: data.fields });
    } catch (error) {
      console.error(
        "Failed to fetch campaign totals for",
        politician.u_id,
        error,
      );
    }
  };

  // Fetch Timeline
  const fetchTimeline = async () => {
    try {
      const res = await fetch(
        `https://thelazyvoter.org/api/politicians/${politician.u_id}/timeline`,
      );
      if (!res.ok) throw new Error(`Timeline fetch failed: ${res.status}`);
      const data = await res.json();
      patch({ timeline: data.timeline });
    } catch (error) {
      console.error("Failed to fetch timeline for", politician.u_id, error);
    }
  };

  // Fetch Bill Categories By Year
  const fetchBillCategories = async () => {
    try {
      const res = await fetch(
        `https://thelazyvoter.org/api/politicians/${politician.u_id}/legislation/totals`,
      );
      if (!res.ok) throw new Error(`Bill Category fetch failed: ${res.status}`);
      const data = await res.json();
      patch({ billCategoriesByYear: data });
    } catch (error) {
      console.error(
        "Failed to fetch Bill Category for",
        politician.u_id,
        error,
      );
    }
  };

  // Fetch Donation Totals By Year
  const fetchDonationTotals = async () => {
    try {
      const res = await fetch(
        `https://thelazyvoter.org/api/politicians/${politician.u_id}/finance/top-donor-totals`,
      );
      if (!res.ok) throw new Error(`Bill Category fetch failed: ${res.status}`);
      const data = await res.json();
      patch({
        donationsByYear: data.totals,
        totalDonations: data.total_donations,
      });
    } catch (error) {
      console.error(
        "Failed to fetch Bill Category for",
        politician.u_id,
        error,
      );
    }
  };

  // Fetch Top Donors by Year
  const fetchTopDonors = async () => {
    try {
      const res = await fetch(
        `https://thelazyvoter.org/api/politicians/${politician.u_id}/finance/donors/top-donors`,
      );
      if (!res.ok) throw new Error(`Bill Category fetch failed: ${res.status}`);
      const data = await res.json();
      patch({ topDonorsByYear: data });
    } catch (error) {
      console.error(
        "Failed to fetch Bill Category for",
        politician.u_id,
        error,
      );
    }
  };

  // Fetch news articles
  const fetchNews = async () => {
    try {
      const params = new URLSearchParams({
        name: politician.name,
        extra: (politician.state ?? "") + (politician.role ?? ""),
      });

      const res = await fetch(
        `https://thelazyvoter.org/api/politicians/${politician.u_id}/news?${params.toString()}`,
      );
      if (!res.ok) throw new Error(`Bill Category fetch failed: ${res.status}`);
      const data = await res.json();
      patch({ newsArticles: data });
    } catch (error) {
      console.error(
        "Failed to fetch News Articles for",
        politician.u_id,
        error,
      );
    }
  };

  // Fire all fetches concurrently — each patches state independently as it resolves,
  // so the UI fills in piece by piece instead of waiting on the slowest one.
  await Promise.all([
    fetchImage(),
    fetchAISummary(),
    fetchCampaignTotals(),
    fetchTimeline(),
    fetchBillCategories(),
    fetchDonationTotals(),
    fetchTopDonors(),
    fetchNews(),
  ]);
};

  const tabs = [
    <Candidates addPolitician={addPolitician} />,
    <Summary />,
    <News />,
    <Legislation />,
    <Finances />,
  ];

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <AppAppBar />
      <Box sx={{ display: "flex" }}>
        <SideMenu addPolitician={addPolitician}/>
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: "auto",
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            {tabs[tab]}
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
