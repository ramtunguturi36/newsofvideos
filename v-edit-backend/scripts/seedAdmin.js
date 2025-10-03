import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import connectDb from '../src/utils/db.js';
import User from '../src/models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv with the correct path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  try {
    console.log('Connecting to database...');
    await connectDb();
    
    const email = 'admin@vedit.com';
    const existing = await User.findOne({ email });
    
    if (existing) {
      console.log('✅ Admin user already exists');
      console.log(`Email: ${email}`);
      console.log('Role: admin');
      process.exit(0);
    }
    
    console.log('Creating admin user...');
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    const adminUser = await User.create({ 
      name: 'Admin', 
      email, 
      passwordHash, 
      role: 'admin' 
    });
    
    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${email}`);
    console.log('Password: admin123');
    console.log('Role: admin');
    console.log('User ID:', adminUser._id);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin user:', err);
    process.exit(1);
  }
}

run();


