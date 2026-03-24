const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/analytics_db';

// --- SCHEMAS ---
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String },
  year: { type: String },
  password: { type: String, default: 'password123' },
  role: { type: String, default: 'student' },
  currentGPA: { type: Number, default: 0 },
  previousGPA: { type: Number, default: 0 },
  velocityScore: { type: Number, default: 0 },
  profileCompleted: { type: Boolean, default: true },
});

const subjectSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  marks: { type: Number, required: true },
  grade: { type: String, required: true },
});

const academicRecordSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  semester: { type: Number, required: true },
  year: { type: Number, required: true },
  gpa: { type: Number, required: true },
  subjects: [subjectSchema],
  totalMarks: { type: Number, default: 0 },
  averageMarks: { type: Number, default: 0 },
  status: { type: String, default: 'submitted' },
});

// Middleware for academic records
academicRecordSchema.pre('save', function (next) {
  if (this.subjects && this.subjects.length > 0) {
    const total = this.subjects.reduce((sum, subject) => sum + subject.marks, 0);
    this.totalMarks = total;
    this.averageMarks = parseFloat((total / this.subjects.length).toFixed(2));
  }
  next();
});

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  senderRole: { type: String, required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
  receiverRole: { type: String, required: true },
  subject: { type: String, default: '' },
  messageText: { type: String, required: true },
  messageType: { type: String, default: 'text' },
  priority: { type: String, default: 'low' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

// --- MODELS ---
const Student = mongoose.model('Student', studentSchema);
const AcademicRecord = mongoose.model('AcademicRecord', academicRecordSchema);
const Message = mongoose.model('Message', messageSchema);
const Task = mongoose.model('Task', taskSchema);

// --- HELPER FUNCTIONS ---
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getGrade = (marks) => {
  if (marks >= 90) return 'A+';
  if (marks >= 80) return 'A';
  if (marks >= 70) return 'B';
  if (marks >= 60) return 'C';
  if (marks >= 50) return 'D';
  return 'F';
};

const getGPAFromMarks = (marks) => {
  return parseFloat(((marks / 100) * 4).toFixed(2));
};

const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Laura', 'James', 'Emma', 'William', 'Olivia', 'Robert', 'Sophia', 'Charles', 'Isabella', 'Joseph', 'Mia', 'Thomas', 'Charlotte', 'Christopher', 'Amelia', 'Daniel', 'Harper', 'Matthew', 'Evelyn', 'Anthony', 'Abigail', 'Mark', 'Emily', 'Paul', 'Elizabeth', 'Steven', 'Sofia', 'Andrew', 'Avery', 'Kenneth', 'Ella', 'Joshua', 'Madison', 'Kevin', 'Scarlett'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const subjectNames = ['Data Structures', 'Database Systems', 'Algorithms', 'Web Development', 'Operating Systems', 'Computer Networks'];

// --- SEED FUNCTION ---
const seedDB = async () => {
  try {
    console.log('🌱 Connecting to MongoDB...', mongoURI);
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected.');

    console.log('🗑️ Clearing existing data...');
    await Student.deleteMany({});
    await AcademicRecord.deleteMany({});
    await Message.deleteMany({});
    await Task.deleteMany({});

    // 1. Create a Teacher
    const teacher = await Student.create({
      name: 'Professor Alan Turing',
      email: 'teacher@sagva.edu',
      department: 'Computer Science',
      year: 'N/A',
      password: 'password123',
      role: 'teacher',
      profileCompleted: true
    });

    // 1b. Create an Admin
    await Student.create({
      name: 'System Admin',
      email: 'admin@sagva.edu',
      department: 'Administration',
      year: 'N/A',
      password: 'password123',
      role: 'admin',
      profileCompleted: true
    });

    console.log('👨‍🏫 Teacher and Admin created.');

    const students = [];

    // 2. Generate 40 Students
    for (let i = 0; i < 40; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[getRandomInt(0, lastNames.length - 1)];
      
      const newStudent = await Student.create({
        name: `${firstName} ${lastName}`,
        email: `student${i + 1}@sagva.edu`,
        department: 'Computer Science',
        year: `Year ${getRandomInt(1, 4)}`,
        password: 'password123',
        role: 'student',
      });

      students.push(newStudent);

      // 3. Generate Academic Records (2 to 4 semesters)
      const numSemesters = getRandomInt(2, 4);
      let gpaHistory = [];
      let isAtRiskStudent = i % 4 === 0; // Every 4th student will explicitly have declining performance

      for (let sem = 1; sem <= numSemesters; sem++) {
        const subjects = [];
        let totalSemesterMarks = 0;

        for (let s = 0; s < 4; s++) {
          let minMarks = 50;
          let maxMarks = 95;

          // Introduce negative velocity by lowering marks in later semesters for at-risk students
          if (isAtRiskStudent && sem > 1) {
            maxMarks = 70;
            minMarks = 40;
          } else if (!isAtRiskStudent && sem > 1) {
            // Good students improve slightly
            minMarks = 65;
            maxMarks = 98;
          }

          const marks = getRandomInt(minMarks, maxMarks);
          totalSemesterMarks += marks;
          
          subjects.push({
            subjectName: subjectNames[s % subjectNames.length],
            marks,
            grade: getGrade(marks)
          });
        }

        const avgMarks = totalSemesterMarks / 4;
        const gpa = getGPAFromMarks(avgMarks);
        gpaHistory.push(gpa);

        await AcademicRecord.create({
          studentId: newStudent._id,
          semester: sem,
          year: 2024,
          gpa: gpa,
          subjects: subjects
        });
      }

      // 4. Update Student GPA and Velocity
      const currentGPA = gpaHistory[gpaHistory.length - 1];
      const previousGPA = gpaHistory[gpaHistory.length - 2] || 0;
      const velocityScore = parseFloat((currentGPA - previousGPA).toFixed(2));

      newStudent.currentGPA = currentGPA;
      newStudent.previousGPA = previousGPA;
      newStudent.velocityScore = velocityScore;
      await newStudent.save();

      // 5. Generate Messages
      const msgCount = getRandomInt(2, 3);
      for (let m = 0; m < msgCount; m++) {
        await Message.create({
          senderId: teacher._id,
          senderRole: 'teacher',
          receiverId: newStudent._id,
          receiverRole: 'student',
          subject: 'Academic Performance Review',
          messageText: velocityScore < 0 
              ? 'I noticed your performance has declined recently. Please review the study plan immediately.' 
              : 'Great job this semester! Keep up the good work and maintain this momentum.',
        });
      }

      // 6. Generate Tasks
      const taskCount = getRandomInt(2, 3);
      for (let t = 0; t < taskCount; t++) {
        const d = new Date();
        d.setDate(d.getDate() + getRandomInt(-5, 15)); // Some deadlines in past, some in future
        
        await Task.create({
          title: `Assignment ${t + 1}: ${subjectNames[t % subjectNames.length]}`,
          description: `Complete the chapter exercises and submit them via the portal. Focus on the core principles discussed in class.`,
          deadline: d,
          status: getRandomInt(0, 1) === 0 ? 'pending' : 'completed',
          studentId: newStudent._id,
          teacherId: teacher._id
        });
      }
    }

    console.log(`✅ Successfully seeded DB with 40 students, their records, messages, and tasks.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding the database:', error);
    process.exit(1);
  }
};

seedDB();
