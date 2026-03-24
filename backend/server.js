require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// ============ MIDDLEWARE ============
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Enable CORS for frontend
app.use(cors({
  origin: '*', // Allow all origins for deployment flexibility
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.originalUrl}`);
  next();
});

// ============ DATABASE CONNECTION ============
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/analytics_db';
    console.log(`🔗 Connecting to MongoDB...`);

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected ✅');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// ============ DATABASE SCHEMAS ============

// Student Schema
const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please provide student name'], trim: true },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide valid email'],
    },
    department: { type: String, default: '' }, // Not required for Google OAuth users
    year: { type: String, default: '' }, // Changed to String to store "1st Year", "2nd Year", etc.
    password: { type: String, default: null }, // Optional for Google OAuth users
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
    currentGPA: { type: Number, default: 0 },
    previousGPA: { type: Number, default: 0 },
    velocityScore: { type: Number, default: 0 },
    // Google OAuth fields
    googleId: { type: String, unique: true, sparse: true },
    authMethod: { type: String, enum: ['google', 'manual'], default: 'manual' },
    profileCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Subject Sub-schema
const subjectSchema = new mongoose.Schema({
  subjectName: { type: String, required: [true, 'Subject name is required'], trim: true },
  marks: { type: Number, required: [true, 'Marks are required'], min: 0, max: 100 },
  grade: { type: String, enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'], required: true },
});

// Academic Record Schema
const academicRecordSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: [true, 'Student ID is required'] },
    semester: { type: Number, required: [true, 'Semester is required'], min: 1, max: 8 },
    year: { type: Number, required: [true, 'Year is required'] },
    gpa: { type: Number, required: [true, 'GPA is required'], min: 0, max: 4 },
    subjects: [subjectSchema],
    totalMarks: { type: Number, default: 0 },
    averageMarks: { type: Number, default: 0 },
    status: { type: String, enum: ['submitted', 'verified', 'rejected'], default: 'submitted' },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

// Message Schema (for Teacher-Student communication)
const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderRole: { type: String, enum: ['student', 'teacher', 'admin'], required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
    receiverRole: { type: String, enum: ['student', 'teacher', 'admin'], required: true },
    subject: { type: String, default: '' },
    messageText: { type: String, required: true },
    messageType: { type: String, default: 'text' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    isRead: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Middleware to calculate totalMarks and averageMarks
academicRecordSchema.pre('save', function (next) {
  if (this.subjects && this.subjects.length > 0) {
    const total = this.subjects.reduce((sum, subject) => sum + subject.marks, 0);
    this.totalMarks = total;
    this.averageMarks = parseFloat((total / this.subjects.length).toFixed(2));
  }
  next();
});

// Task Schema
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'completed', 'under_review', 'approved', 'rejected'], default: 'pending' },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    submissionDate: { type: Date }
  },
  { timestamps: true }
);

// Create Models
const Student = mongoose.model('Student', studentSchema);
const AcademicRecord = mongoose.model('AcademicRecord', academicRecordSchema);
const Message = mongoose.model('Message', messageSchema);
const Task = mongoose.model('Task', taskSchema);

// ============ CONTROLLER FUNCTIONS ============

// JWT Token Generator (Simulated)
const generateToken = (userId) => {
  const token = `token_${userId}_${Date.now()}`;
  return token;
};

// ============ AUTH MIDDLEWARE ============

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  
  // In a real app, verify JWT. Here we'll simulate by checking the token format
  const token = authHeader.split(' ')[1];
  try {
    // Extract userId from simulated token "token_ID_timestamp"
    const parts = token.split('_');
    if (parts.length < 3) throw new Error('Invalid token');
    
    const userId = parts[1];
    const user = await Student.findById(userId);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

// Google OAuth Sign-In
const googleSignIn = async (req, res) => {
  try {
    const { googleId, name, email } = req.body;

    if (!googleId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Google ID, name, and email are required',
      });
    }

      // Check if user already exists
      let student = await Student.findOne({ email: email.toLowerCase() });

      if (student) {
        // Enforce Admin Email Restriction
        // User exists and profile is completed
        if (student.profileCompleted) {
          const token = generateToken(student._id);
          return res.status(200).json({
            success: true,
            message: 'Sign in successful',
            data: {
              id: student._id,
              name: student.name,
              email: student.email,
              department: student.department,
              year: student.year,
              role: student.role,
              token,
              isNewUser: false,
            },
          });
        } else {
          // User exists but profile not completed
          const token = generateToken(student._id);
          return res.status(200).json({
            success: true,
            message: 'User needs to complete profile',
            data: {
              id: student._id,
              name: student.name,
              email: student.email,
              token,
              isNewUser: true,
            },
          });
        }
      } else {
        // New user attempted login - REJECT STUDENTS IF NOT IN DB
        return res.status(404).json({
          success: false,
          message: 'Student record not found. Contact administrator.',
        });
      }
  } catch (error) {
    console.error('❌ Google Sign-In Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error during Google sign-in',
      error: error.message,
    });
  }
};

const manualLogin = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if user exists
    const user = await Student.findOne({ email: email.toLowerCase() });

    if (!user) {
      if (role === 'student' || !role) {
        return res.status(404).json({
          success: false,
          message: 'Student record not found. Contact administrator.',
        });
      }
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Debugging Console Logs
    console.log("DB Role:", user.role);
    console.log("Selected Role:", role);

    if (role) {
      const userRole = user.role.toLowerCase();
      const selectedRole = role.toLowerCase();

      if (userRole !== selectedRole) {
        return res.status(403).json({ success: false, message: 'Role mismatch' });
      }
    }

    // Admin Access Check
    if (user.role === 'admin' && role === 'admin') {
      // Allow admin only if role is admin
    } else if (role === 'admin' && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not allowed to access the Admin Panel.' });
    }

    // Verify Password Against DB (Using plaintext since it's seeded as such)
    if (password !== user.password) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    
    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        year: user.year,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error during login', error: error.message });
  }
};

// Complete User Profile after Google Sign-In
const completeGoogleProfile = async (req, res) => {
  try {
    const { userId, department, year } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    if (!department || !year) {
      return res.status(400).json({
        success: false,
        message: 'Department and year are required',
      });
    }

    const student = await Student.findById(userId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update student profile
    student.department = department;
    student.year = year;
    student.profileCompleted = true;

    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Profile completed successfully',
      data: {
        id: student._id,
        name: student.name,
        email: student.email,
        department: student.department,
        year: student.year,
        role: student.role,
      },
    });
  } catch (error) {
    console.error('❌ Complete Profile Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error completing profile',
      error: error.message,
    });
  }
};


const addRecord = async (req, res) => {
  try {
    console.log("📝 AddRecord Request Body:", req.body);

    const { studentId, semester, year, gpa, subjects } = req.body;

    // Validation
    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }
    if (!semester) {
      return res.status(400).json({ success: false, message: 'Semester is required' });
    }
    if (!year) {
      return res.status(400).json({ success: false, message: 'Year is required' });
    }
    if (!gpa) {
      return res.status(400).json({ success: false, message: 'GPA is required' });
    }
    if (!subjects) {
      return res.status(400).json({ success: false, message: 'Subjects are required' });
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ success: false, message: 'Subjects array is required and must not be empty' });
    }

    // Check if studentId is a valid ObjectId before trying to find student
    let student = null;
    try {
      if (mongoose.Types.ObjectId.isValid(studentId)) {
        student = await Student.findById(studentId);
      } else {
        console.log(`⚠️  StudentId "${studentId}" is not a valid ObjectId. Allowing record creation without student reference.`);
      }
    } catch (err) {
      console.log(`⚠️  Could not find student with ID "${studentId}". Proceeding with record creation.`);
    }

    const newRecord = new AcademicRecord({ studentId, semester, year, gpa, subjects });
    await newRecord.save();
    console.log("✅ Record saved:", newRecord._id);

    // Update student GPA if student exists
    if (student) {
      const allRecords = await AcademicRecord.find({ studentId }).sort({ semester: 1 });
      if (allRecords.length > 1) {
        const previousIndex = allRecords.length - 2;
        student.previousGPA = student.currentGPA;
        student.currentGPA = gpa;
        student.velocityScore = parseFloat((gpa - student.previousGPA).toFixed(2));
      } else {
        student.currentGPA = gpa;
      }
      await student.save();
    }

    res.status(201).json({
      success: true,
      message: 'Academic record created successfully',
      data: {
        record: newRecord,
        student: student ? {
          id: student._id,
          name: student.name,
          currentGPA: student.currentGPA,
          velocityScore: student.velocityScore,
        } : null,
      },
    });
  } catch (error) {
    console.error('❌ Error adding record:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error adding academic record',
      error: error.message
    });
  }
};

// Get all records for a student (Supports ID or Email)
const getStudentRecords = async (req, res) => {
  try {
    const { studentId } = req.params;
    let query = {};
    
    // Check if studentId is actually an email or an ID
    if (studentId.includes('@')) {
      query.email = studentId.toLowerCase();
      const student = await Student.findOne({ email: query.email });
      if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
      query = { studentId: student._id };
    } else {
      query = { studentId };
    }

    // Role-based filtering: Student can only see their own records
    if (req.user.role === 'student' && req.user._id.toString() !== (query.studentId.toString() || '')) {
      return res.status(403).json({ success: false, message: 'Access denied to other student records' });
    }

    const records = await AcademicRecord.find({ studentId: query.studentId }).populate('studentId', 'name email department').sort({ semester: 1 });

    res.status(200).json({ success: true, message: 'Records retrieved successfully', count: records.length, data: records });
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ success: false, message: 'Error fetching student records', error: error.message });
  }
};

// Get single record
const getRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const record = await AcademicRecord.findById(recordId).populate('studentId', 'name email department');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.status(200).json({ success: true, message: 'Record retrieved successfully', data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching record', error: error.message });
  }
};

// Update record
const updateRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { semester, year, gpa, subjects, status, remarks } = req.body;

    const record = await AcademicRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    if (semester) record.semester = semester;
    if (year) record.year = year;
    if (gpa) record.gpa = gpa;
    if (subjects) record.subjects = subjects;
    if (status) record.status = status;
    if (remarks) record.remarks = remarks;

    await record.save();
    res.status(200).json({ success: true, message: 'Record updated successfully', data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating record', error: error.message });
  }
};

// Delete record
const deleteRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const record = await AcademicRecord.findByIdAndDelete(recordId);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.status(200).json({ success: true, message: 'Academic record deleted successfully', data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting record', error: error.message });
  }
};

// Get GPA history (Supports ID or Email)
const getGPAHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    let queryId = studentId;

    if (studentId.includes('@')) {
      const student = await Student.findOne({ email: studentId.toLowerCase() });
      if (!student) return res.status(404).json({ success: false, message: 'No GPA history found for this email' });
      queryId = student._id;
    }

    // Security: Student only sees their own history
    if (req.user.role === 'student' && req.user._id.toString() !== queryId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const records = await AcademicRecord.find({ studentId: queryId }).select('semester gpa subjects year').sort({ semester: 1 });

    if (!records || records.length === 0) {
      return res.status(404).json({ success: false, message: 'No GPA history found' });
    }

    const gpaHistory = records.map((record) => ({
      semester: record.semester,
      year: record.year,
      gpa: record.gpa,
      averageMarks: record.averageMarks,
    }));

    const student = await Student.findById(queryId);
    
    res.status(200).json({ 
      success: true, 
      message: 'GPA history retrieved successfully', 
      data: {
        history: gpaHistory,
        velocityScore: student ? student.velocityScore : 0,
        currentGPA: student ? student.currentGPA : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching GPA history', error: error.message });
  }
};

// Get all records (Admin)
const getAllRecords = async (req, res) => {
  try {
    const { semester, year, status } = req.query;
    let query = {};
    if (semester) query.semester = semester;
    if (year) query.year = year;
    if (status) query.status = status;

    const records = await AcademicRecord.find(query).populate('studentId', 'name email department year').sort({ createdAt: -1 });

    res.status(200).json({ success: true, message: 'All records retrieved successfully', count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching records', error: error.message });
  }
};

const getAdminDashboardStats = async (req, res) => {
  try {
    const studentCount = await Student.countDocuments({ role: 'student' });
    const teacherCount = await Student.countDocuments({ role: 'teacher' });
    const students = await Student.find({ role: 'student' });
    
    let totalGPA = 0;
    students.forEach(s => totalGPA += (s.currentGPA || 0));
    const avgInstitutionGPA = studentCount > 0 ? totalGPA / studentCount : 0;

    res.status(200).json({
      success: true,
      data: {
        totalStudents: studentCount,
        totalTeachers: teacherCount,
        avgInstitutionGPA,
        avgGrowthVelocity: 0.15, // Dummy for now
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching admin stats', error: error.message });
  }
};

// ============ MESSAGING CONTROLLERS ============

const sendMessage = async (req, res) => {
  try {
    const { senderId, senderRole, receiverId, receiverRole, subject, messageText, messageType, priority } = req.body;
    const newMessage = new Message({
      senderId, senderRole, receiverId, receiverRole, subject, messageText, messageType, priority
    });
    await newMessage.save();
    res.status(201).json({ success: true, message: 'Message sent successfully', data: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending message', error: error.message });
  }
};

const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    // Get all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 });

    // Group by conversation partner
    const conversations = {};
    messages.forEach(msg => {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversations[partnerId]) {
        conversations[partnerId] = {
          _id: partnerId,
          lastMessage: msg.messageText,
          lastMessageTime: msg.createdAt,
          unreadCount: (msg.receiverId === userId && !msg.isRead) ? 1 : 0
        };
      } else if (msg.receiverId === userId && !msg.isRead) {
        conversations[partnerId].unreadCount++;
      }
    });

    res.status(200).json({ success: true, data: Object.values(conversations) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching conversations', error: error.message });
  }
};

const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    // conversationId is expected to be "id1-id2" sorted
    const [id1, id2] = conversationId.split('-');
    const messages = await Message.find({
      $or: [
        { senderId: id1, receiverId: id2 },
        { senderId: id2, receiverId: id1 }
      ]
    }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching messages', error: error.message });
  }
};

const markConversationAsRead = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    await Message.updateMany(
      { senderId, receiverId, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating messages', error: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await Message.countDocuments({ receiverId: userId, isRead: false });
    res.status(200).json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching unread count', error: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    await Message.findByIdAndDelete(messageId);
    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting message', error: error.message });
  }
};

// ============ STUDENT CONTROLLERS ============

// Get single student
const getStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Security check: Students can only see their own profile
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only view your own profile' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching student', error: error.message });
  }
};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({ role: 'student' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching students', error: error.message });
  }
};

// Create student
const createStudent = async (req, res) => {
  try {
    const { name, email, department, year, role } = req.body;
    
    // Check if email already exists
    const existingStudent = await Student.findOne({ email: email.toLowerCase() });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const newStudent = new Student({
      name,
      email: email.toLowerCase(),
      department,
      year,
      role: role || 'student',
      profileCompleted: true,
    });
    
    await newStudent.save();
    res.status(201).json({ success: true, message: 'Student created successfully', data: newStudent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating student', error: error.message });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { name, email, department, year, role } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (name) student.name = name;
    if (email) student.email = email.toLowerCase();
    if (department) student.department = department;
    if (year) student.year = year;
    if (role) student.role = role;

    await student.save();
    res.status(200).json({ success: true, message: 'Student updated successfully', data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating student', error: error.message });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Delete the student
    const student = await Student.findByIdAndDelete(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Also delete their academic records
    await AcademicRecord.deleteMany({ studentId });

    res.status(200).json({ success: true, message: 'Student and related records deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting student', error: error.message });
  }
};


// ============ TASK CONTROLLERS ============

const createTask = async (req, res) => {
  try {
    const { title, description, deadline, studentId } = req.body;
    const newTask = new Task({
      title,
      description,
      deadline,
      studentId,
      teacherId: req.user._id
    });
    await newTask.save();
    res.status(201).json({ success: true, message: 'Task created', data: newTask });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating task', error: error.message });
  }
};

const getStudentTasks = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tasks = await Task.find({ studentId }).sort({ deadline: 1 });
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching tasks', error: error.message });
  }
};

const markTaskCompleted = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    task.status = 'completed';
    await task.save();
    res.status(200).json({ success: true, message: 'Task marked completed', data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating task', error: error.message });
  }
};

const submitTaskForReview = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    
    task.status = 'under_review';
    task.submissionDate = new Date();
    await task.save();

    // Notification feature (Bonus)
    if (req.user && task.teacherId) {
      const newMessage = new Message({
        senderId: req.user._id,
        senderRole: 'student',
        receiverId: task.teacherId,
        receiverRole: 'teacher',
        subject: 'Task Submitted for Review',
        messageText: `Student ${req.user.name} has submitted the task "${task.title}" for review.`,
        priority: 'high'
      });
      await newMessage.save();
    }
    
    res.status(200).json({ success: true, message: 'Task submitted for review', data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting task', error: error.message });
  }
};

const getTeacherReviews = async (req, res) => {
  try {
    const tasks = await Task.find({ teacherId: req.user._id, status: 'under_review' }).populate('studentId', 'name email').sort({ submissionDate: -1 });
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching reviews', error: error.message });
  }
};

const updateTaskReviewStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body; 
    
    if (!['approved', 'rejected'].includes(status)) {
         return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    
    task.status = status;
    await task.save();

    // Notification feature (Bonus)
    if (req.user && task.studentId) {
       const newMessage = new Message({
         senderId: req.user._id,
         senderRole: req.user.role || 'teacher',
         receiverId: task.studentId,
         receiverRole: 'student',
         subject: `Task Review: ${status === 'approved' ? 'Approved' : 'Rejected'}`,
         messageText: `Your task "${task.title}" has been ${status} by the reviewer.`,
         priority: status === 'rejected' ? 'high' : 'medium'
       });
       await newMessage.save();
    }

    res.status(200).json({ success: true, message: `Task marked as ${status}`, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating task status', error: error.message });
  }
};

// ============ LEADERBOARD & PEER COMPARISON ============

const getLeaderboardAndPeerData = async (req, res) => {
  try {
    // Top 5 students
    const topStudents = await Student.find({ role: 'student', currentGPA: { $gt: 0 } })
      .sort({ currentGPA: -1 })
      .limit(5)
      .select('name currentGPA department year');

    // Aggregate average
    const result = await Student.aggregate([
      { $match: { role: 'student', currentGPA: { $gt: 0 } } },
      { $group: { _id: null, avgGPA: { $avg: '$currentGPA' } } }
    ]);
    const classAverageGPA = result.length > 0 ? parseFloat(result[0].avgGPA.toFixed(2)) : 0;

    res.status(200).json({
      success: true,
      data: {
        topStudents,
        classAverageGPA
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching leaderboard', error: error.message });
  }
};

// ============ ROUTES ============

// Authentication Routes
console.log("🛣️  Registering Auth Routes...");
app.post('/api/auth/google-signin', googleSignIn);
app.post('/api/auth/login', manualLogin);
console.log("✅ Auth Routes Registered: /api/auth/login");
app.post('/api/auth/complete-profile', completeGoogleProfile);

// Student Routes
app.get('/api/students', authenticate, authorize(['admin', 'teacher']), getAllStudents);
app.get('/api/students/:studentId', authenticate, getStudent);
app.post('/api/students', authenticate, authorize(['admin']), createStudent);
app.put('/api/students/:studentId', authenticate, authorize(['admin']), updateStudent);
app.delete('/api/students/:studentId', authenticate, authorize(['admin']), deleteStudent);

// Academic Records Routes
app.post('/api/academic', authenticate, authorize(['admin', 'teacher']), addRecord);
app.get('/api/academic/history/:studentId', authenticate, getGPAHistory);
app.get('/api/academic/student/:studentId', authenticate, getStudentRecords);
app.get('/api/academic/:recordId', authenticate, getRecord);
app.put('/api/academic/:recordId', authenticate, authorize(['admin', 'teacher']), updateRecord);
app.delete('/api/academic/:recordId', authenticate, authorize(['admin']), deleteRecord);
app.get('/api/academic', authenticate, authorize(['admin', 'teacher']), getAllRecords);

// Admin Specific Routes
app.get('/api/admin/dashboard', authenticate, authorize(['admin']), getAdminDashboardStats);

// Messaging Routes
app.post('/api/messages', authenticate, sendMessage);
app.get('/api/messages/conversations/:userId', authenticate, getUserConversations);
app.get('/api/messages/conversation/:conversationId', authenticate, getConversation);
app.put('/api/messages/sender/:senderId/receiver/:receiverId/read', authenticate, markConversationAsRead);
app.get('/api/messages/unread-count/:userId', authenticate, getUnreadCount);
app.delete('/api/messages/:messageId', authenticate, deleteMessage);

// Task Routes
app.post('/api/tasks', authenticate, authorize(['teacher', 'admin']), createTask);
app.get('/api/tasks/student/:studentId', authenticate, getStudentTasks);
app.put('/api/tasks/:taskId/complete', authenticate, authorize(['student', 'teacher', 'admin']), markTaskCompleted);
app.post('/api/tasks/:taskId/apply-review', authenticate, authorize(['student']), submitTaskForReview);
app.get('/api/tasks/teacher/reviews', authenticate, authorize(['teacher', 'admin']), getTeacherReviews);
app.post('/api/tasks/:taskId/update-status', authenticate, authorize(['teacher', 'admin']), updateTaskReviewStatus);

// Analytics / Leaderboard
app.get('/api/analytics/leaderboard', authenticate, getLeaderboardAndPeerData);

// Root Route (for health checks)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SAGVA API is live and running 🚀',
    documentation: 'Check /api/health for detailed status'
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
    mongodbConnected: mongoose.connection.readyState === 1,
  });
});

// Test endpoint to verify frontend-backend connection
app.post('/api/test', (req, res) => {
  console.log("✅ Test request received:", req.body);
  res.status(200).json({
    success: true,
    message: 'Frontend-Backend connection working!',
    receivedData: req.body,
    timestamp: new Date(),
  });
});

// 404 Handler
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found`, 
    method: req.method,
    availableRoutes: [
      '/api/auth/login',
      '/api/auth/google-signin',
      '/api/students',
      '/api/academic',
      '/api/messages',
      '/api/health'
    ] 
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// ============ START SERVER ============
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});

module.exports = app;
