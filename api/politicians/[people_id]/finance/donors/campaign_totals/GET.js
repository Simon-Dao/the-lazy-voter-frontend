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

// Metadata describing each field, keyed by field key
const FIELDS = {
  receipts: { label: "Total Receipts", explanation: "All money raised by the campaign" },
  contributions: { label: "Contributions", explanation: "Direct contributions from donors" },
  large_donors: { label: "Large Donors", explanation: "Contributions from donors giving over $200" },
  small_donors: { label: "Small Donors", explanation: "Contributions from donors giving $200 or less" },
  pac: { label: "PAC Contributions", explanation: "Money from political action committees" },
  other: { label: "Other", explanation: "Contributions not falling into the above categories" },
};

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

    const totals = await client.query(`
      SELECT t.cycle as election_year, SUM(t.receipts) as receipts, SUM(t.contributions) as contributions,
      SUM(t.large_donors) as large_donors, SUM(t.small_donors) as small_donors, SUM(t.pac) as pac, SUM(t.other) as other 
      FROM the_lazy_voter_serving.fec_campaign_total t
      JOIN the_lazy_voter_serving.unified_politician_record p 
      ON p.fec_ids @> to_jsonb(t.fec_id::text)
      WHERE p.u_id = $1
      GROUP BY election_year
      ORDER BY election_year
    `, [peopleId]);

    if (totals.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Finance data not found for this politician" }),
      };
    }

    const byYear = totals.rows.reduce((acc, row) => {
      const { election_year, ...rest } = row;
      acc[election_year] = rest;
      return acc;
    }, {});

    const numericKeys = Object.keys(FIELDS);
    const all = totals.rows.reduce((acc, row) => {
      for (const key of numericKeys) {
        acc[key] = (acc[key] || 0) + Number(row[key] || 0);
      }
      return acc;
    }, {});
    for (const key of numericKeys) {
      all[key] = String(all[key]);
    }

    byYear.all = all;

    return {
      statusCode: 200,
      body: JSON.stringify({
        fields: FIELDS,
        totals: byYear,
      }),
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