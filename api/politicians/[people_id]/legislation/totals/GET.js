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

    const billCategories = await client.query(`
      SELECT b.term_start_date,c.category_name,COUNT(b.bill_id) as value
      FROM the_lazy_voter_serving.unified_politician_record p 
      JOIN the_lazy_voter_serving.legiscan_sponsor s
      ON p.legiscan_ids @> to_jsonb(s.people_id::text)
      JOIN the_lazy_voter_serving.legiscan_bill b
      ON s.bill_id = b.bill_id
      JOIN the_lazy_voter_serving.legiscan_bill_category_pair cp
      ON cp.bill_id = b.bill_id
      JOIN the_lazy_voter_serving.legiscan_bill_category c
      ON c.category_id = cp.category_id
      WHERE p.id = $1
      ${!election_year ? "" : "AND d.election_year = "+election_year} 
      GROUP BY c.category_name, b.term_start_date
      ORDER BY b.term_start_date
    `, [peopleId]);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ rows: billCategories.rows }),
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