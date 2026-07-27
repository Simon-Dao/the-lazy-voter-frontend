const { Client } = require('pg');

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

exports.handler = async (event) => {
  const q = event.queryStringParameters?.q;

  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing search query parameter "q"' }),
    };
  }

  const client = await getClient();
  try {
    const people = await client.query(
      `SELECT * FROM the_lazy_voter_serving.unified_politician_record r 
        WHERE r.name ILIKE $1 LIMIT 5`,
      [`%${q}%`],
    );

    // Map each legiscan_id / fec_id back to the person it belongs to,
    // so we can attribute term/election rows to the right person later.
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
          `SELECT fec_id, office_full AS role, party_full AS party, state,
                  election_years -> (jsonb_array_length(election_years) - 1) AS latest_election_year
           FROM the_lazy_voter_serving.fec_candidate
           WHERE fec_id = ANY($1)`,
          [fecIds],
        )
      : { rows: [] };

    // legiscan_people.district is packed as "XX-SS-DD" — chamber code,
    // two-letter state, and district number, e.g. "HCA-12" or "S-NY-00".
    // Split on "-" and pull the middle segment out as the state.
    function parseLegiscanDistrict(district) {
      if (!district) return { state: null, districtNumber: null };
      const parts = district.split('-');
      return {
        state: parts[1] ?? null,
        districtNumber: parts[2] ?? null,
      };
    }

    // Track the latest date, plus the role/district/party/state associated
    // with that date, per person
    const personLatestInfo = new Map();

    function updateLatest(person, date, info) {
      if (!person || !date || isNaN(date.getTime())) return;
      const existing = personLatestInfo.get(person);
      if (!existing || date > existing.date) {
        personLatestInfo.set(person, { date, ...info });
      }
    }

    legiscanTerms.rows.forEach((row) => {
      const person = idToPerson.get(row.people_id);
      if (row.term_end_date) {
        const endDate = new Date(row.term_end_date);
        let electionYear = endDate.getFullYear();
        // Terms end in January of the year AFTER the election (e.g. a term
        // ending Jan 2027 was decided by the Nov 2026 election). Elections
        // only happen in even years, so if the end-date year is odd, the
        // actual election year is one less.
        if (electionYear % 2 !== 0) {
          electionYear -= 1;
        }
        const { state, districtNumber } = parseLegiscanDistrict(row.district);
        updateLatest(
          person,
          new Date(`${electionYear}-01-01`),
          { role: row.role, district: districtNumber, party: row.party, state },
        );
      }
    });

    fecTerms.rows.forEach((row) => {
      const person = idToPerson.get(row.fec_id);
      if (row.latest_election_year) {
        updateLatest(
          person,
          new Date(`${row.latest_election_year}-01-01`),
          { role: row.role, party: row.party, state: row.state },
        );
      }
    });

    // Attach latestYear, role, district, party, and state onto each person.
    // party/state fall back to the person's own general record if the
    // latest term/candidacy row didn't carry them.
    const result = people.rows.map((person) => {
      const latestInfo = personLatestInfo.get(person);
      return {
        u_id: person.u_id,
        name: person.name,
        latestYear: latestInfo ? latestInfo.date.getFullYear() : null,
        role: latestInfo?.role ?? null,
        party: latestInfo?.party ?? person.party ?? null,
        state: latestInfo?.state ?? person.state ?? null,
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
      body: JSON.stringify({ message: 'Search failed' }),
    };
  } finally {
    await client.end();
  }
};