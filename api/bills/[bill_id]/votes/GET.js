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

    const votes = await client.query(`
    SELECT p.people_id, p.name, v.vote_desc 
    FROM the_lazy_voter_serving.legiscan_vote v
    JOIN the_lazy_voter_serving.legiscan_rollcall r
    ON v.roll_call_id = r.roll_call_id
    JOIN the_lazy_voter_serving.legiscan_bill b
    ON r.bill_id = b.bill_id
    JOIN the_lazy_voter_serving.legiscan_people p
    ON v.people_id = p.people_id
    WHERE b.bill_id = $1
    OFFSET $2
    LIMIT $3;`
      , [billId, per_page * (page-1), per_page]);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ rows: votes.rows }),
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