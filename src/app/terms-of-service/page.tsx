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
    heading: "2. Purpose of the Site",
    body: [
      `TheLazyVoter aggregates and presents publicly available civic and political data, including information sourced from the Federal Election Commission (FEC), Congress.gov, and LegiScan, to help users make more informed decisions. The Site is provided for informational purposes only.`,
    ],
  },
  {
    heading: "3. No endorsement, nonpartisan use",
    body: [
      `TheLazyVoter does not endorse, support, or oppose any political party, candidate, or ballot measure. Content on the Site reflects publicly available data and is presented without partisan intent. Nothing on this Site should be construed as an endorsement or as legal, financial, or voting advice.`,
    ],
  },
  {
    heading: "4. Not affiliated with any government agency",
    body: [
      `TheLazyVoter is an independent project and is not affiliated with, endorsed by, or operated by any government agency, including but not limited to the FEC, U.S. Congress, or any state legislature.`,
    ],
  },
  {
    heading: "5. Accuracy of data",
    body: [
      `We aggregate data from third-party public sources and make reasonable efforts to keep it accurate and up to date. However, we do not guarantee the accuracy, completeness, or timeliness of any information on the Site. Source data may itself contain errors or delays beyond our control. Users should verify important information directly with primary sources (e.g. FEC.gov, Congress.gov) before relying on it for any decision.`,
    ],
  },
  {
    heading: "6. Acceptable use",
    body: [
      `You agree not to use the Site for any unlawful purpose; attempt to interfere with, disrupt, or gain unauthorized access to the Site or its underlying systems; scrape, republish, or redistribute Site content in a way that misrepresents its source or accuracy; or use automated means to access the Site in a manner that sends more requests than a human could reasonably produce, except as permitted by a published API or robots.txt.`,
    ],
  },
  {
    heading: "7. Intellectual property",
    body: [
      `The Site's original design, code, branding, and written content are owned by TheLazyVoter unless otherwise noted. Public data displayed on the Site remains subject to the terms of its original source and is not owned by us. You may not use TheLazyVoter's name, logo, or branding without permission.`,
    ],
  },
  {
    heading: "8. Third-party links and data",
    body: [
      `The Site may link to or incorporate data from third-party websites and APIs. We are not responsible for the content, accuracy, or practices of these third parties.`,
    ],
  },
  {
    heading: "9. Disclaimer of warranties",
    body: [
      `The Site is provided "as is" and "as available," without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.`,
    ],
  },
  {
    heading: "10. Limitation of liability",
    body: [
      `To the fullest extent permitted by law, TheLazyVoter and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of, or inability to use, the Site.`,
    ],
  },
  {
    heading: "11. Changes to these Terms",
    body: [
      `We may update these Terms from time to time. Continued use of the Site after changes are posted constitutes acceptance of the updated Terms.`,
    ],
  },
  {
    heading: "12. Governing law",
    body: [
      `These Terms are governed by the laws of [YOUR STATE/JURISDICTION], without regard to conflict of law principles.`,
    ],
  },
];

export default function TermsOfServicePage() {
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
        Terms of Service
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
