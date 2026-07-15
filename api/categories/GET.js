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
  
  const client = await getClient();
  try {

    const categories = await client.query(`SELECT * FROM the_lazy_voter_serving.legiscan_bill_category`);

    return {
      statusCode: 200,
      body: JSON.stringify({ rows: categories.rows }),
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