'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import MuiChip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import HowToVoteRoundedIcon from '@mui/icons-material/HowToVoteRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';

const chambers = [
  {
    name: 'House of Representatives',
    seats: '435 voting members',
    term: '2-year terms, entire chamber up for election every cycle',
    represents: 'Districts drawn by population \u2014 states with more people get more seats',
    powers: [
      'Must originate all revenue (tax) bills',
      'Sole power to impeach federal officials',
      'Elects the president if the Electoral College ties',
    ],
  },
  {
    name: 'Senate',
    seats: '100 members, 2 per state',
    term: '6-year terms, staggered so about a third are up every 2 years',
    represents: 'Equal representation \u2014 every state gets the same 2 seats regardless of population',
    powers: [
      'Tries impeachments and can remove officials by two-thirds vote',
      'Confirms presidential nominees (Cabinet, judges, ambassadors)',
      'Ratifies treaties by two-thirds vote',
    ],
  },
];

const steps = [
  {
    icon: <DescriptionRoundedIcon />,
    stage: 'Step 1',
    title: 'A bill is introduced',
    description:
      'Any member of the House or Senate can introduce a bill. It gets a number (like H.R. 1 or S. 1), a sponsor, and is referred to the committee(s) with jurisdiction over the subject.',
    detail:
      'Only members of Congress can formally introduce legislation, though the idea can come from anywhere, including a constituent, an agency, or another lawmaker.',
  },
  {
    icon: <GroupsRoundedIcon />,
    stage: 'Step 2',
    title: 'Committee review',
    description:
      'The bill goes to committee, where most legislation actually dies. Committees hold hearings, take testimony, and can "mark up" the bill by amending it before voting on whether to send it forward.',
    detail:
      'Roughly 90% of bills never make it out of committee. This is where subject-matter experts and interest groups have the most influence.',
  },
  {
    icon: <HowToVoteRoundedIcon />,
    stage: 'Step 3',
    title: 'Floor debate and vote',
    description:
      'If a committee approves the bill, it moves to the floor of that chamber for debate, possible amendments, and a full vote. A simple majority passes it in most cases.',
    detail:
      'The House and Senate have very different floor rules. The House uses the Rules Committee to limit debate; the Senate allows unlimited debate unless 60 votes invoke cloture to end a filibuster.',
  },
  {
    icon: <SwapHorizRoundedIcon />,
    stage: 'Step 4',
    title: 'The other chamber',
    description:
      'A bill must pass both the House and Senate in identical form. If it started in the House, it now goes through introduction, committee, and floor votes again in the Senate (or vice versa).',
    detail:
      'The second chamber can pass the bill as-is, reject it, ignore it entirely, or change it and send back a different version.',
  },
  {
    icon: <CompareArrowsRoundedIcon />,
    stage: 'Step 5',
    title: 'Reconciling differences',
    description:
      'If the two chambers pass different versions, a conference committee of members from both chambers negotiates a single compromise text, which then must be re-approved by both chambers.',
    detail:
      'Not every bill needs this step. If one chamber simply adopts the other\u2019s exact version, the bill moves straight to the president.',
  },
  {
    icon: <GavelRoundedIcon />,
    stage: 'Step 6',
    title: 'The president decides',
    description:
      'The president can sign the bill into law, veto it and send it back, or take no action. Congress can override a veto with a two-thirds vote in both chambers.',
    detail:
      'If Congress adjourns within 10 days of sending a bill and the president has not signed it, it dies without a veto \u2014 a "pocket veto."',
  },
];

interface ChipProps {
  selected?: boolean;
}

const Chip = styled(MuiChip)<ChipProps>(({ theme }) => ({
  variants: [
    {
      props: ({ selected }) => !!selected,
      style: {
        background:
          'linear-gradient(to bottom right, hsl(210, 98%, 48%), hsl(210, 98%, 35%))',
        color: 'hsl(0, 0%, 100%)',
        borderColor: (theme.vars || theme).palette.primary.light,
        '& .MuiChip-label': {
          color: 'hsl(0, 0%, 100%)',
        },
        ...theme.applyStyles('dark', {
          borderColor: (theme.vars || theme).palette.primary.dark,
        }),
      },
    },
  ],
}));

interface StepVisualProps {
  index: number;
  icon: React.ReactNode;
  stage: string;
}

function StepVisual({ index, icon, stage }: StepVisualProps) {
  return (
    <Box
      sx={(theme) => ({
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        background:
          'linear-gradient(160deg, hsl(210, 100%, 97%) 0%, hsl(210, 100%, 92%) 100%)',
        ...theme.applyStyles('dark', {
          background:
            'linear-gradient(160deg, hsl(220, 30%, 14%) 0%, hsl(220, 30%, 9%) 100%)',
        }),
      })}
    >
      <Box
        sx={(theme) => ({
          width: 88,
          height: 88,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          color: 'primary.main',
          fontSize: 40,
          '& svg': { fontSize: 40 },
        })}
      >
        {icon}
      </Box>
      <Typography
        variant="overline"
        sx={{ color: 'text.secondary', letterSpacing: 2, fontWeight: 700 }}
      >
        {stage} of {steps.length}
      </Typography>
    </Box>
  );
}

