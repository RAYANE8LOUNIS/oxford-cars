import bcrypt from 'bcryptjs';
import { query } from '../db';

async function createAdmin() {
  const email = 'admin@oxfordcars.dz';
  const password = 'Admin@Oxford2024';
  const hash = await bcrypt.hash(password, 10);

  await query(
    `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
     VALUES ($1, $2, 'Oxford', 'Admin', '+213770123771', 'super_admin')
     ON CONFLICT (email) DO UPDATE SET password_hash = $2, role = 'super_admin'`,
    [email, hash]
  );

  console.log('✅ Admin account ready');
  console.log('   Email:    admin@oxfordcars.dz');
  console.log('   Password: Admin@Oxford2024');
  process.exit(0);
}

createAdmin().catch((err) => { console.error(err); process.exit(1); });
