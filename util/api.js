const { Client } = require('pg');
require('dotenv').config();

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

async function a() {
  const billId = 1137281

  const client = await getClient();

  try {
  const result = await client.query(
  'SELECT * FROM the_lazy_voter_serving.legiscan_bill WHERE bill_id = $1',
  [billId]
);
console.log(result.rows);
  } finally {
    await client.end();
  }

}

a()