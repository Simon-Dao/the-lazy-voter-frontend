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
  const peopleId = event.pathParameters?.people_id;
  const election_year = event.pathParameters?.election_year;

  const client = await getClient();

  try {
    // Check if person exists
    const personCheck = await client.query('SELECT 1 FROM the_lazy_voter_serving.unified_politician_record WHERE u_id = $1 LIMIT 1', [peopleId]);
    if (personCheck.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Politician not found" }),
      };
    }

    let totals = null;

    if(election_year) {
      totals = await client.query(`
        SELECT t.fec_id, t.receipts, t.contributions, t.large_donors, t.small_donors, t.pac, t.other 
        FROM the_lazy_voter_serving.fec_campaign_total t
        JOIN the_lazy_voter_serving.unified_politician_record p 
        ON p.fec_ids @> to_jsonb(t.fec_id::text)
        WHERE p.u_id = $1
        AND cycle = $2
      `, [peopleId, election_year]);
    } else {
      totals = await client.query(`
        SELECT t.fec_id, SUM(t.receipts) as receipts, SUM(t.contributions) as contributions,
        SUM(t.large_donors) as large_donors, SUM(t.small_donors) as small_donors, SUM(t.pac) as pac, SUM(t.other) as other 
        FROM the_lazy_voter_serving.fec_campaign_total t
        JOIN the_lazy_voter_serving.unified_politician_record p 
        ON p.fec_ids @> to_jsonb(t.fec_id::text)
        WHERE p.u_id = $1
        GROUP BY t.fec_id
      `, [peopleId, election_year]);
    } 
    
    return {
      statusCode: 200,
      body: JSON.stringify(totals.rows),
    };
  } catch(error) {
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