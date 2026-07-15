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
  const billId = event.pathParameters?.bill_id;

  const MAX_PER_PAGE = 400;
  
  const page = parseInt(event.queryStringParameters?.page, 10) || 1;
  const per_page = parseInt(event.queryStringParameters?.per_page, 10) || 50;

  // Check if per_page is valid
  if (per_page > MAX_PER_PAGE || per_page < 1) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: `per_page must be between 1 and ${MAX_PER_PAGE}`}),
    };
  }

  const client = await getClient();

  try {
    // Check if bill exists
    const billCheck = await client.query('SELECT bill_id FROM the_lazy_voter_serving.legiscan_bill WHERE bill_id = $1 LIMIT 1', [billId]);
    if (billCheck.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Bill not found" }),
      };
    }

    const sponsors = await client.query(`
      SELECT p.name, b.title, b.description
      FROM the_lazy_voter_serving.legiscan_sponsor s
      JOIN the_lazy_voter_serving.legiscan_bill b
      ON s.bill_id = b.bill_id
      JOIN the_lazy_voter_serving.legiscan_people p
      ON s.people_id = p.people_id
      WHERE s.bill_id = $1
      OFFSET $2
      LIMIT $3`, [billId, per_page * (page-1), per_page]);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ rows: sponsors.rows }),
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