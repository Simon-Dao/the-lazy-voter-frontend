'use client'

import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function FAQ() {
  const [expanded, setExpanded] = React.useState<string[]>([]);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(
        isExpanded
          ? [...expanded, panel]
          : expanded.filter((item) => item !== panel),
      );
    };

  return (
    <Container
      id="faq"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 3, sm: 6 },
      }}
    >
      <Typography
        component="h2"
        variant="h4"
        sx={{
          color: 'text.primary',
          width: { sm: '100%', md: '60%' },
          textAlign: { sm: 'left', md: 'center' },
        }}
      >
        Frequently asked questions
      </Typography>
      <Box sx={{ width: '100%' }}>
        <Accordion
          expanded={expanded.includes('panel1')}
          onChange={handleChange('panel1')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1d-content"
            id="panel1d-header"
          >
            <Typography component="span" variant="subtitle2">
              What is The Lazy Voter?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '70%' } }}
            >
              The Lazy Voter is a free civic data platform that pulls federal
              election, legislative, and campaign finance data into one place.
              Instead of digging through separate government websites, you can
              search a bill, a politician, or a PAC and see who&apos;s running,
              what they&apos;ve sponsored, and who&apos;s funding them, all in
              plain language.
            </Typography>
          </AccordionDetails>
        </Accordion>
                <Accordion
          expanded={expanded.includes('panel6')}
          onChange={handleChange('panel6')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel6d-content"
            id="panel6d-header"
          >
            <Typography component="span" variant="subtitle2">
              Who owns The Lazy Voter?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '70%' } }}
            >
              The Lazy Voter is a nonprofit started by <Link href="https://simondao.me">Simon Dao</Link>, a recent Computer Science graduate interested in politics. 
              Simon has no ties to any political instutions or governing bodies, he just wants voting data to be as accessible to all. For more information on data usage, checkout the
              {" "}<Link href="/privacy-policy">Privacy Policy</Link> and <Link href="/terms-of-service">Terms of Service</Link>
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded.includes('panel2')}
          onChange={handleChange('panel2')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2d-content"
            id="panel2d-header"
          >
            <Typography component="span" variant="subtitle2">
              Where does the data come from?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '70%' } }}
            >
              We pull directly from public federal sources: bill text and
              status from LegiScan and Congress.gov, and campaign contribution
              and PAC data from the Federal Election Commission (FEC). Records
              are matched and deduplicated across sources so the same
              politician or committee only shows up once, even if their name
              is formatted differently in each dataset.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded.includes('panel3')}
          onChange={handleChange('panel3')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3d-content"
            id="panel3d-header"
          >
            <Typography component="span" variant="subtitle2">
              How do federal elections actually work?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '70%' } }}
            >
              Congress has two chambers. All 435 House seats are up for
              election every 2 years, with representatives serving 2-year
              terms. The Senate has 100 seats split into three staggered
              classes, so roughly a third of the Senate (33 to 35 seats) is up
              every 2 years, with senators serving 6-year terms. The
              president is elected separately, every 4 years. Whichever party
              holds the most seats in a chamber controls its agenda and
              committee leadership.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded.includes('panel4')}
          onChange={handleChange('panel4')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel4d-content"
            id="panel4d-header"
          >
            <Typography component="span" variant="subtitle2">
              What are the midterm elections, and why do they matter?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '70%' } }}
            >
              Midterms happen halfway through a president&apos;s 4-year term,
              on the years that don&apos;t have a presidential election. The
              2026 midterms take place on November 3, 2026: all 435 House
              seats and 35 Senate seats are on the ballot. Because there&apos;s
              no presidential race to anchor turnout, midterms are often
              decided by a smaller, more motivated slice of voters, and they
              can shift control of Congress without changing who&apos;s in
              the White House.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded.includes('panel5')}
          onChange={handleChange('panel5')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel5d-content"
            id="panel5d-header"
          >
            <Typography component="span" variant="subtitle2">
              How are bills categorized and summarized?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '70%' } }}
            >
              Raw bill text is dense and hard to skim, so we run it through a
              categorization pipeline that tags each bill by topic (healthcare,
              defense, taxes, and so on) and pulls out key terms. This is
              meant to help you scan faster, not replace reading the actual
              bill. We always link back to the primary source so you can
              verify anything for yourself.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded.includes('panel6')}
          onChange={handleChange('panel6')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel6d-content"
            id="panel6d-header"
          >
            <Typography component="span" variant="subtitle2">
              How current is the data, and is the site free?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '70%' } }}
            >
              Our pipeline syncs regularly with LegiScan, Congress.gov, and
              the FEC, so bill statuses and contribution totals stay close to
              real time. The Lazy Voter is, and will stay, completely free.
              We built this because
              voters deserve easy access to information their elected
              officials are already required to disclose. For more information on our data usage checkout our 
              {" "}<Link href="/privacy-policy">Privacy Policy</Link> and <Link href="/terms-of-service">Terms of Service</Link>
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded.includes('panel7')}
          onChange={handleChange('panel7')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel7d-content"
            id="panel7d-header"
          >
            <Typography component="span" variant="subtitle2">
              I found an error, or have feedback. How do I reach you?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '70%' } }}
            >
              Please let us know. Public data is often messy or inconsistently
              formatted at the source, and matching records across FEC,
              Bioguide, and LegiScan isn&apos;t perfect. Email us at&nbsp;
              <Link href="mailto:SimonNDao13@gmail.com">
                SimonNDao13@gmail.com
              </Link>
              &nbsp;with a link to the page in question and we&apos;ll take a
              look.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Container>
  );
}