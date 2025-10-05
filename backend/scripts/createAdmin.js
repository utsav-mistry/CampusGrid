import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const existingAdmin = await mongoose.connection.collection('users').findOne({
      email: 'admin@campusgrid.com'
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }
    
    await mongoose.connection.collection('users').insertOne({
      email: 'admin@campusgrid.com',
      password: hashedPassword,
      isEmailVerified: true,
      role: 'admin',
      profile: { name: 'Admin User' },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Admin user created successfully!');
    console.log('Email: admin@campusgrid.com');
    console.log('Password: admin123');
    console.log('Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
