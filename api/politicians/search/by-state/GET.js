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

// Federal elections run on 2-year cycles (even years). This returns the
// next even year >= the current year, which is the standard convention
// for "current" election cycle. Adjust if your data uses a different rule.
function getCurrentElectionCycle() {
  const year = new Date().getFullYear();
  return year % 2 === 0 ? year : year + 1;
}

exports.handler = async (event) => {

  const state = event.queryStringParameters?.state;
  const election_year =
    event.queryStringParameters?.election_year
      ? parseInt(event.queryStringParameters.election_year, 10)
      : getCurrentElectionCycle();

  if (!state) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "state query parameter is required" }),
    };
  }

  const client = await getClient();

  try {
    
    const politicians = await client.query(`
      SELECT fec_id, office_full AS role, party_full AS party, state, incumbent_challenge, district_number as district,election_years -> (jsonb_array_length(election_years) - 1) AS latest_election_year
      FROM the_lazy_voter_serving.fec_candidate
      WHERE c.election_year = $2
      AND c.state = $3
    `, [election_year, state]);

    return {
      statusCode: 200,
      body: JSON.stringify(
        politicians.rows
      ),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message,
        code: error.code,
      }),
    };
  }
  finally {
    await client.end();
  }
};