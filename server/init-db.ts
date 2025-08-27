import "dotenv/config";
import { query } from "./db";

async function initializeDatabase() {
  try {
    console.log("🗄️  Initializing database tables...");

    // Create sports table
    await query(`
      CREATE TABLE IF NOT EXISTS sports (
        code VARCHAR(10) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create games table
    await query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        sport_code VARCHAR(10) REFERENCES sports(code),
        home_team VARCHAR(100) NOT NULL,
        away_team VARCHAR(100) NOT NULL,
        tipoff_est TIMESTAMP,
        status VARCHAR(20) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create picks table
    await query(`
      CREATE TABLE IF NOT EXISTS picks (
        id SERIAL PRIMARY KEY,
        sport_code VARCHAR(10) REFERENCES sports(code),
        game_id INTEGER REFERENCES games(id),
        tier VARCHAR(10) NOT NULL CHECK (tier IN ('free', 'premium')),
        player VARCHAR(200) NOT NULL,
        prop_type VARCHAR(100) NOT NULL,
        prop_line DECIMAL(6,2) NOT NULL,
        side VARCHAR(10) NOT NULL CHECK (side IN ('Over', 'Under')),
        analysis_short TEXT NOT NULL,
        analysis_long TEXT,
        confidence_pct INTEGER DEFAULT 0 CHECK (confidence_pct >= 0 AND confidence_pct <= 100),
        stake_pct DECIMAL(5,3) DEFAULT 0.01 CHECK (stake_pct >= 0 AND stake_pct <= 1),
        odds VARCHAR(20),
        sportsbook VARCHAR(100),
        result VARCHAR(20) DEFAULT 'Pending' CHECK (result IN ('Pending', 'Win', 'Loss')),
        created_by_user_id VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create user_roles table
    await query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        clerk_user_id VARCHAR(100) PRIMARY KEY,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'premium')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log("✅ Database tables created successfully!");

    // Insert default sports
    await query(`
      INSERT INTO sports (code, name) VALUES 
        ('NBA', 'Basketball'),
        ('MLB', 'Baseball'),
        ('NHL', 'Hockey'),
        ('NFL', 'Football')
      ON CONFLICT (code) DO NOTHING
    `);

    console.log("✅ Default sports inserted!");

    // Make the specified user an admin
    const adminUserId = "user_31s6AL1sBxq7Fg1P2e577W6ttGO";
    await query(`
      INSERT INTO user_roles (clerk_user_id, role)
      VALUES ($1, 'admin')
      ON CONFLICT (clerk_user_id)
      DO UPDATE SET role = 'admin', updated_at = NOW()
    `, [adminUserId]);

    console.log(`✅ User ${adminUserId} is now an admin!`);

    // Create some sample picks for testing
    const samplePicks = [
      {
        sport_code: 'NBA',
        tier: 'free',
        player: 'LeBron James',
        prop_type: 'Points',
        prop_line: 25.5,
        side: 'Over',
        analysis_short: 'LeBron has scored over 25.5 points in 7 of his last 10 games. The matchup against a weak defense favors the over.',
        confidence_pct: 75,
        odds: '-110',
        sportsbook: 'DraftKings',
        created_by_user_id: adminUserId
      },
      {
        sport_code: 'NBA',
        tier: 'free',
        player: 'Stephen Curry',
        prop_type: '3-Pointers Made',
        prop_line: 3.5,
        side: 'Over',
        analysis_short: 'Curry is averaging 4.2 threes per game at home this season. Expect him to let it fly against this pace-up matchup.',
        confidence_pct: 68,
        odds: '+100',
        sportsbook: 'FanDuel',
        created_by_user_id: adminUserId
      },
      {
        sport_code: 'NBA',
        tier: 'premium',
        player: 'Jayson Tatum',
        prop_type: 'Points',
        prop_line: 28.5,
        side: 'Under',
        analysis_short: 'Tatum faces a tough defensive matchup and has gone under this number in 3 straight games.',
        analysis_long: 'Advanced metrics show Tatum struggles against top-10 defenses, shooting 42% from the field vs 48% against average defenses. The opponent ranks 3rd in defensive rating and has held wings to 2.1 points below their season average. Tatum also played heavy minutes last game and may see reduced usage.',
        confidence_pct: 82,
        stake_pct: 0.025,
        odds: '-105',
        sportsbook: 'Caesars',
        created_by_user_id: adminUserId
      },
      {
        sport_code: 'NBA',
        tier: 'premium',
        player: 'Nikola Jokic',
        prop_type: 'Rebounds',
        prop_line: 12.5,
        side: 'Over',
        analysis_short: 'Jokic has dominated the boards against this opponent historically and should feast tonight.',
        analysis_long: 'Jokic averages 14.8 rebounds against teams that rank in the bottom 10 in rebounding rate. Tonight\'s opponent ranks 28th in defensive rebounding and allows 13.2 rebounds per game to centers. Pace-up game environment with a 235.5 total suggests plenty of rebounding opportunities.',
        confidence_pct: 89,
        stake_pct: 0.04,
        odds: '-120',
        sportsbook: 'BetMGM',
        created_by_user_id: adminUserId
      }
    ];

    for (const pick of samplePicks) {
      await query(`
        INSERT INTO picks (
          sport_code, tier, player, prop_type, prop_line, side,
          analysis_short, analysis_long, confidence_pct, stake_pct,
          odds, sportsbook, created_by_user_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT DO NOTHING
      `, [
        pick.sport_code, pick.tier, pick.player, pick.prop_type, pick.prop_line,
        pick.side, pick.analysis_short, pick.analysis_long || null, pick.confidence_pct,
        pick.stake_pct, pick.odds, pick.sportsbook, pick.created_by_user_id
      ]);
    }

    console.log("✅ Sample picks created!");
    console.log("🎉 Database initialization complete!");

  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase().then(() => {
    console.log("Database setup finished!");
    process.exit(0);
  });
}

export { initializeDatabase };
