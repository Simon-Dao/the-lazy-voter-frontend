"use client"

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import { useColorScheme } from '@mui/material/styles';

const sections = [
  {
    heading: '1. Information we collect',
    body: [
      `Information you provide. If you contact us, sign up for a newsletter, or create an account, we may collect your name, email address, and any other information you choose to include.`,
      `Automatically collected information. Like most websites, we may automatically collect certain technical information when you visit, including your IP address, browser type, device type, pages viewed, and referring URLs. This is typically gathered through standard web server logs and, if used, analytics tools (e.g. cookies or similar tracking technologies).`,
      `Public data. The core content on this Site — information about politicians, bills, campaign finance, and votes — is drawn from public government and civic data sources (including the Federal Election Commission, Congress.gov, and LegiScan). This data is not personal information provided by you, and its use is governed by the terms of the original public data source, not by this policy.`,
    ],
  },
  {
    heading: '2. How we use information',
    body: [
      `We use collected information to operate, maintain, and improve the Site; respond to inquiries you send us; understand aggregate usage patterns (e.g. which pages are most visited); and send communications you've opted into, such as a newsletter.`,
      `We do not sell your personal information to third parties.`,
    ],
  },
  {
    heading: '3. Cookies and tracking',
    body: [
      `The Site may use cookies or similar technologies for basic functionality (such as remembering a dark/light mode preference) and, if enabled, analytics (such as Google Analytics or a similar service) to understand how visitors use the Site. You can control cookies through your browser settings; disabling them may affect some Site functionality.`,
    ],
  },
  {
    heading: '4. Third-party services',
    body: [
      `The Site may link to or embed data from third-party sources (FEC, Congress.gov, LegiScan, and similar public data providers). We are not responsible for the privacy practices of these third parties. Review their respective privacy policies for information about how they handle data.`,
      `If we use third-party hosting or analytics infrastructure (e.g. AWS, analytics providers), those providers may process technical data on our behalf under their own privacy and security practices.`,
    ],
  },
  {
    heading: '5. Data retention',
    body: [
      `We retain information only as long as necessary for the purposes described in this policy, or as required by law.`,
    ],
  },
  {
    heading: '6. Your choices',
    body: [
      `You may opt out of any newsletter or email communications via an unsubscribe link, request that we delete personal information you've provided to us by contacting us at the email below, or disable cookies through your browser settings.`,
    ],
  },
  {
    heading: "7. Children's privacy",
    body: [
      `The Site is not directed at children under 13, and we do not knowingly collect personal information from children under 13.`,
    ],
  },
  {
    heading: '8. Changes to this policy',
    body: [
      `We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date.`,
    ],
  },
];

export default function PrivacyPolicyPage() {
  const { mode, systemMode } = useColorScheme();

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, sm: 10 } }}>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
        Privacy Policy
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
        Last updated: [DATE]
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        TheLazyVoter (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates thelazyvoter.org (the
        &quot;Site&quot;). This Privacy Policy explains what information we collect, how we use it,
        and the choices you have.
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {sections.map((section, index) => (
        <Box key={section.heading} sx={{ mb: 4 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 1.5 }}>
            {section.heading}
          </Typography>
          {section.body.map((paragraph) => (
            <Typography
              key={paragraph.slice(0, 24)}
              variant="body1"
              sx={{ color: 'text.secondary', mb: 1.5 }}
            >
              {paragraph}
            </Typography>
          ))}
          {index < sections.length - 1 && <Divider sx={{ mt: 3 }} />}
        </Box>
      ))}

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 1.5 }}>
          9. Contact us
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          If you have questions about this Privacy Policy, contact us at{' '}
          <Link href="mailto:hello@thelazyvoter.org">hello@thelazyvoter.org</Link>.
        </Typography>
      </Box>
    </Container>
  );
}