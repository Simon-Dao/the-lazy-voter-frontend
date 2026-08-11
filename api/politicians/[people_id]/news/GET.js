const { XMLParser } = require("fast-xml-parser");

const BUCKET_KEYWORDS = {
  bio: ["candidate", "congressional", "running for"],
  standing: ["poll", "polling", "fundraising", "endorsement"],
  policy: ["bill", "vote", "sponsored", "proposal"],
  scrutiny: ["criticized", "controversy", "investigation", "opposed"],
};

function buildRssUrl(name, keywords, extra = "") {
  const phrase = `"${name}"`;
  const keywordGroup = `(${keywords.join(" OR ")})`;
  const query = encodeURIComponent(`${phrase} ${keywordGroup} ${extra}`.trim());
  return `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;
}

async function fetchBucket(name, bucket, extra) {
  const url = buildRssUrl(name, BUCKET_KEYWORDS[bucket], extra);
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch ${bucket} news (status ${res.status})`);
  }

  const xmlText = await res.text();
  const parser = new XMLParser();
  const parsed = parser.parse(xmlText);

  const rawItems = parsed?.rss?.channel?.item ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];

  return items
    .filter(Boolean)
    .map((item) => ({
      title: item.title ?? "",
      link: item.link ?? "",
      source: item.source?.["#text"] ?? item.source ?? "",
      pubDate: item.pubDate ?? "",
      category: bucket,
    }));
}

exports.handler = async (event) => {
  const name = event.queryStringParameters?.name;
  const extra = event.queryStringParameters?.extra ?? "";

  if (!name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing required 'name' parameter" }),
    };
  }

  const buckets = Object.keys(BUCKET_KEYWORDS);

  try {
    const results = await Promise.all(
      buckets.map((bucket) => fetchBucket(name, bucket, extra)),
    );

    const byBucket = buckets.reduce((acc, bucket, i) => {
      acc[bucket] = results[i];
      return acc;
    }, {});

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(byBucket),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};