interface MobileLayoutProps {
  selectedStepIndex: number;
  handleStepClick: (index: number) => void;
  selectedStep: (typeof steps)[0];
}

export function MobileLayout({
  selectedStepIndex,
  handleStepClick,
  selectedStep,
}: MobileLayoutProps) {
  if (!steps[selectedStepIndex]) {
    return null;
  }

  return (
    <Box
      sx={{
        display: { xs: 'flex', sm: 'none' },
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, overflow: 'auto' }}>
        {steps.map(({ title }, index) => (
          <Chip
            size="medium"
            key={index}
            label={title}
            onClick={() => handleStepClick(index)}
            selected={selectedStepIndex === index}
          />
        ))}
      </Box>
      <Card variant="outlined">
        <Box sx={{ height: 220 }}>
          <StepVisual
            index={selectedStepIndex}
            icon={steps[selectedStepIndex].icon}
            stage={selectedStep.stage}
          />
        </Box>
        <Box sx={{ px: 2, pb: 2, pt: 2 }}>
          <Typography
            gutterBottom
            sx={{ color: 'text.primary', fontWeight: 'medium' }}
          >
            {selectedStep.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
            {selectedStep.description}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.disabled', fontStyle: 'italic', lineHeight: 1.5 }}
          >
            {selectedStep.detail}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}

export default function HowALawIsMade() {
  const [selectedStepIndex, setSelectedStepIndex] = React.useState(0);

  const handleStepClick = (index: number) => {
    setSelectedStepIndex(index);
  };

  const selectedStep = steps[selectedStepIndex];

  return (
    <Container id="how-a-law-is-made" sx={{ py: { xs: 8, sm: 16 } }}>
      <Box sx={{ width: { sm: '100%', md: '60%' } }}>
        <Typography
          component="h2"
          variant="h4"
          gutterBottom
          sx={{ color: 'text.primary', fontWeight: 700 }}
        >
          What is Congress?
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}
        >
          Congress is the legislative branch of the federal government, made up
          of two chambers: the House of Representatives and the Senate. Both
          must agree on identical legislation before it can become law.
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
          mb: { xs: 4, sm: 6 },
        }}
      >
        {chambers.map((chamber) => (
          <Card key={chamber.name} variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography
              variant="h6"
              sx={{ color: 'text.primary', fontWeight: 700, mb: 0.5 }}
            >
              {chamber.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'primary.main', fontWeight: 600, mb: 1.5 }}
            >
              {chamber.seats}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Term:{' '}
              </Box>
              {chamber.term}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Represents:{' '}
              </Box>
              {chamber.represents}
            </Typography>
            <Box
              component="ul"
              sx={{ m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}
            >
              {chamber.powers.map((power) => (
                <Typography
                  key={power}
                  component="li"
                  variant="body2"
                  sx={{ color: 'text.secondary' }}
                >
                  {power}
                </Typography>
              ))}
            </Box>
          </Card>
        ))}
      </Box>
      <Box sx={{ width: { sm: '100%', md: '60%' } }}>
        <Typography
          component="h2"
          variant="h4"
          gutterBottom
          sx={{ color: 'text.primary', fontWeight: 700 }}
        >
          How a bill becomes a law
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}
        >
          Every bill Congress passes moves through the same six-step path, from
          introduction to the president's desk. Click through each stage to see
          where a bill can stall, change, or move forward.
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row-reverse' },
          gap: 2,
        }}
      >
        <div>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              flexDirection: 'column',
              gap: 2,
              height: '100%',
            }}
          >
            {steps.map(({ icon, stage, title, description }, index) => (
              <Box
                key={index}
                component={Button}
                onClick={() => handleStepClick(index)}
                sx={[
                  (theme) => ({
                    p: 2,
                    height: '100%',
                    width: '100%',
                    '&:hover': {
                      backgroundColor: (theme.vars || theme).palette.action.hover,
                    },
                  }),
                  selectedStepIndex === index && {
                    backgroundColor: 'action.selected',
                  },
                ]}
              >
                <Box
                  sx={[
                    {
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'left',
                      gap: 0.5,
                      textAlign: 'left',
                      textTransform: 'none',
                      color: 'text.secondary',
                    },
                    selectedStepIndex === index && {
                      color: 'text.primary',
                    },
                  ]}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      direction: 'row',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    {icon}
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, letterSpacing: 1 }}
                    >
                      {stage.toUpperCase()}
                    </Typography>
                  </Box>
                  <Typography variant="h6">{title}</Typography>
                  <Typography variant="body2">{description}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <MobileLayout
            selectedStepIndex={selectedStepIndex}
            handleStepClick={handleStepClick}
            selectedStep={selectedStep}
          />
        </div>
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            width: { xs: '100%', md: '70%' },
          }}
        >
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              width: '100%',
              display: { xs: 'none', sm: 'flex' },
              minHeight: 500,
            }}
          >
            <Box sx={{ width: '100%', height: '100%' }}>
              <StepVisual
                index={selectedStepIndex}
                icon={selectedStep.icon}
                stage={selectedStep.stage}
              />
            </Box>
          </Card>
        </Box>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Card variant="outlined" sx={{ p: 2.5 }}>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', fontStyle: 'italic', lineHeight: 1.6 }}
          >
            {selectedStep.detail}
          </Typography>
        </Card>
      </Box>
    </Container>
  );
}