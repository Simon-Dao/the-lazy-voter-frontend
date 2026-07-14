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

  const page = parseInt(event.queryStringParameters?.page, 10) || 1;
  const per_page = parseInt(event.queryStringParameters?.per_page, 10) || 50;

  // Check if per_page is valid
  if (per_page > 200 || per_page < 1) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "per_page must be between 1 and 200" }),
    };
  }

  const client = await getClient();

  try {
    // Check if bill exists
    const billCheck = await client.query('SELECT id FROM legiscan_bills WHERE bill_id = $1', [billId]);
    if (billCheck.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Bill not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Hello, world!" }),
    };
  } finally {
    await client.end();
  }
};