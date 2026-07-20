import type { Metadata } from "next";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../shared-theme/AppTheme";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "../globals.css";

export const metadata: Metadata = {};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AppTheme>
          <CssBaseline enableColorScheme />
          {children}
        </AppTheme>
      </body>
    </html>
  );
}
