"use client";

import * as React from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import LinearProgress from "@mui/material/LinearProgress";
import Fade from "@mui/material/Fade";
import Grow from "@mui/material/Grow";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";

// ---- Election data (2026 midterms, as of mid-2026) ----
// "up" = seat is being contested this cycle (outcome unknown -> gray)
// "notUp" = seat's current holder is not up for reelection (colored by party)
const ELECTION_DATE = new Date("2026-11-03T00:00:00");

const CHAMBER_DATA = {
  senate: {
    label: "Senate",
    totalSeats: 100,
    seatsUp: 35,
    majorityNeeded: 51,
    up: { republican: 22, democrat: 13, independent: 0 },
    notUp: { republican: 31, democrat: 32, independent: 2 },
    totals: { republican: 53, democrat: 45, independent: 2 },
    flipNote: "Democrats need a net gain of 4 seats to win the majority",
  },
  house: {
    label: "House",
    totalSeats: 435,
    seatsUp: 435,
    majorityNeeded: 218,
    up: { republican: 220, democrat: 215, independent: 0 },
    notUp: { republican: 0, democrat: 0, independent: 0 },
    totals: { republican: 220, democrat: 215, independent: 0 },
    flipNote: "Democrats need a net gain of 3 seats to win the majority",
  },
} as const;

type ChamberKey = keyof typeof CHAMBER_DATA;
type SeatColorKey = "republican" | "democrat" | "independent" | "contested";

// Resolves actual palette colors from the live theme instead of
// `var(--mui-palette-*)`, which only exists under CssVarsProvider setups.
function useSeatColors(): Record<SeatColorKey, string> {
  const theme = useTheme();
  return React.useMemo(
    () => ({
      republican: theme.palette.error.main,
      democrat: theme.palette.info.main,
      independent: theme.palette.success.main,
      contested: theme.palette.grey[700],
    }),
    [theme],
  );
}

const LEGEND_ITEMS: { key: SeatColorKey; label: string }[] = [
  { key: "contested", label: "Up for election" },
  { key: "democrat", label: "Democrat (not up)" },
  { key: "republican", label: "Republican (not up)" },
  { key: "independent", label: "Independent (not up)" },
];

function buildSeatColors(chamber: ChamberKey): SeatColorKey[] {
  const d = CHAMBER_DATA[chamber];
  const segments: { count: number; color: SeatColorKey }[] = [
    { count: d.notUp.independent, color: "independent" },
    { count: d.notUp.democrat, color: "democrat" },
    {
      count: d.up.democrat + d.up.republican + d.up.independent,
      color: "contested",
    },
    { count: d.notUp.republican, color: "republican" },
  ];
  const colors: SeatColorKey[] = [];
  segments.forEach((seg) => {
    for (let i = 0; i < seg.count; i++) colors.push(seg.color);
  });
  return colors;
}

function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  React.useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
      const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
      const minutes = Math.max(0, Math.floor((diff / (1000 * 60)) % 60));
      setTimeLeft({ days, hours, minutes });
    };
    tick();
    const id = setInterval(tick, 60 * 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}

// Lays out `total` points across a semicircle in concentric arcs so seat
// density stays roughly constant, ordered left-to-right for coloring.
// innerR is kept large enough that the center stays clear for a label below.
function useSeatLayout(total: number) {
  return React.useMemo(() => {
    const rows = Math.max(5, Math.min(9, Math.round(Math.sqrt(total / 3))));
    const innerR = 40;
    const outerR = 128;
    const rowRadii = Array.from(
      { length: rows },
      (_, i) => innerR + (i * (outerR - innerR)) / Math.max(1, rows - 1),
    );
    const totalRadius = rowRadii.reduce((a, b) => a + b, 0);
    const seatsPerRow = rowRadii.map((r) =>
      Math.max(1, Math.round((total * r) / totalRadius)),
    );

    let diff = total - seatsPerRow.reduce((a, b) => a + b, 0);
    let idx = seatsPerRow.length - 1;
    while (diff !== 0) {
      if (diff > 0) {
        seatsPerRow[idx]++;
        diff--;
      } else if (seatsPerRow[idx] > 1) {
        seatsPerRow[idx]--;
        diff++;
      }
      idx = idx > 0 ? idx - 1 : seatsPerRow.length - 1;
    }

    const points: { x: number; y: number; angle: number }[] = [];
    rowRadii.forEach((r, i) => {
      const n = seatsPerRow[i];
      for (let j = 0; j < n; j++) {
        const t = n === 1 ? 0.5 : j / (n - 1);
        const angleDeg = 180 - t * 180;
        const angleRad = (angleDeg * Math.PI) / 180;
        points.push({
          x: 150 + r * Math.cos(angleRad),
          y: 138 - r * Math.sin(angleRad),
          angle: angleDeg,
        });
      }
    });

    return points.sort((a, b) => b.angle - a.angle);
  }, [total]);
}

