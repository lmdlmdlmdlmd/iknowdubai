// PostHog HogQL API route — fetches real analytics data server-side
// Env vars required: POSTHOG_PERSONAL_API_KEY, POSTHOG_PROJECT_ID

// Convert ISO 3166-1 alpha-2 country code to flag emoji
function countryCodeToFlag(code) {
  if (!code || code.length !== 2) return '🏳️';
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
  );
}

// In-memory cache (persists across requests in the same server process)
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// HogQL queries
const MAIN_QUERY = `
  SELECT
    count() AS total,
    countIf(properties.rating = 'Earned Your Opinion') AS earned,
    countIf(properties.rating = 'Qualified-ish') AS qualified,
    countIf(properties.rating = 'Confidently Wrong') AS wrong,
    countIf(properties.rating = 'Certified Bullshitter') AS bullshitter,
    countIf(properties.is_american = 'true') AS american,
    avg(if(properties.is_american = 'true', NULL, toFloat(properties.score))) AS avg_score
  FROM events
  WHERE event = 'quiz_completed'
`;

const ENGAGEMENT_QUERY = `
  SELECT
    countIf(event = 'certificate_downloaded') AS certificates,
    countIf(event = 'shared_on_x') AS shares
  FROM events
  WHERE event IN ('certificate_downloaded', 'shared_on_x')
`;

const COUNTRIES_QUERY = `
  SELECT
    properties.$geoip_country_code AS code,
    properties.$geoip_country_name AS name,
    count() AS cnt
  FROM events
  WHERE event = 'quiz_completed'
    AND properties.$geoip_country_name IS NOT NULL
  GROUP BY code, name
  ORDER BY cnt DESC
  LIMIT 10
`;

async function queryPostHog(hogqlQuery) {
  const res = await fetch(
    `https://eu.i.posthog.com/api/projects/${process.env.POSTHOG_PROJECT_ID}/query/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
      },
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: hogqlQuery,
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PostHog API error ${res.status}: ${text}`);
  }

  return res.json();
}

export async function GET() {
  try {
    // Serve from cache if fresh
    const now = Date.now();
    if (cachedData && now - cacheTimestamp < CACHE_DURATION_MS) {
      return Response.json(cachedData, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      });
    }

    // Validate env vars
    if (!process.env.POSTHOG_PERSONAL_API_KEY || !process.env.POSTHOG_PROJECT_ID) {
      return Response.json(
        { error: 'PostHog API not configured. Set POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID in .env.local' },
        { status: 500 }
      );
    }

    // Run all three queries in parallel
    const [mainResult, engagementResult, countriesResult] = await Promise.all([
      queryPostHog(MAIN_QUERY),
      queryPostHog(ENGAGEMENT_QUERY),
      queryPostHog(COUNTRIES_QUERY),
    ]);

    // Parse HogQL results — format is { results: [[val1, val2, ...]], columns: [...] }
    const [total, earned, qualified, wrong, bullshitter, american, avgScore] =
      mainResult.results[0];
    const [certificates, shares] = engagementResult.results[0];

    const topCountries = countriesResult.results.map(([code, name, count]) => ({
      flag: countryCodeToFlag(code),
      name,
      count,
    }));

    const data = {
      totalQuizzes: total,
      distribution: { earned, qualified, wrong, bullshitter, american },
      averageScore: Math.round(avgScore || 0),
      certificatesDownloaded: certificates,
      sharedOnX: shares,
      topCountries,
      lastUpdated: new Date().toISOString(),
    };

    // Update cache
    cachedData = data;
    cacheTimestamp = now;

    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Stats API error:', error);

    // Return stale cache if available
    if (cachedData) {
      return Response.json(
        { ...cachedData, stale: true },
        { headers: { 'Cache-Control': 'no-cache' } }
      );
    }

    return Response.json(
      { error: 'Failed to fetch stats from PostHog' },
      { status: 500 }
    );
  }
}
