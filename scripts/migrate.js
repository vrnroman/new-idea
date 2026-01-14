/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function migrate() {
  console.log('--- TextBin Rooms Database Setup ---');
  console.log('This script will apply the schema.sql to your Supabase database.');
  console.log('You need your "Connection String" from Supabase Settings -> Database.\n');

  // Try to get from env first
  let connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    connectionString = await new Promise((resolve) => {
      rl.question('Enter your Database Connection String (postgres://...): ', (answer) => {
        resolve(answer.trim());
      });
    });
  }

  if (!connectionString) {
    console.error('Error: Connection string is required.');
    process.exit(1);
  }

  // Handle "Transaction" mode vs "Session" mode pooling if utilizing Supabase pooler,
  // but for migration direct connection (port 5432) or session mode (port 6543) is best.
  // We'll just pass it to pg.

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Supabase requires SSL
  });

  try {
    console.log('Connecting to database...');
    await client.connect();

    const sqlPath = path.join(__dirname, '..', 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Running schema.sql...');
    await client.query(sql);

    console.log('\n✅ Database setup completed successfully!');
    console.log('The "rooms" and "messages" tables have been created.');

  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    if (err.message.includes('password authentication failed')) {
      console.error('Hint: Double check your database password in the connection string.');
    }
  } finally {
    await client.end();
    rl.close();
  }
}

migrate();
