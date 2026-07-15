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

  const MAX_PER_PAGE = 100;
  
  const page = parseInt(event.queryStringParameters?.page, 10) || 1;
  const per_page = parseInt(event.queryStringParameters?.per_page, 10) || MAX_PER_PAGE;
  const election_year = event.queryStringParameters?.election_year;

  // Check if per_page is valid
  if (per_page > MAX_PER_PAGE || per_page < 1) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: `per_page must be between 1 and ${MAX_PER_PAGE}`}),
    };
  }

  const client = await getClient();

  try {
    // Check if person exists
    const personCheck = await client.query('SELECT 1 FROM the_lazy_voter_serving.unified_politician_record WHERE id = $1 LIMIT 1', [peopleId]);
    if (personCheck.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Politician not found" }),
      };
    }

    const donations = await client.query(`
      SELECT d.donation_id, d.source_name, d.fec_id, d.contribution_receipt_date, d.contribution_receipt_amount
      FROM the_lazy_voter_serving.fec_donation d
      JOIN the_lazy_voter_serving.unified_politician_record p 
      ON p.fec_ids @> to_jsonb(d.fec_id::text)
      WHERE p.u_id = $1
      ${!election_year ? "" : "AND d.election_year = "+election_year} 
      ORDER BY d.contribution_receipt_date
      LIMIT $2
      OFFSET $3
    `, [peopleId, per_page, per_page * (page - 1)]);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ rows: donations.rows }),
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