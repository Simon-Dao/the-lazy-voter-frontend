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
  const term_start_date = event.queryStringParameters.term_start_date;
  const category_name = event.queryStringParameters.category_name;

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

    const bills = await client.query(`
      SELECT b.title, b.description, b.state_link, b.status_desc, b.bill_number, b.status_date
      FROM the_lazy_voter_serving.legiscan_sponsor s
      JOIN the_lazy_voter_serving.unified_politician_record p
      ON p.legiscan_ids @> to_jsonb(s.people_id::text)
      JOIN the_lazy_voter_serving.legiscan_bill b
      ON s.bill_id = b.bill_id
      JOIN the_lazy_voter_serving.legiscan_bill_category_pair c
      ON b.bill_id = c.bill_id
      JOIN the_lazy_voter_serving.legiscan_bill_category bc
      ON c.category_id = bc.category_id
      WHERE p.u_id = $1
      AND b.term_start_date = $2
      AND bc.category_name = $3
      LIMIT $4
      OFFSET $5
    `, [peopleId, term_start_date, category_name, per_page, per_page * (page - 1)]);
    
    return {
      statusCode: 200,
      body: JSON.stringify(bills.rows),
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