// Script to duplicate strategy 7ec87201-de7d-4b14-88f1-b2993525885f
// Run with: node duplicate-strategy.js

const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 10,
});

async function duplicateStrategy() {
  try {
    console.log('Fetching original strategy...');

    // Get the original strategy
    const [strategy] = await sql`
      SELECT * FROM strategies
      WHERE id = '7ec87201-de7d-4b14-88f1-b2993525885f'
    `;

    if (!strategy) {
      console.error('Strategy not found!');
      process.exit(1);
    }

    console.log('Original strategy:', {
      client_name: strategy.client_name,
      industry: strategy.industry,
      target_flesch_score: strategy.target_flesch_score,
      keywords: strategy.keywords,
    });

    // Create new strategy with updated name
    console.log('\nCreating new strategy "Firefly Grove App"...');

    const [newStrategy] = await sql`
      INSERT INTO strategies (
        user_id,
        client_name,
        industry,
        goals,
        target_audience,
        brand_voice,
        frequency,
        content_length,
        keywords,
        target_flesch_score,
        content_type,
        city,
        state,
        service_area
      ) VALUES (
        ${strategy.user_id},
        'Firefly Grove App',
        ${strategy.industry},
        ${strategy.goals},
        ${strategy.target_audience},
        ${strategy.brand_voice},
        ${strategy.frequency},
        ${strategy.content_length},
        ${strategy.keywords},
        ${strategy.target_flesch_score || 55},
        ${strategy.content_type || 'national'},
        ${strategy.city || null},
        ${strategy.state || null},
        ${strategy.service_area || null}
      ) RETURNING *
    `;

    console.log('\n✅ New strategy created!');
    console.log('Strategy ID:', newStrategy.id);
    console.log('Client Name:', newStrategy.client_name);
    console.log('Target Flesch Score:', newStrategy.target_flesch_score);
    console.log('Keywords:', newStrategy.keywords);
    console.log('\nNow you can generate topics with validation at:');
    console.log(`http://localhost:3000/dashboard/strategies/${newStrategy.id}`);

    await sql.end();
  } catch (error) {
    console.error('Error duplicating strategy:', error);
    process.exit(1);
  }
}

duplicateStrategy();
