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

// legiscan district strings look like "HD-TN-3" or "S-NY-00" —
// chamber code, state, district number. Pull the last segment as the
// district number.
function parseLegiscanDistrictNumber(district) {
  if (!district) return null;
  const parts = district.split('-');
  return parts[parts.length - 1] || null;
}

function buildFecEvents(fecRows) {
  const events = [];
  fecRows.forEach((row) => {
    const office = row.office_full ?? row.office;
    const district = row.district_number ?? row.district;
    const location = [row.state, district].filter(Boolean).join('-');

    (row.election_years ?? []).forEach((year) => {
      const isLatestYear =
        year === row.election_years[row.election_years.length - 1];

      let label;
      if (isLatestYear && row.incumbent_challenge === 'I') {
        label = `Ran for re-election to ${office} (${location})`;
      } else {
        label = `Ran for ${office} (${location})`;
      }

      events.push({
        year: String(year),
        label,
        type: 'campaign',
      });
    });
  });
  return events;
}

function buildLegiscanEvents(legiscanRows) {
  const events = [];
  legiscanRows.forEach((row) => {
    const role = row.role === 'Rep' ? 'House' : row.role === 'Sen' ? 'Senate' : row.role;
    const districtNumber = parseLegiscanDistrictNumber(row.district);
    const location = [row.state, districtNumber].filter(Boolean).join('-');
    const startYear = row.term_start_date
      ? new Date(row.term_start_date).getFullYear()
      : null;

    if (!startYear) return;

    events.push({
      year: String(startYear),
      label: `Began term as ${role} (${location})`,
      type: 'term',
    });
  });
  return events;
}

exports.handler = async (event) => {
  const client = await getClient();
  const peopleId = event.pathParameters?.people_id;

  if (!peopleId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing path parameter "people_id"' }),
    };
  }

  try {
    const personCheck = await client.query(
      'SELECT * FROM the_lazy_voter_serving.unified_politician_record WHERE u_id = $1 LIMIT 1',
      [peopleId],
    );
    if (personCheck.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Politician not found" }),
      };
    }

    const person = personCheck.rows[0];

    const legiscan_timeline = await client.query(
      `SELECT *
       FROM the_lazy_voter_serving.legiscan_term_history h
       WHERE h.people_id = ANY($1)`,
      [person.legiscan_ids],
    );

    const fec_timeline = await client.query(
      `SELECT *
       FROM the_lazy_voter_serving.fec_candidate c
       WHERE c.fec_id = ANY($1)`,
      [person.fec_ids],
    );

    const timeline = [
      ...buildFecEvents(fec_timeline.rows),
      ...buildLegiscanEvents(legiscan_timeline.rows),
    ].sort((a, b) => Number(a.year) - Number(b.year));

    return {
      statusCode: 200,
      body: JSON.stringify({ timeline }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message,
        code: error.code,
      }),
    };
  } finally {
    await client.end();
  }
};