function SeatSemicircle({ chamber }: { chamber: ChamberKey }) {
  const seatColors = useSeatColors();
  const data = CHAMBER_DATA[chamber];
  const points = useSeatLayout(data.totalSeats);
  const colors = React.useMemo(() => buildSeatColors(chamber), [chamber]);
  const dotRadius = data.totalSeats > 200 ? 2.6 : 4.2;

  return (
    <Box
      component="svg"
      viewBox="0 0 300 148"
      sx={{ width: "100%", maxWidth: 340, height: "auto" }}
    >
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={dotRadius}
          fill={seatColors[colors[i] ?? "contested"]}
          style={{ transition: "fill 0.4s ease" }}
        />
      ))}
    </Box>
  );
}

function MajorityLabel({ chamber }: { chamber: ChamberKey }) {
  const data = CHAMBER_DATA[chamber];
  return (
    <Stack
      spacing={0.5}
      sx={{
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "center",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Majority
      </Typography>
      <Typography
        variant="h6"
        color="text.primary"
        sx={{ fontWeight: 700, lineHeight: 1 }}
      >
        {data.majorityNeeded}
      </Typography>
    </Stack>
  );
}

function SeatLegend() {
  const seatColors = useSeatColors();
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        columnGap: 2.5,
        rowGap: 1,
      }}
    >
      {LEGEND_ITEMS.map((item) => (
        <Box
          key={item.key}
          sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: seatColors[item.key],
              flexShrink: 0,
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ whiteSpace: "nowrap" }}
          >
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function PartyBadge({
  name,
  seats,
  colorKey,
  align,
}: {
  name: string;
  seats: number;
  colorKey: SeatColorKey;
  align: "left" | "right";
}) {
  const seatColors = useSeatColors();
  return (
    <Stack
      spacing={0.25}
      sx={{ alignItems: align === "left" ? "flex-start" : "flex-end" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          flexDirection: align === "left" ? "row" : "row-reverse",
        }}
      >
        <Box
          sx={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            bgcolor: seatColors[colorKey],
            flexShrink: 0,
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {name}
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
        {seats}
      </Typography>
    </Stack>
  );
}

function ElectionDashboard() {
  const [loading, setLoading] = React.useState(true);
  const [chamber, setChamber] = React.useState<ChamberKey>("senate");
  const countdown = useCountdown(ELECTION_DATE);

  React.useEffect(() => {
    const id = setTimeout(() => setLoading(false), 1300);
    return () => clearTimeout(id);
  }, []);

  const data = CHAMBER_DATA[chamber];

  return (
    <Paper
      variant="outlined"
      sx={{
        width: "100%",
        maxWidth: 480,
        borderRadius: 4,
        p: { xs: 2.5, sm: 3.5 },
        minHeight: 420,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Loading state */}
      <Fade in={loading} unmountOnExit timeout={{ exit: 400 }}>
        <Stack spacing={2} sx={{ py: 4 }}>
          <Typography variant="overline" color="text.secondary">
            Fetching live congressional data…
          </Typography>
          {[220, 160, 190].map((w, i) => (
            <Box
              key={i}
              sx={{
                height: 14,
                width: w,
                borderRadius: 1,
                bgcolor: "grey.200",
                animation: "pulse 1.1s ease-in-out infinite",
                animationDelay: `${i * 0.15}s`,
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 0.4 },
                  "50%": { opacity: 1 },
                },
              }}
            />
          ))}
          <LinearProgress sx={{ borderRadius: 1, mt: 2 }} />
        </Stack>
      </Fade>

      {/* Loaded dashboard */}
      <Grow in={!loading} timeout={500}>
        <Stack spacing={2} sx={{ display: loading ? "none" : "flex" }}>
          <Stack
            sx={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              rowGap: 1,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              <Box component="span" sx={{ color: "error.main" }}>
                Upcoming:
              </Box>{" "}
              2026 Midterm Election
            </Typography>
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={`${countdown.days}d ${countdown.hours}h ${countdown.minutes}m to Election Day (November 3rd)`}
            />
          </Stack>

          <ToggleButtonGroup
            value={chamber}
            exclusive
            size="small"
            onChange={(_, val) => val && setChamber(val)}
            sx={{ alignSelf: "center" }}
          >
            <ToggleButton value="senate">Senate</ToggleButton>
            <ToggleButton value="house">House</ToggleButton>
          </ToggleButtonGroup>

          <Stack sx={{ alignItems: "center" }}>
            <Stack
              sx={{
                flexDirection: "row",
                width: "100%",
                maxWidth: 340,
                justifyContent: "space-between",
                px: 1,
              }}
            >
              <PartyBadge
                name="Democrat"
                seats={data.totals.democrat}
                colorKey="democrat"
                align="left"
              />
              <PartyBadge
                name="Republican"
                seats={data.totals.republican}
                colorKey="republican"
                align="right"
              />
            </Stack>
            <SeatSemicircle chamber={chamber} />
            <MajorityLabel chamber={chamber} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {data.seatsUp} of {data.totalSeats} seats up for election
            </Typography>
          </Stack>

          <SeatLegend />

          <Box
            sx={{
              pt: 1,
              borderTop: "1px solid",
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {data.flipNote}
            </Typography>
          </Box>
        </Stack>
      </Grow>
    </Paper>
  );
}

export default function Hero() {
  return (
    <Box
      id="hero"
      sx={(theme) => ({
        width: "100%",
        backgroundRepeat: "no-repeat",
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)",
        ...theme.applyStyles("dark", {
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)",
        }),
      })}
    >
      <Container
        sx={{
          pt: { xs: 14, sm: 20 },
          pb: { xs: 8, sm: 12 },
        }}
      >
        <Stack
          spacing={{ xs: 6, md: 4 }}
          sx={{
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
          }}
        >
          {/* Left column: title + CTA */}
          <Stack
            spacing={2}
            useFlexGap
            sx={{
              alignItems: { xs: "center", md: "flex-start" },
              width: { xs: "100%", md: "50%" },
            }}
          >
            <Typography
              variant="h1"
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "center", md: "flex-start" },
                textAlign: { xs: "center", md: "left" },
                fontSize: "clamp(3rem, 8vw, 3.5rem)",
              }}
            >
              The&nbsp;Lazy&nbsp;
              <Typography
                component="span"
                variant="h1"
                sx={(theme) => ({
                  fontSize: "inherit",
                  color: "primary.main",
                  ...theme.applyStyles("dark", {
                    color: "primary.light",
                  }),
                })}
              >
                Voter
              </Typography>
            </Typography>

            <Typography
              variant="h6"
              sx={{
                textAlign: { xs: "center", md: "left" },
                color: "text.secondary",
                width: "100%",
              }}
            >
              FEDERAL CIVIC DATA, MADE SIMPLE
            </Typography>

            <Button
              component={NextLink}
              href="/dashboard"
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 2 }}
            >
              Search Candidates
            </Button>
          </Stack>

          {/* Right column: interactive dashboard */}
          <Box
            sx={{
              width: { xs: "100%", md: "50%" },
              display: "flex",
              justifyContent: "center",
            }}
          >
            <ElectionDashboard />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}