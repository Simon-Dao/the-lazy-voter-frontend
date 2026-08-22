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
    const info = await client.query(
      `
      SELECT u_id,ai_summary,sources
      FROM the_lazy_voter_serving.politician_ai_summary
      WHERE u_id = $1
    `,
      [u_id],
    );

    if(!info.rows || !info.rows[0]) {
       return {
        statusCode: 200,
        body: JSON.stringify({"u_id":u_id, "ai_summary":"No data could be summarized from web based politician search", "sources":'[]'}),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(row.rows),
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