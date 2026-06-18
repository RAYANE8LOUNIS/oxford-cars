import fs from 'fs';
import path from 'path';
import { pool } from './index';

async function setupDatabase() {
  const client = await pool.connect();
  try {
    console.log('Setting up Oxford Cars database...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await client.query(schema);
    console.log('Database setup complete!');
  } catch (err) {
    console.error('Database setup failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
