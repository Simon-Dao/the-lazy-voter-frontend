"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NextLink from "next/link";

const sections = [
  {
    heading: "1. Who runs this Site",
    body: [
      `TheLazyVoter is an independent project built and maintained by a single individual, not a company or organization. References to "we," "us," and "our" throughout this policy refer to that individual.`,
    ],
  },
  {
    heading: "2. We do not collect personal information",
    body: [
      `TheLazyVoter does not require an account, does not have a login, and does not ask you to submit any personal information to use the Site. No personal data, such as your name, email address, or other identifying information, is collected through your use of the Site.`,
    ],
  },
  {
    heading: "3. Public data displayed on the Site",
    body: [
      `The core content on this Site, information about politicians, bills, campaign finance, and votes, is drawn entirely from public government and civic data sources, including the Federal Election Commission, Congress.gov, and LegiScan. This data concerns public officials and public records; it is not personal information collected from you, and its use is governed by the terms of the original public data source, not by this policy.`,
    ],
  },
  {
    heading: "4. Basic technical logs",
    body: [
      `Like virtually all websites, the hosting infrastructure behind this Site may automatically generate standard server logs (such as IP address, browser type, and pages requested) as a byproduct of serving web pages. These logs exist for security and reliability purposes only. They are not used to build visitor profiles, track individuals across visits, or combine with any other data.`,
    ],
  },
  {
    heading: "5. No cookies, no tracking, no analytics",
    body: [
      `The Site does not use tracking cookies, advertising cookies, or third-party analytics services. If this ever changes, this policy will be updated before any such change takes effect.`,
    ],
  },
  {
    heading: "6. No data sharing or sale",
    body: [
      `Because no personal information is collected in the first place, there is none to share or sell. Any public data displayed on the Site remains subject to the terms of its original government or civic data source.`,
    ],
  },
  {
    heading: "7. Children's privacy",
    body: [
      `Because the Site does not collect personal information from any visitor, it does not knowingly collect personal information from children under 13.`,
    ],
  },
  {
    heading: "8. Changes to this policy",
    body: [
      `If practices ever change - for example, if optional accounts, a newsletter, or analytics are introduced - this Privacy Policy will be updated first, with a revised "Last updated" date, so visitors always know what to expect.`,
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, sm: 10 } }}>
      <Button
        component={NextLink}
        href="/"
        startIcon={<ArrowBackIcon />}
        variant="contained"
        color="primary"
        size="large"
        sx={{ mb: 4 }}
      >
        Back to home
      </Button>

      <Typography variant="h3" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
        Privacy Policy
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
        Last updated: 7/19/2026
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        Welcome to TheLazyVoter (&quot;we,&quot; &quot;us,&quot; or
        &quot;our&quot;), accessible at thelazyvoter.org (the &quot;Site&quot;).
        By accessing or using the Site, you agree to be bound by these Terms of
        Service (&quot;Terms&quot;). If you do not agree, please do not use the
        Site.
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {sections.map((section, index) => (
        <Box key={section.heading} sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            component="h2"
            sx={{ fontWeight: 600, mb: 1.5 }}
          >
            {section.heading}
          </Typography>
          {section.body.map((paragraph) => (
            <Typography
              key={paragraph.slice(0, 24)}
              variant="body1"
              sx={{ color: "text.secondary", mb: 1.5 }}
            >
              {paragraph}
            </Typography>
          ))}
          {index < sections.length - 1 && <Divider sx={{ mt: 3 }} />}
        </Box>
      ))}

      <Box sx={{ mt: 2 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{ fontWeight: 600, mb: 1.5 }}
        >
          13. Contact us
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Questions about these Terms can be directed to{" "}
          <Link href="mailto:SimonNDao13@gmail.com">
            SimonNDao13@gmail.com
          </Link>
          .
        </Typography>
      </Box>
    </Container>
  );
}
