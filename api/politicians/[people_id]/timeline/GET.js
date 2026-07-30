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
  const peopleId = event.pathParameters?.people_id;

  if (!peopleId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing path parameter "people_id"' }),
    };
  }

  try {
    const personCheck = await client.query(
      'SELECT * FROM the_lazy_voter_serving.unified_politician_record WHERE u_id = $1 LIMIT 1',
      [peopleId],
    );
    if (personCheck.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Politician not found" }),
      };
    }

    const person = personCheck.rows[0];

    const legiscan_timeline = await client.query(
      `SELECT *
       FROM the_lazy_voter_serving.legiscan_term_history h
       WHERE h.people_id = ANY($1)`,
      [person.legiscan_ids],
    );

    const fec_timeline = await client.query(
      `SELECT *
       FROM the_lazy_voter_serving.fec_candidate c
       WHERE c.fec_id = ANY($1)`,
      [person.fec_ids],
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ rows: [...fec_timeline.rows, ...legiscan_timeline.rows] }),
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