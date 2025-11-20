// Check if usage_logs constraint was updated
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function checkConstraint() {
  const sql = neon(process.env.DATABASE_URL);

  const result = await sql`
    SELECT conname, pg_get_constraintdef(oid) as definition
    FROM pg_constraint
    WHERE conrelid = 'usage_logs'::regclass
    AND conname = 'usage_logs_operation_type_check'
  `;

  console.log('Current constraint:', result[0]?.definition);
}

checkConstraint();
