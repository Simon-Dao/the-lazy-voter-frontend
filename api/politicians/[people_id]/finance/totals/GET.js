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

function groupByDate(rows) {
  const grouped = rows.reduce((acc, row) => {
    const { value, industry_category, election_year } = row;

    if (!acc[election_year]) {
      acc[election_year] = [];
    }

    acc[election_year].push({
      name: industry_category,
      value,
    });

    return acc;
  }, {});

  // Build an "all" bucket by summing values per category across every year
  const allTotals = rows.reduce((acc, row) => {
    const { industry_category, value } = row;
    acc[industry_category] = (acc[industry_category] ?? 0) + Number(value);
    return acc;
  }, {});

  grouped["all"] = Object.entries(allTotals).map(([name, value]) => ({
    name,
    value,
  }));

  return grouped;
}

exports.handler = async (event) => {
  const peopleId = event.pathParameters?.people_id;

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

    const donations = await client.query(`
      SELECT SUM(d.contribution_receipt_amount) as value, d.industry_category, d.election_year
      FROM the_lazy_voter_serving.fec_donation d
      JOIN the_lazy_voter_serving.unified_politician_record p 
      ON p.fec_ids @> to_jsonb(d.fec_id::text)
      WHERE p.u_id = $1
      GROUP BY d.election_year, d.industry_category
    `, [peopleId]);
    
      const total_donations_query = await client.query(`
      SELECT COUNT(*) as total 
      FROM the_lazy_voter_serving.fec_donation d
      JOIN the_lazy_voter_serving.unified_politician_record p 
      ON p.fec_ids @> to_jsonb(d.fec_id::text)
      WHERE p.u_id = $1
    `, [peopleId]);
    
    const totals = groupByDate(donations.rows);
    const total_donations = total_donations_query.rows ? total_donations_query.rows[0].total : 0

    return {
      statusCode: 200,
      body: JSON.stringify({total_donations, totals}),
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