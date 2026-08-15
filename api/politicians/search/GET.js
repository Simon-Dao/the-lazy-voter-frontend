const { Client } = require("pg");

async function getClient() {
  const client = new Client({
    host: process.env.PGHOST,
    port: 5432,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: { rejectUnauthorized: true },
  });
  await client.connect();
  return client;
}

const STATE_MAP = new Map([
  ["AL", "Alabama"],
  ["AK", "Alaska"],
  ["AZ", "Arizona"],
  ["AR", "Arkansas"],
  ["CA", "California"],
  ["CO", "Colorado"],
  ["CT", "Connecticut"],
  ["DE", "Delaware"],
  ["FL", "Florida"],
  ["GA", "Georgia"],
  ["HI", "Hawaii"],
  ["ID", "Idaho"],
  ["IL", "Illinois"],
  ["IN", "Indiana"],
  ["IA", "Iowa"],
  ["KS", "Kansas"],
  ["KY", "Kentucky"],
  ["LA", "Louisiana"],
  ["ME", "Maine"],
  ["MD", "Maryland"],
  ["MA", "Massachusetts"],
  ["MI", "Michigan"],
  ["MN", "Minnesota"],
  ["MS", "Mississippi"],
  ["MO", "Missouri"],
  ["MT", "Montana"],
  ["NE", "Nebraska"],
  ["NV", "Nevada"],
  ["NH", "New Hampshire"],
  ["NJ", "New Jersey"],
  ["NM", "New Mexico"],
  ["NY", "New York"],
  ["NC", "North Carolina"],
  ["ND", "North Dakota"],
  ["OH", "Ohio"],
  ["OK", "Oklahoma"],
  ["OR", "Oregon"],
  ["PA", "Pennsylvania"],
  ["RI", "Rhode Island"],
  ["SC", "South Carolina"],
  ["SD", "South Dakota"],
  ["TN", "Tennessee"],
  ["TX", "Texas"],
  ["UT", "Utah"],
  ["VT", "Vermont"],
  ["VA", "Virginia"],
  ["WA", "Washington"],
  ["WV", "West Virginia"],
  ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
]);

