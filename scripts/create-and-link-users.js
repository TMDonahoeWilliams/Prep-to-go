/**
 * create-and-link-user.js
 *
 * Usage (local): 
 *   SUPABASE_URL="https://xyz.supabase.co" \
 *   SUPABASE_SERVICE_ROLE_KEY="your_service_role_key" \
 *   DATABASE_URL="postgres://user:pass@host:5432/db" \
 *   node create-and-link-user.js user@example.com "StrongPass123" "First" "Last"
 *
 * This script:
 *  - creates a Supabase auth user via the Admin API
 *  - finds or creates an app DB user row in `users` and sets supabase_user_id
 *
 * IMPORTANT: run only in a secure environment. Do NOT expose service role key.
 */
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  if (!DATABASE_URL) {
    console.error('Missing DATABASE_URL');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const email = args[0] || process.env.NEW_USER_EMAIL;
  const password = args[1] || process.env.NEW_USER_PASSWORD;
  const firstName = args[2] || process.env.NEW_USER_FIRST || null;
  const lastName = args[3] || process.env.NEW_USER_LAST || null;

  if (!email || !password) {
    console.error('Usage: node create-and-link-user.js user@example.com "Password123" "First" "Last"');
    process.exit(1);
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  console.log(`Creating Supabase user for ${email}...`);
  let created;
  try {
    const payload = {
      email,
      password,
      email_confirm: true,
      user_metadata: {
        firstName,
        lastName,
      },
    };

    const resp = await supabaseAdmin.auth.admin.createUser(payload);
    if (resp.error) {
      // If already exists, try to find the user
      console.warn('createUser error:', resp.error.message || resp.error);
      // attempt to find by listing users (may require pagination)
      const list = await supabaseAdmin.auth.admin.listUsers();
      if (list.error) {
        throw new Error('Could not list users after create error: ' + (list.error.message || list.error));
      }
      const existing = list.data?.find((u) => u.email === email);
      if (!existing) throw new Error('Failed to create or find Supabase user: ' + (resp.error.message || resp.error));
      created = existing;
      console.log('Found existing Supabase user id:', created.id);
    } else {
      created = resp.data;
      console.log('Supabase create response id:', created?.id);
    }
  } catch (err) {
    console.error('Supabase create error:', err);
    process.exit(1);
  }

  const supabaseId = created?.id;
  if (!supabaseId) {
    console.error('No supabase id returned');
    process.exit(1);
  }

  // Connect to Postgres and upsert app user row
  const pg = new Client({ connectionString: DATABASE_URL });
  await pg.connect();

  try {
    // Try to find an existing app user by email
    const selectRes = await pg.query('SELECT id FROM users WHERE lower(email) = lower($1) LIMIT 1', [email]);
    if (selectRes.rows.length > 0) {
      const appUserId = selectRes.rows[0].id;
      console.log('Found existing app user id:', appUserId, ' — linking supabase id...');
      await pg.query('UPDATE users SET supabase_user_id = $1, email_verified = true WHERE id = $2', [supabaseId, appUserId]);
      console.log('Updated existing app user with supabase_user_id');
    } else {
      // Insert a new row — adjust columns to match your schema.
      // This example inserts minimal fields: id (generated), email, supabase_user_id, email_verified, created_at
      const insertRes = await pg.query(
        `INSERT INTO users (email, supabase_user_id, email_verified, created_at, first_name, last_name)
         VALUES ($1, $2, true, now(), $3, $4)
         RETURNING id`,
        [email, supabaseId, firstName, lastName]
      );
      const newId = insertRes.rows[0].id;
      console.log('Inserted new app user row id:', newId);
    }
    console.log('Done. Supabase user created/linked; you can now login via Supabase.');
  } catch (err) {
    console.error('Postgres error:', err);
  } finally {
    await pg.end();
  }
}

main().catch((err) => {
  console.error('Unhandled error', err);
  process.exit(1);
});
