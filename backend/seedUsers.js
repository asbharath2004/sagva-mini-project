const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('MONGO_URI is missing in .env file ❌');
    process.exit(1);
}

// ============ DATABASE SCHEMA ============
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
    profileCompleted: { type: Boolean, default: true },
}, { timestamps: true });

// Note: Explicitly pointing to the 'users' collection to match user request
const User = mongoose.model('User', userSchema, 'users');

const seedUsers = async () => {
    try {
        console.log('🔗 Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const defaultUsers = [
            { name: 'Admin', email: 'admin@sagva.edu', password: hashedPassword, role: 'admin' },
            { name: 'Teacher', email: 'teacher@sagva.edu', password: hashedPassword, role: 'teacher' }
        ];

        for (const userData of defaultUsers) {
            const exists = await User.findOne({ email: userData.email });
            if (!exists) {
                await User.create(userData);
                console.log(`${userData.role.toUpperCase()} inserted successfully ✅`);
            } else {
                console.log(`${userData.role.toUpperCase()} already exists, skipping... ⏭️`);
            }
        }

        console.log('\nUsers initialization complete! 🚀');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding users:', err.message);
        process.exit(1);
    }
};

seedUsers();
