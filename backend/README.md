# SAGVA Backend - Academic Records API

Student Academic Growth Velocity Analyzer Backend with MongoDB Integration

**Single File Server** - All code consolidated in `server.js` for simplicity

## 🚀 Setup Instructions

### 1. Install MongoDB
- **Windows**: Download from [MongoDB Community](https://www.mongodb.com/try/download/community)
- **Mac**: `brew install mongodb-community`
- **Linux**: `sudo apt-get install mongodb`

### 2. Start MongoDB
```bash
# Windows
mongod

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 3. Install Dependencies
```bash
cd backend
npm install
```

### 4. Configure Environment
Edit `.env` file:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sagva
JWT_SECRET=your_secret_key_here
```

### 5. Start Backend Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

---

## 📚 API Endpoints

### Academic Records

#### ✅ Add New Record (POST)
```
POST /api/academic
Content-Type: application/json

{
  "studentId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "semester": 1,
  "year": 2024,
  "gpa": 3.8,
  "subjects": [
    {
      "subjectName": "Data Structures",
      "marks": 85,
      "grade": "A"
    }
  ]
}
```

#### 📖 Get Student Records (GET)
```
GET /api/academic/student/:studentId
```

#### 📊 Get GPA History (GET)
```
GET /api/academic/history/:studentId
```

#### 🔄 Update Record (PUT)
```
PUT /api/academic/:recordId
```

#### 🗑️ Delete Record (DELETE)
```
DELETE /api/academic/:recordId
```

#### 📋 Get All Records (GET)
```
GET /api/academic?semester=1&year=2024&status=submitted
```

---

## 🗄️ Database Schema

### AcademicRecord Collection
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  semester: Number (1-8),
  year: Number,
  gpa: Number (0-4),
  subjects: [
    {
      subjectName: String,
      marks: Number (0-100),
      grade: String
    }
  ],
  totalMarks: Number,
  averageMarks: Number,
  status: String (submitted|verified|rejected),
  remarks: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📁 Backend Structure

```
backend/
├── server.js              # All code in one file
├── .env                   # Environment config
├── .gitignore
├── package.json
├── POSTMAN_COLLECTION.json
└── README.md
```

---

## 🛠️ Available Scripts

```bash
npm start     # Start production server
npm run dev   # Start with nodemon (auto-reload)
npm test      # Run tests
```

---

## 📝 Features

✅ All endpoints in single server.js  
✅ Database connection included  
✅ Schemas & models defined inline  
✅ Controllers & routes integrated  
✅ Auto GPA & velocity calculation  
✅ Error handling & CORS enabled  
✅ MongoDB integration  

---

## 🚀 Start

```bash
npm install
npm run dev
```

API runs on `http://localhost:5000`

Happy Coding! 🚀
