"use client";

import Divider from "@mui/material/Divider";
import AppAppBar from "../components/landing/AppAppBar";
import Hero from "../components/landing/Hero";
import LogoCollection from "../components/landing/LogoCollection";
import Features from "../components/landing/Features";
import FAQ from "../components/landing/FAQ";
import Footer from "../components/landing/Footer";

export default function MarketingPage(props: { disableCustomTheme?: boolean }) {
  return (
    <>
      <AppAppBar />
      <Hero />
      <div>
        <LogoCollection />
        {/* <Features /> */}
        <Divider />
        <FAQ />
        <Divider />
        <Footer />
      </div>
    </>
  );
}
