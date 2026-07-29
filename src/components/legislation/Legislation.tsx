"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  Grow,
  Chip,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Collapse,
  Pagination,
  Grid,
  type SelectChangeEvent,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import { useTheme } from "@mui/material/styles";

// ---- Types ----
type BillStatus =
  | "Introduced"
  | "Passed Committee"
  | "Passed House"
  | "Passed Senate"
  | "Signed into Law"
  | "Vetoed"
  | "Failed";

type Chamber = "House" | "Senate";

interface RollCall {
  chamber: Chamber;
  date: string;
  question: string;
  result: "Passed" | "Failed";
  yea: number;
  nay: number;
  present: number;
  notVoting: number;
}

interface Bill {
  id: string;
  billNumber: string;
  title: string;
  category: string;
  status: BillStatus;
  chamber: Chamber;
  sponsor: string;
  dateIntroduced: string; // ISO date
  summary: string;
  rollCalls: RollCall[];
}

// ---- Mock data ----
const bills: Bill[] = [
  {
    id: "b1",
    billNumber: "S. 1042",
    title: "Rural Broadband Expansion Act",
    category: "Technology",
    status: "Passed Senate",
    chamber: "Senate",
    sponsor: "Sen. Jordan Ellis",
    dateIntroduced: "2026-02-11",
    summary:
      "Expands federal grant funding for broadband infrastructure in underserved rural counties.",
    rollCalls: [
      {
        chamber: "Senate",
        date: "2026-05-14",
        question: "On Passage of the Bill",
        result: "Passed",
        yea: 71,
        nay: 27,
        present: 0,
        notVoting: 2,
      },
    ],
  },
  {
    id: "b2",
    billNumber: "S. 887",
    title: "Veterans Mental Health Funding Act",
    category: "Veterans Affairs",
    status: "Signed into Law",
    chamber: "Senate",
    sponsor: "Sen. Jordan Ellis",
    dateIntroduced: "2025-09-03",
    summary:
      "Increases funding for VA mental health services and expands telehealth access for veterans in rural areas.",
    rollCalls: [
      {
        chamber: "Senate",
        date: "2025-11-19",
        question: "On Passage of the Bill",
        result: "Passed",
        yea: 88,
        nay: 9,
        present: 0,
        notVoting: 3,
      },
      {
        chamber: "House",
        date: "2025-12-02",
        question: "On Passage of the Bill",
        result: "Passed",
        yea: 312,
        nay: 98,
        present: 1,
        notVoting: 24,
      },
    ],
  },
  {
    id: "b3",
    billNumber: "S. 2210",
    title: "Climate Resilient Infrastructure Act",
    category: "Climate Policy",
    status: "Passed Committee",
    chamber: "Senate",
    sponsor: "Sen. Jordan Ellis",
    dateIntroduced: "2026-01-22",
    summary:
      "Directs federal infrastructure funds toward flood mitigation, wildfire prevention, and grid resilience projects.",
    rollCalls: [
      {
        chamber: "Senate",
        date: "2026-03-05",
        question: "Committee Vote to Report Favorably",
        result: "Passed",
        yea: 14,
        nay: 8,
        present: 0,
        notVoting: 0,
      },
    ],
  },
  {
    id: "b4",
    billNumber: "H.R. 3390",
    title: "Prescription Drug Price Transparency Act",
    category: "Healthcare",
    status: "Failed",
    chamber: "House",
    sponsor: "Rep. Marcus Webb",
    dateIntroduced: "2025-06-17",
    summary:
      "Would have required pharmaceutical manufacturers to disclose pricing methodology for drugs exceeding $500 per course of treatment.",
    rollCalls: [
      {
        chamber: "House",
        date: "2025-08-21",
        question: "On Passage of the Bill",
        result: "Failed",
        yea: 198,
        nay: 224,
        present: 0,
        notVoting: 13,
      },
    ],
  },
  {
    id: "b5",
    billNumber: "S. 1567",
    title: "Small Business Tax Simplification Act",
    category: "Tax Reform",
    status: "Introduced",
    chamber: "Senate",
    sponsor: "Sen. Priya Nair",
    dateIntroduced: "2026-04-08",
    summary:
      "Simplifies quarterly filing requirements for businesses with fewer than 50 employees.",
    rollCalls: [],
  },
  {
    id: "b6",
    billNumber: "H.R. 2884",
    title: "AI Research Security Act",
    category: "Technology",
    status: "Passed House",
    chamber: "House",
    sponsor: "Rep. David Kim",
    dateIntroduced: "2025-11-30",
    summary:
      "Establishes federal security review requirements for AI models trained on sensitive government data.",
    rollCalls: [
      {
        chamber: "House",
        date: "2026-01-16",
        question: "On Passage of the Bill",
        result: "Passed",
        yea: 289,
        nay: 121,
        present: 0,
        notVoting: 25,
      },
    ],
  },
  {
    id: "b7",
    billNumber: "S. 944",
    title: "Clean Energy Manufacturing Incentives Act",
    category: "Climate Policy",
    status: "Vetoed",
    chamber: "Senate",
    sponsor: "Sen. Jordan Ellis",
    dateIntroduced: "2025-04-02",
    summary:
      "Extended tax credits for domestic solar and battery manufacturing; vetoed over cost concerns.",
    rollCalls: [
      {
        chamber: "Senate",
        date: "2025-06-11",
        question: "On Passage of the Bill",
        result: "Passed",
        yea: 62,
        nay: 36,
        present: 0,
        notVoting: 2,
      },
      {
        chamber: "House",
        date: "2025-07-02",
        question: "On Passage of the Bill",
        result: "Passed",
        yea: 244,
        nay: 178,
        present: 0,
        notVoting: 11,
      },
    ],
  },
  {
    id: "b8",
    billNumber: "H.R. 1102",
    title: "Border Processing Modernization Act",
    category: "Immigration",
    status: "Passed House",
    chamber: "House",
    sponsor: "Rep. Alicia Torres",
    dateIntroduced: "2026-01-09",
    summary:
      "Funds technology upgrades at ports of entry to reduce asylum case processing times.",
    rollCalls: [
      {
        chamber: "House",
        date: "2026-02-27",
        question: "On Passage of the Bill",
        result: "Passed",
        yea: 231,
        nay: 190,
        present: 0,
        notVoting: 12,
      },
    ],
  },
  {
    id: "b9",
    billNumber: "S. 1780",
    title: "Federal Student Loan Interest Reduction Act",
    category: "Education",
    status: "Introduced",
    chamber: "Senate",
    sponsor: "Sen. Jordan Ellis",
    dateIntroduced: "2026-05-01",
    summary:
      "Caps interest rates on new federal student loans at 3.5% for undergraduate borrowers.",
    rollCalls: [],
  },
  {
    id: "b10",
    billNumber: "H.R. 4021",
    title: "Community Bank Capital Relief Act",
    category: "Finance",
    status: "Passed Committee",
    chamber: "House",
    sponsor: "Rep. Marcus Webb",
    dateIntroduced: "2025-10-14",
    summary:
      "Reduces capital reserve requirements for community banks with under $2B in assets.",
    rollCalls: [
      {
        chamber: "House",
        date: "2025-12-18",
        question: "Committee Vote to Report Favorably",
        result: "Passed",
        yea: 31,
        nay: 22,
        present: 0,
        notVoting: 0,
      },
    ],
  },
  {
    id: "b11",
    billNumber: "S. 2103",
    title: "Wildfire Response Coordination Act",
    category: "Climate Policy",
    status: "Signed into Law",
    chamber: "Senate",
    sponsor: "Sen. Priya Nair",
    dateIntroduced: "2025-03-19",
    summary:
      "Creates a joint federal-state task force for wildfire response resource sharing.",
    rollCalls: [
      {
        chamber: "Senate",
        date: "2025-05-08",
        question: "On Passage of the Bill",
        result: "Passed",
        yea: 94,
        nay: 4,
        present: 0,
        notVoting: 2,
      },
      {
        chamber: "House",
        date: "2025-05-29",
        question: "On Passage of the Bill",
        result: "Passed",
        yea: 401,
        nay: 15,
        present: 0,
        notVoting: 17,
      },
    ],
  },
  {
    id: "b12",
    billNumber: "H.R. 3675",
    title: "Veterans Housing Access Act",
    category: "Veterans Affairs",
    status: "Passed House",
    chamber: "House",
    sponsor: "Rep. David Kim",
    dateIntroduced: "2025-07-25",
    summary:
      "Expands VA-backed housing loan eligibility for veterans discharged after 2001.",
    rollCalls: [
      {
        chamber: "House",
        date: "2025-09-16",
        question: "On Passage of the Bill",
        result: "Passed",
        yea: 356,
        nay: 62,
        present: 0,
        notVoting: 15,
      },
    ],
  },
];

