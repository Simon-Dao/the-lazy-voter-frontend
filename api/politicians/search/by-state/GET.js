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

function getCurrentElectionCycle() {
  const year = new Date().getFullYear();
  return year % 2 === 0 ? year : year + 1;
}

function formatOffice(state, district, role) {
  return [state, district, role].filter(Boolean).join(' ');
}

exports.handler = async (event) => {
  const state = event.queryStringParameters?.state;
  const CURRENT_YEAR = new Date().getFullYear();
  const election_year = getCurrentElectionCycle();
  const IS_ELECTION_YEAR = CURRENT_YEAR === election_year;

  if (!state) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'state query parameter is required' }),
    };
  }

  const client = await getClient();

  try {
    const politicians = await client.query(
      `SELECT u.u_id, can.name, can.fec_id, can.office_full AS role,
              can.party_full AS party, can.state, can.incumbent_challenge, can.incumbent_challenge_full,
              can.district_number AS district,
              can.election_years -> (jsonb_array_length(can.election_years) - 1) AS latest_election_year
       FROM the_lazy_voter_serving.fec_candidate can
       JOIN the_lazy_voter_serving.unified_politician_record u
         ON u.fec_ids @> to_jsonb(can.fec_id::text)
       WHERE can.election_years @> to_jsonb($1::int)
         AND can.state = $2
         AND can.candidate_inactive = 'FALSE'
         AND can.has_raised_funds = 'TRUE'
       ORDER BY can.district_number`,
      [election_year, state],
    );

    const result = politicians.rows.map((row) => {
      const officeLabel = formatOffice(row.state, row.district, row.role);
      let status;

      if (IS_ELECTION_YEAR && row.latest_election_year === election_year) {
        switch (row.incumbent_challenge) {
          case 'I':
            status = `Running for ${officeLabel} re-election`;
            break;
          case 'C':
            status = `Running for ${officeLabel}`;
            break;
          case 'O':
            status = `Running for ${officeLabel} (open seat)`;
            break;
          default:
            status = `Running for ${officeLabel}`;
        }
      } else {
        status = `Ran for ${officeLabel} in ${row.latest_election_year}`;
      }

      return {
        u_id: row.u_id,
        name: row.name,
        latestYear: row.latest_election_year ?? null,
        role: row.role ?? null,
        incumbent_challenge: row.incumbent_challenge_full ?? null,
        party: row.party ?? null,
        state: row.state ?? null,
        district: row.district ?? null,
        status,
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to fetch candidates' }),
    };
  } finally {
    await client.end();
  }
};