exports.handler = async (event) => {
  const q = event.queryStringParameters?.q;
  const CURRENT_YEAR = new Date().getFullYear();
  const CURRENT_ELECTION_YEAR =
    CURRENT_YEAR % 2 == 1 ? CURRENT_YEAR - 1 : CURRENT_YEAR;

  if (!q || typeof q !== "string" || q.trim().length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing search query parameter "q"' }),
    };
  }

  const client = await getClient();
  try {
    // Split into tokens and require each one to appear somewhere in the
    // name, in any order — handles "First Last" vs "Last, First" storage
    // mismatches without needing an exact substring match.
    const tokens = q.trim().split(/\s+/).filter(Boolean);
    const nameConditions = tokens.map((_, i) => `r.name ILIKE $${i + 1}`).join(" AND ");
    const tokenParams = tokens.map((t) => `%${t}%`);

    const people = await client.query(
      `SELECT * FROM the_lazy_voter_serving.unified_politician_record r 
        WHERE ${nameConditions} LIMIT 5`,
      tokenParams,
    );

    const idToPerson = new Map();
    people.rows.forEach((person) => {
      (person.legiscan_ids ?? []).forEach((id) => {
        if (id != null) idToPerson.set(id, person);
      });
      (person.fec_ids ?? []).forEach((id) => {
        if (id != null) idToPerson.set(id, person);
      });
    });

    const legiscanIds = people.rows
      .flatMap((p) => p.legiscan_ids ?? [])
      .filter((id) => id != null);

    const fecIds = people.rows
      .flatMap((p) => p.fec_ids ?? [])
      .filter((id) => id != null);

    const legiscanTerms = legiscanIds.length
      ? await client.query(
          `SELECT h.people_id, MAX(h.term_end_date) AS term_end_date,
                  lp.role, lp.district, lp.party
           FROM the_lazy_voter_serving.legiscan_term_history h
           JOIN the_lazy_voter_serving.legiscan_people lp
             ON lp.people_id = h.people_id
           WHERE h.people_id = ANY($1)
           GROUP BY h.people_id, lp.role, lp.district, lp.party`,
          [legiscanIds],
        )
      : { rows: [] };

    const fecTerms = fecIds.length
      ? await client.query(
          `SELECT fec_id, office_full AS role, party_full AS party, state, incumbent_challenge, district_number as district,
                  election_years -> (jsonb_array_length(election_years) - 1) AS latest_election_year
           FROM the_lazy_voter_serving.fec_candidate
           WHERE fec_id = ANY($1)`,
          [fecIds],
        )
      : { rows: [] };

    function parseLegiscanDistrict(district) {
      if (!district) return { state: null, districtNumber: null };
      const parts = district.split("-");
      return {
        state: parts[1] ?? null,
        districtNumber: parts[2] ?? null,
      };
    }

    function formatOffice(state, district, role) {
      return [state, district, role].filter(Boolean).join(" ");
    }

    // Two separate "latest" trackers. FEC always wins over legiscan for a
    // given person, regardless of which has the more recent date — we only
    // use date comparison to pick among multiple rows *within* the same source.
    const legiscanLatestInfo = new Map();
    const fecLatestInfo = new Map();

    function updateLatest(map, person, date, info) {
      if (!person || !date || isNaN(date.getTime())) return;
      const existing = map.get(person);
      if (!existing || date >= existing.date) {
        map.set(person, { date, ...info });
      }
    }

    legiscanTerms.rows.forEach((row) => {
      const person = idToPerson.get(row.people_id);
      if (!person || !row.term_end_date) return;

      const endDate = new Date(row.term_end_date);
      let electionYear = endDate.getFullYear();
      if (electionYear % 2 !== 0) {
        electionYear -= 1;
      }
      const { state, districtNumber } = parseLegiscanDistrict(row.district);
      const role = row.role === "Rep" ? "House" : "Senate";
      const officeLabel = formatOffice(state, districtNumber, role);
      const isCurrentTerm = endDate.getTime() > Date.now();
      const status = isCurrentTerm
        ? `Serving as ${officeLabel}`
        : `Served as ${officeLabel} (term ended ${endDate.getFullYear()})`;

      updateLatest(legiscanLatestInfo, person, new Date(`${electionYear}-01-01`), {
        role,
        district: districtNumber,
        party: row.party == "I" ? "Independent" : row.party == "R" ? "Republican" : "Democrat",
        state,
        status,
      });
    });

    fecTerms.rows.forEach((row) => {
      const person = idToPerson.get(row.fec_id);
      if (!person || !row.latest_election_year) return;

      const IS_ELECTION_YEAR = CURRENT_YEAR === CURRENT_ELECTION_YEAR;
      const officeLabel = formatOffice(row.state, row.district, row.role);
      let status;

      if (IS_ELECTION_YEAR && row.latest_election_year === CURRENT_ELECTION_YEAR) {
        switch (row.incumbent_challenge) {
          case "I":
            status = `Running for ${officeLabel} re-election`;
            break;
          case "C":
            status = `Running for ${officeLabel}`;
            break;
          case "O":
            status = `Running for ${officeLabel} (open seat)`;
            break;
          default:
            status = `Running for ${officeLabel}`;
        }
      } else {
        status = `Ran for ${officeLabel} in ${row.latest_election_year}`;
      }

      updateLatest(fecLatestInfo, person, new Date(`${row.latest_election_year}-01-02`), {
        role: row.role,
        district: row.district,
        party: row.party,
        state: row.state,
        status,
      });
    });

    const result = people.rows.map((person) => {
      // FEC data overrides legiscan term data whenever present, regardless
      // of date recency.
      const latestInfo = fecLatestInfo.get(person) ?? legiscanLatestInfo.get(person);
      return {
        u_id: person.u_id,
        name: person.name,
        latestYear: latestInfo ? latestInfo.date.getFullYear() : null,
        role: latestInfo?.role ?? null,
        party: latestInfo?.party ?? person.party ?? null,
        state: latestInfo?.state ?? person.state ?? null,
        status: latestInfo?.status ?? null,
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ content: result }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Search failed" }),
    };
  } finally {
    await client.end();
  }
};