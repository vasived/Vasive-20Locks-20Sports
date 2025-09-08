import { RequestHandler } from "express";
import { query } from "../db";

export const getFreePicks: RequestHandler = async (req, res) => {
  try {
    const result = await query(`
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

    res.json({ picks });
  } catch (error) {
    console.error("Error fetching free picks:", error);
    res.status(500).json({ error: "Failed to fetch free picks" });
  }
};

export const getPremiumPicks: RequestHandler = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        p.id,
        p.player,
        p.prop_type,
        p.prop_line,
        p.side,
        p.analysis_short,
        p.analysis_long,
        p.confidence_pct,
        p.stake_pct,
        p.odds,
        p.sportsbook,
        p.result,
        g.home_team,
        g.away_team,
        g.tipoff_est,
        s.name as sport_name
      FROM picks p
      LEFT JOIN games g ON p.game_id = g.id
      LEFT JOIN sports s ON p.sport_code = s.code
      WHERE p.tier = 'premium'
      ORDER BY p.created_at DESC
      LIMIT 20
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
      analytics: row.analysis_long,
      confidence: row.confidence_pct || 0,
      stakePercent: parseFloat(row.stake_pct || "0"),
      odds: row.odds,
      sportsbook: row.sportsbook,
      result: row.result || "Pending",
      sport: row.sport_name,
    }));

    res.json({ picks });
  } catch (error) {
    console.error("Error fetching premium picks:", error);
    res.status(500).json({ error: "Failed to fetch premium picks" });
  }
};

export const createPick: RequestHandler = async (req, res) => {
  try {
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
    } = req.body;

    const result = await query(
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

    res.json({ id: result.rows[0].id, message: "Pick created successfully" });
  } catch (error) {
    console.error("Error creating pick:", error);
    res.status(500).json({ error: "Failed to create pick" });
  }
};

export const updatePick: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updateFields = [] as string[];
    const values: any[] = [];
    let paramCount = 1;

    const columnMap: Record<string, string> = {
      sportCode: "sport_code",
      gameId: "game_id",
      propType: "prop_type",
      propLine: "prop_line",
      analysisShort: "analysis_short",
      analysisLong: "analysis_long",
      confidencePct: "confidence_pct",
      stakePct: "stake_pct",
      stakePercent: "stake_pct",
      odds: "odds",
      sportsbook: "sportsbook",
      result: "result",
      tier: "tier",
      player: "player",
      side: "side",
    };

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        const column = columnMap[key] ?? key;
        updateFields.push(`${column} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `
      UPDATE picks 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING id
    `,
      values,
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pick not found" });
    }

    res.json({ message: "Pick updated successfully" });
  } catch (error) {
    console.error("Error updating pick:", error);
    res.status(500).json({ error: "Failed to update pick" });
  }
};

export const deletePick: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query("DELETE FROM picks WHERE id = $1 RETURNING id", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pick not found" });
    }

    res.json({ message: "Pick deleted successfully" });
  } catch (error) {
    console.error("Error deleting pick:", error);
    res.status(500).json({ error: "Failed to delete pick" });
  }
};
