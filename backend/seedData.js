const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const mongoURL = process.env.mongo_url;

if (!mongoURL) {
  console.error('mongo_url is missing in .env file ❌');
  process.exit(1);
}

// ============ DATABASE SCHEMAS ============
const userSchema = new mongoose.Schema({
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
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
  status: { type: String, default: 'pending' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  senderRole: { type: String, required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
  receiverRole: { type: String, required: true },
  messageText: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

// Models
const User = mongoose.model('User', userSchema, 'users');
const StudentProfile = mongoose.model('StudentProfile', userSchema, 'students');
const AcademicRecord = mongoose.model('AcademicRecord', academicRecordSchema, 'academicrecords');
const Task = mongoose.model('Task', taskSchema, 'tasks');
const Message = mongoose.model('Message', messageSchema, 'messages');

// Helpers
const randomGPA = () => parseFloat((Math.random() * (9.5 - 6.0) + 6.0).toFixed(1));
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedData = async () => {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoURL);

    // 1. Find the already seeded Teacher
    const teacher = await User.findOne({ role: 'teacher' });
    if (!teacher) {
      console.error('Teacher account not found! Please run node seedUsers.js first. ❌');
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const departments = ['CSE', 'IT', 'ECE', 'MECH'];
    const studentIds = [];

    // 2. Generate 40 Students
    for (let i = 1; i <= 40; i++) {
      const email = `student${i}@sagva.edu`;
      let user = await User.findOne({ email });

      if (!user) {
        const sem1GPA = randomGPA();
        const sem2GPA = randomGPA();
        const velocity = parseFloat((sem2GPA - sem1GPA).toFixed(2));

        const studentData = {
          name: `Student${i}`,
          email,
          password: hashedPassword,
          role: 'student',
          department: getRandomItem(departments),
          year: String(Math.floor(Math.random() * 4) + 1),
          currentGPA: sem2GPA,
          previousGPA: sem1GPA,
          velocityScore: velocity,
        };

        // Insert into both collections as requested
        user = await User.create(studentData);
        await StudentProfile.create(studentData);

        // 3. Create 2 Semesters of Records
        await AcademicRecord.create([
          { studentId: user._id, semester: 1, year: 2023, gpa: sem1GPA },
          { studentId: user._id, semester: 2, year: 2024, gpa: sem2GPA }
        ]);

        studentIds.push(user._id);
      } else {
        studentIds.push(user._id);
      }
    }
    console.log('40 students inserted successfully ✅');
    console.log('Academic records created ✅');

    // 4. Create 5 Tasks
    const existingTasksCount = await Task.countDocuments();
    if (existingTasksCount < 5) {
      const titles = ['Assesment 1', 'Lab Report', 'Monthly Quiz', 'Mini Project', 'Peer Review'];
      for (let i = 0; i < 5; i++) {
        await Task.create({
          title: titles[i],
          description: `Description for ${titles[i]} task assigned to individual students.`,
          deadline: new Date(Date.now() + (i + 1) * 2 * 24 * 60 * 60 * 1000),
          status: 'pending',
          studentId: getRandomItem(studentIds),
          teacherId: teacher._id
        });
      }
      console.log('Tasks created ✅');
    }

    // 5. Create 20 Messages
    const existingMessagesCount = await Message.countDocuments();
    if (existingMessagesCount < 20) {
      const teacherMessages = [
        "Please complete your assignment by tomorrow.",
        "Check your latest semester results on the dashboard.",
        "Are you facing any issues with the syllabus?",
        "Good luck for your upcoming exams!",
        "Your growth velocity is looking positive this month."
      ];
      const studentMessages = [
        "I have submitted the assigned task, please review.",
        "When will the next assessment be conducted?",
        "Thank you for the guidance on the project.",
        "I had a doubt in the Data Structures module.",
        "Could you please verify my GPA for semester 2?"
      ];

      for (let i = 0; i < 10; i++) {
        const randomStudent = getRandomItem(studentIds);
        
        // Teacher to Student
        await Message.create({
          senderId: teacher._id,
          senderRole: 'teacher',
          receiverId: randomStudent,
          receiverRole: 'student',
          messageText: getRandomItem(teacherMessages)
        });

        // Student to Teacher
        await Message.create({
          senderId: randomStudent,
          senderRole: 'student',
          receiverId: teacher._id,
          receiverRole: 'teacher',
          messageText: getRandomItem(studentMessages)
        });
      }
      console.log('Messages inserted successfully ✅');
    }

    console.log('\nFull demo data seeding complete! 🚀✨');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding data:', err.message);
    process.exit(1);
  }
};

seedData();
