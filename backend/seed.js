const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error('MONGO_URI is missing in .env file ❌');
    process.exit(1);
}

// ============ DATABASE SCHEMAS ============
const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
    department: { type: String, default: '' },
    year: { type: String, default: '' },
    currentGPA: { type: Number, default: 0 },
    previousGPA: { type: Number, default: 0 },
    velocityScore: { type: Number, default: 0 },
    profileCompleted: { type: Boolean, default: true },
}, { timestamps: true });

const academicRecordSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    semester: { type: Number, required: true },
    year: { type: Number, required: true },
    gpa: { type: Number, required: true },
    subjects: { type: Array, default: [] },
    status: { type: String, default: 'verified' }
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'completed', 'under_review', 'approved', 'rejected'], default: 'pending' },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
}, { timestamps: true });

// Models (User points to same collection as Student as per backend architecture)
const Student = mongoose.model('Student', studentSchema);
const AcademicRecord = mongoose.model('AcademicRecord', academicRecordSchema);
const Task = mongoose.model('Task', taskSchema);

// Helper for random number in range
const randomGPA = () => parseFloat((Math.random() * (9.5 - 6.0) + 6.0).toFixed(2));
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async () => {
    try {
        console.log('🔗 Connecting to MongoDB Atlas...');
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB Atlas ✅');

        // Clear existing data? 
        // Logic: Check for duplicates instead as requested.

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // 1. Create Admin
        const adminEmail = 'admin@sagva.edu';
        let admin = await Student.findOne({ email: adminEmail });
        if (!admin) {
            admin = await Student.create({
                name: 'System Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                department: 'Administration',
                year: 'N/A'
            });
            console.log('Admin user created 👨‍💻');
        }

        // 2. Create Teacher
        const teacherEmail = 'teacher@sagva.edu';
        let teacher = await Student.findOne({ email: teacherEmail });
        if (!teacher) {
            teacher = await Student.create({
                name: 'Professor Alan Turing',
                email: teacherEmail,
                password: hashedPassword,
                role: 'teacher',
                department: 'Computer Science',
                year: 'N/A'
            });
            console.log('Teacher user created 👨‍🏫');
        }

        // 3. Create 40 Students
        const departments = ['CSE', 'IT', 'ECE', 'MECH'];
        const studentIds = [];

        for (let i = 1; i <= 40; i++) {
            const email = `student${i}@sagva.edu`;
            let student = await Student.findOne({ email });

            if (!student) {
                const sem1GPA = randomGPA();
                const sem2GPA = randomGPA();
                const velocity = parseFloat((sem2GPA - sem1GPA).toFixed(2));

                student = await Student.create({
                    name: `Student${i}`,
                    email: email,
                    password: hashedPassword,
                    role: 'student',
                    department: getRandomItem(departments),
                    year: String(Math.floor(Math.random() * 4) + 1),
                    currentGPA: sem2GPA,
                    previousGPA: sem1GPA,
                    velocityScore: velocity
                });

                // Create Academic Records
                await AcademicRecord.create([
                    {
                        studentId: student._id,
                        semester: 1,
                        year: 2023,
                        gpa: sem1GPA,
                        subjects: [{ subjectName: 'Basics', marks: sem1GPA * 10, grade: 'A' }]
                    },
                    {
                        studentId: student._id,
                        semester: 2,
                        year: 2024,
                        gpa: sem2GPA,
                        subjects: [{ subjectName: 'Advanced', marks: sem2GPA * 10, grade: 'A' }]
                    }
                ]);
            }
            studentIds.push(student._id);
        }
        console.log('Inserted 40 students successfully ✅');

        // 4. Create 5 Tasks
        const taskCount = await Task.countDocuments();
        if (taskCount < 5) {
            const sampleTasks = [
                'Project Proposal',
                'Literature Review',
                'Database Design',
                'Frontend Mockup',
                'Backend API Docs'
            ];

            for (let i = 0; i < 5; i++) {
                await Task.create({
                    title: sampleTasks[i],
                    description: `Complete the ${sampleTasks[i]} for the semester project.`,
                    deadline: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
                    status: 'pending',
                    studentId: getRandomItem(studentIds),
                    teacherId: teacher._id
                });
            }
            console.log('Created 5 tasks successfully 📝');
        }

        console.log('\nDatabase seeding completed! 🚀');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database ❌:', error.message);
        process.exit(1);
    }
};

seedDB();
