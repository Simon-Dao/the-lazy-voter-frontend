const { Client } = require("pg");

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
  const u_id = event.pathParameters?.people_id;
  const client = await getClient();

  try {
    // Check if person exists
    const personCheck = await client.query(
      "SELECT 1 FROM the_lazy_voter_serving.unified_politician_record WHERE u_id = $1 LIMIT 1",
      [u_id],
    );
    if (personCheck.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Politician not found" }),
      };
    }
    const people_id = await client.query(
      `
      SELECT legiscan_ids
      FROM the_lazy_voter_serving.unified_politician_record
      WHERE u_id = $1
    `,
      [u_id],
    );

    if(!people_id.rows || !people_id.rows[0]["legiscan_ids"]) {
      return {
        statusCode: 404,
        body: "",
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(people_id.rows[0]["legiscan_ids"][0]),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message,
        code: error.code,
      }),
    };
  } finally {
    await client.end();
  }
};