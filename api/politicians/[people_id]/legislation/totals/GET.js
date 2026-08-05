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

function groupByDate(rows) {
  const grouped = rows.reduce((acc, row) => {
    const { term_start_date, category_name, value } = row;

    if (!acc[term_start_date]) {
      acc[term_start_date] = [];
    }

    acc[term_start_date].push({
      name: category_name,
      value: Number(value),
    });

    return acc;
  }, {});

  // Build an "all" bucket by summing values per category across every year
  const allTotals = rows.reduce((acc, row) => {
    const { category_name, value } = row;
    acc[category_name] = (acc[category_name] ?? 0) + Number(value);
    return acc;
  }, {});

  grouped["all"] = Object.entries(allTotals).map(([name, value]) => ({
    name,
    value,
  }));

  return grouped;
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
      WHERE p.u_id = $1
      GROUP BY c.category_name, b.term_start_date
      ORDER BY b.term_start_date
    `, [peopleId]);

    const grouped = groupByDate(billCategories.rows);

    return {
      statusCode: 200,
      body: JSON.stringify(grouped),
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