"use client";

import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import SideMenu from "../../components/dashboard/SideMenu";
import AppTheme from "../../shared-theme/AppTheme";
import AppAppBar from "../../components/landing/AppAppBar";
import Summary from "#/app/dashboard/Summary";
import News from "#/app/dashboard/News";
import Finances from "#/app/dashboard/Finances";
import { useState, useEffect } from "react";
import { useAtom } from 'jotai'
import { DashboardSideMenuTabAtom } from '#/util/State'
import Legislation from '#/components/legislation/Legislation'

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

export default function Dashboard(props: { disableCustomTheme?: boolean }) {

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <AppAppBar />
      <Box sx={{justifyItems:'center'}}>
      <Legislation />
      </Box>
    </AppTheme>
  );
}
