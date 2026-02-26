import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
    if (!MONGODB_URI) {
        console.error('MONGODB_URI is not defined');
        process.exit(1);
    }

    console.log('Connecting to:', MONGODB_URI.replace(/:([^@]+)@/, ':****@'));

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Successfully connected to MongoDB');

        const db = mongoose.connection.db;
        if (db) {
            const collections = await db.listCollections().toArray();
            console.log('Collections:', collections.map(c => c.name));

            const users = await db.collection('users').find({}).toArray();
            console.log('Users in database:', users.length);

            const email = 'akhil@gmail.com';
            const password = 'password123';
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(password, salt);

            console.log(`Setting password for ${email} to ${password} (hashed)`);
            await db.collection('users').updateOne(
                { email },
                { $set: { password: hashedPassword } },
                { upsert: true }
            );
            console.log('User updated/created');
        } else {
            console.log('No database found.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Connection error:', err);
    }
}

testConnection();