const categories = Array.from(new Set(bills.map((b) => b.category))).sort();
const statuses: BillStatus[] = [
  "Introduced",
  "Passed Committee",
  "Passed House",
  "Passed Senate",
  "Signed into Law",
  "Vetoed",
  "Failed",
];

type SortOption =
  | "date-newest"
  | "date-oldest"
  | "category"
  | "bill-number";

const ITEMS_PER_PAGE = 6;

// ---- Helpers ----
function getStatusColor(
  status: BillStatus,
): "success" | "info" | "warning" | "error" | "default" {
  switch (status) {
    case "Signed into Law":
      return "success";
    case "Passed House":
    case "Passed Senate":
    case "Passed Committee":
      return "info";
    case "Introduced":
      return "default";
    case "Vetoed":
    case "Failed":
      return "error";
    default:
      return "default";
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---- Roll call bar ----
function RollCallBar({ rollCall }: { rollCall: RollCall }) {
  const theme = useTheme();
  const total =
    rollCall.yea + rollCall.nay + rollCall.present + rollCall.notVoting;

  const segments = [
    { label: "Yea", value: rollCall.yea, color: theme.palette.success.main },
    { label: "Nay", value: rollCall.nay, color: theme.palette.error.main },
    {
      label: "Present",
      value: rollCall.present,
      color: theme.palette.warning.main,
    },
    {
      label: "Not voting",
      value: rollCall.notVoting,
      color: theme.palette.grey[500],
    },
  ];

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", mb: 0.5 }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {rollCall.chamber} · {rollCall.question}
        </Typography>
        <Chip
          label={rollCall.result}
          size="small"
          color={rollCall.result === "Passed" ? "success" : "error"}
        />
      </Stack>
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", display: "block", mb: 0.75 }}
      >
        {formatDate(rollCall.date)}
      </Typography>
      <Stack
        direction="row"
        sx={{
          width: "100%",
          height: 8,
          borderRadius: 4,
          overflow: "hidden",
          mb: 0.75,
        }}
      >
        {segments.map(
          (seg) =>
            seg.value > 0 && (
              <Box
                key={seg.label}
                sx={{
                  width: `${(seg.value / total) * 100}%`,
                  bgcolor: seg.color,
                }}
              />
            ),
        )}
      </Stack>
      <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
        {segments.map((seg) => (
          <Stack
            key={seg.label}
            direction="row"
            spacing={0.5}
            sx={{ alignItems: "center" }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: seg.color,
              }}
            />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {seg.label}: {seg.value}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

// ---- Bill card ----
function BillCard({ bill }: { bill: Bill }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 2,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontWeight: 600 }}
              >
                {bill.billNumber}
              </Typography>
              <Chip label={bill.category} size="small" variant="outlined" />
              <Chip
                label={bill.status}
                size="small"
                color={getStatusColor(bill.status)}
              />
            </Stack>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {bill.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 0.5 }}
            >
              {bill.summary}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Sponsor: {bill.sponsor}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Introduced {formatDate(bill.dateIntroduced)}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {bill.chamber}
              </Typography>
            </Stack>
          </Box>

          <IconButton
            onClick={() => setExpanded((e) => !e)}
            disabled={bill.rollCalls.length === 0}
            size="small"
            sx={{
              transform: expanded ? "rotate(180deg)" : "none",
              transition: "transform 0.2s ease",
              flexShrink: 0,
            }}
            aria-label={expanded ? "Collapse roll calls" : "Expand roll calls"}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Stack>

        <Collapse in={expanded} timeout={200}>
          <Divider sx={{ my: 1.5 }} />
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, mb: 1.5 }}
          >
            Roll call votes ({bill.rollCalls.length})
          </Typography>
          <Stack spacing={2}>
            {bill.rollCalls.map((rc, i) => (
              <RollCallBar key={i} rollCall={rc} />
            ))}
          </Stack>
        </Collapse>

        {bill.rollCalls.length === 0 && (
          <Typography
            variant="caption"
            sx={{ color: "text.disabled", display: "block", mt: 1 }}
          >
            No roll call votes yet
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// ---- Page ----
export default function Legislation() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [chamber, setChamber] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("date-newest");
  const [page, setPage] = useState(1);

  const filteredBills = useMemo(() => {
    let result = bills.filter((bill) => {
      const matchesSearch =
        search.trim() === "" ||
        bill.title.toLowerCase().includes(search.toLowerCase()) ||
        bill.billNumber.toLowerCase().includes(search.toLowerCase()) ||
        bill.sponsor.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || bill.category === category;
      const matchesStatus = status === "all" || bill.status === status;
      const matchesChamber = chamber === "all" || bill.chamber === chamber;
      return (
        matchesSearch && matchesCategory && matchesStatus && matchesChamber
      );
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "date-newest":
          return (
            new Date(b.dateIntroduced).getTime() -
            new Date(a.dateIntroduced).getTime()
          );
        case "date-oldest":
          return (
            new Date(a.dateIntroduced).getTime() -
            new Date(b.dateIntroduced).getTime()
          );
        case "category":
          return a.category.localeCompare(b.category);
        case "bill-number":
          return a.billNumber.localeCompare(b.billNumber);
        default:
          return 0;
      }
    });

    return result;
  }, [search, category, status, chamber, sort]);

  const pageCount = Math.max(
    1,
    Math.ceil(filteredBills.length / ITEMS_PER_PAGE),
  );
  const paginatedBills = filteredBills.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleFilterChange =
    (setter: (v: string) => void) => (e: SelectChangeEvent) => {
      setter(e.target.value);
      setPage(1);
    };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: { sm: "100%", md: "1700px" },
        pt: { xs: "40px", md: "100px" },
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        Legislation
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
        Search and track bills, their status, and how each chamber voted.
      </Typography>

      {/* Controls */}
      <Grow in timeout={400}>
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by title, bill number, or sponsor"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    label="Category"
                    value={category}
                    onChange={handleFilterChange(setCategory)}
                  >
                    <MenuItem value="all">All categories</MenuItem>
                    {categories.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    value={status}
                    onChange={handleFilterChange(setStatus)}
                  >
                    <MenuItem value="all">All statuses</MenuItem>
                    {statuses.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Chamber</InputLabel>
                  <Select
                    label="Chamber"
                    value={chamber}
                    onChange={handleFilterChange(setChamber)}
                  >
                    <MenuItem value="all">Both chambers</MenuItem>
                    <MenuItem value="House">House</MenuItem>
                    <MenuItem value="Senate">Senate</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort by</InputLabel>
                  <Select
                    label="Sort by"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                  >
                    <MenuItem value="date-newest">Newest first</MenuItem>
                    <MenuItem value="date-oldest">Oldest first</MenuItem>
                    <MenuItem value="category">Category (A-Z)</MenuItem>
                    <MenuItem value="bill-number">Bill number</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grow>

      <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
        {filteredBills.length} bill{filteredBills.length !== 1 ? "s" : ""} found
      </Typography>

      {/* Results */}
      <Stack spacing={2}>
        {paginatedBills.map((bill, i) => (
          <Grow in timeout={400} style={{ transitionDelay: `${i * 50}ms` }} key={bill.id}>
            <div>
              <BillCard bill={bill} />
            </div>
          </Grow>
        ))}
        {filteredBills.length === 0 && (
          <Card variant="outlined">
            <CardContent>
              <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
                No bills match your filters. Try adjusting your search.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>

      {/* Pagination */}
      {pageCount > 1 && (
        <Stack sx={{ alignItems: "center", mt: 3 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Stack>
      )}
    </Box>
  );
}