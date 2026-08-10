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
  const industry_category = event.queryStringParameters?.industry_category;

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
    const personCheck = await client.query('SELECT 1 FROM the_lazy_voter_serving.unified_politician_record WHERE u_id = $1 LIMIT 1', [peopleId]);
    if (personCheck.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Politician not found" }),
      };
    }

    const countResult = await client.query(`
      SELECT COUNT(*) AS total
      FROM (
        SELECT d.contributor_name
        FROM the_lazy_voter_serving.fec_donation d
        JOIN the_lazy_voter_serving.unified_politician_record p
        ON p.fec_ids @> to_jsonb(d.fec_id::text)
        WHERE p.u_id = $1
        AND d.election_year = $2
        AND d.industry_category = $3
        GROUP BY d.contributor_name
      ) grouped
    `, [peopleId, election_year, industry_category]);

    const donations = await client.query(`
      SELECT d.contributor_name,
             SUM(d.contribution_receipt_amount) AS total_amount,
             COUNT(*) AS donation_count,
             MAX(d.contribution_receipt_date) AS last_contribution_date
      FROM the_lazy_voter_serving.fec_donation d
      JOIN the_lazy_voter_serving.unified_politician_record p 
      ON p.fec_ids @> to_jsonb(d.fec_id::text)
      WHERE p.u_id = $1
      AND d.election_year = $2
      AND d.industry_category = $3
      GROUP BY d.contributor_name
      ORDER BY total_amount DESC
      LIMIT $4
      OFFSET $5
    `, [peopleId, election_year, industry_category, per_page, per_page * (page - 1)]);

    const rows = donations.rows.map((r) => ({
      contributor_name: r.contributor_name,
      total_amount: parseFloat(r.total_amount),
      donation_count: parseInt(r.donation_count, 10),
      last_contribution_date: r.last_contribution_date,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        rows,
        total: parseInt(countResult.rows[0].total, 10),
        page,
        per_page,
      }),
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