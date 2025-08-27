import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const handler = async (event: any, context: any) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const {
      sportCode,
      gameId,
      tier,
      player,
      propType,
      propLine,
      side,
      analysisShort,
      analysisLong,
      confidencePct,
      stakePct,
      odds,
      sportsbook,
      createdByUserId,
    } = body;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `
        INSERT INTO picks (
          sport_code, game_id, tier, player, prop_type, prop_line, side,
          analysis_short, analysis_long, confidence_pct, stake_pct, odds,
          sportsbook, created_by_user_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id
      `,
        [
          sportCode,
          gameId,
          tier,
          player,
          propType,
          propLine,
          side,
          analysisShort,
          analysisLong,
          confidencePct,
          stakePct,
          odds,
          sportsbook,
          createdByUserId,
        ],
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          id: result.rows[0].id, 
          message: "Pick created successfully" 
        }),
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating pick:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to create pick" }),
    };
  }
};
