import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const handler = async (event: any, context: any) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          p.id,
          p.player,
          p.prop_type,
          p.prop_line,
          p.side,
          p.analysis_short,
          p.confidence_pct,
          p.odds,
          p.sportsbook,
          g.home_team,
          g.away_team,
          g.tipoff_est,
          s.name as sport_name
        FROM picks p
        LEFT JOIN games g ON p.game_id = g.id
        LEFT JOIN sports s ON p.sport_code = s.code
        WHERE p.tier = 'free'
        ORDER BY p.created_at DESC
        LIMIT 10
      `);

      const picks = result.rows.map((row) => ({
        id: row.id,
        player: row.player,
        propType: row.prop_type,
        line: parseFloat(row.prop_line),
        side: row.side,
        game:
          row.home_team && row.away_team
            ? `${row.away_team} @ ${row.home_team}`
            : "TBD",
        tipoff: row.tipoff_est
          ? new Date(row.tipoff_est).toLocaleString()
          : "TBD",
        analysis: row.analysis_short,
        confidence: row.confidence_pct || 0,
        odds: row.odds,
        sportsbook: row.sportsbook,
        sport: row.sport_name,
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ picks }),
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching free picks:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to fetch free picks" }),
    };
  }
};
