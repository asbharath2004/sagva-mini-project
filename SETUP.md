# 🚀 SAGVA MERN Complete Setup Guide

## System Requirements
- Node.js 14+ 
- MongoDB 4.4+
- npm or yarn

---

## 📦 Quick Start Installation

### Terminal 1: Start MongoDB
```bash
mongod
```

### Terminal 2: Setup & Start Backend
```bash
cd backend
npm install
npm run dev
```

Expected:
```
🚀 Server running on: http://localhost:5000
✅ MongoDB connected successfully
```

### Terminal 3: Setup & Start Frontend
```bash
cd frontend
npm install
npm start
```

Opens at: `http://localhost:3000`

---

## ✅ Testing the Flow

### 1. Login
- Go to `http://localhost:3000/login`
- Email: `john@example.com` (or any email)
- Password: anything
- Role: `student`
- Click Login

### 2. Add Academic Record
- Click "Add Academic Record" in sidebar
- Fill in:
  - Semester: `1`
  - Subject 1: "Data Structures", Marks: `85`
  - Subject 2: "Algorithms", Marks: `90`
- Click "Submit Record"

### 3. Verify MongoDB
Open new terminal:
```bash
mongosh
use sagva
db.academicrecords.find().pretty()
```

You should see your saved record!

---

## 🔧 Configuration

### Backend `.env` (Already Created)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sagva
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
```

---

## 📚 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/academic` | Add new record ✅ |
| `GET` | `/api/academic/student/:studentId` | Get student records |
| `GET` | `/api/academic/history/:studentId` | Get GPA history |
| `PUT` | `/api/academic/:recordId` | Update record |
| `DELETE` | `/api/academic/:recordId` | Delete record |
| `GET` | `/api/academic` | Get all records |

---

## 📊 MongoDB Collections

### academicrecords
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  semester: Number,
  year: Number,
  gpa: Number,
  subjects: [
    {
      subjectName: String,
      marks: Number,
      grade: String
    }
  ],
  totalMarks: Number,
  averageMarks: Number,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB Connection Error | Run `mongod` in separate terminal |
| Port 5000 in use | Change PORT in `.env` |
| Cannot POST /api/academic | Backend not running - check `npm run dev` |
| Module not found | Run `npm install` in both backend & frontend |

---

## 📁 Backend Structure

```
backend/
├── server.js               # 🎯 All code in one file
├── .env                    # Environment config
├── package.json
├── POSTMAN_COLLECTION.json # API collection for testing
└── README.md
```

**Why single file?**
- Simple & easy to understand
- No file dependencies
- Perfect for MERN projects
- All routes, models, controllers in one place

---

## 📁 Frontend Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   ├── context/AuthContext.js
│   ├── layouts/
│   ├── pages/
│   │   ├── AddRecordPage.js    # ✅ Updated for MongoDB
│   │   └── ...
│   ├── services/
│   ├── App.js
│   └── index.js
└── package.json
```

---

## 🎯 What's Implemented

✅ Express.js Backend with MongoDB  
✅ Academic Record CRUD Operations  
✅ Auto GPA & Velocity Calculation  
✅ Form Validation & Error Handling  
✅ Proper Response Formatting  
✅ Frontend Integration  
✅ Postman Collection for Testing  
✅ All code in single server.js

---

## 💡 Key Points

- **Single server.js** - No separate files
- **Real MongoDB** - All data stored in MongoDB
- **MERN Stack** - Full backend-frontend integration
- **Auto-calculation** - GPA, velocity, marks auto-computed
- **Clean architecture** - All logic consolidated

---

## 🔄 Data Flow

1. **User Login** → Creates user object with ID
2. **Add Record Form** → Fills semester & subjects
3. **Submit** → Sends to `POST /api/academic` with user.id as studentId
4. **Backend** → Validates, calculates GPA, saves to MongoDB
5. **Database** → Record stored with timestamps
6. **Response** → Frontend shows success message

---

## 📞 API Usage Example

### Add Record
```javascript
const recordData = {
  studentId: "65a1b2c3d4e5f6g7h8i9j0k1",  // User ID
  semester: 1,
  year: 2024,
  gpa: 3.8,
  subjects: [
    { subjectName: "Data Structures", marks: 85, grade: "A" },
    { subjectName: "Algorithms", marks: 90, grade: "A" }
  ]
};

await axios.post('http://localhost:5000/api/academic', recordData);
```

### Response
```json
{
  "success": true,
  "message": "Academic record created successfully",
  "data": {
    "record": { ... },
    "student": {
      "id": "...",
      "currentGPA": 3.8,
      "velocityScore": 0.2
    }
  }
}
```

---

## 🚀 Production Deployment

When deploying:
1. Update MONGODB_URI to production database
2. Change NODE_ENV to 'production'
3. Update JWT_SECRET with secure key
4. Update frontend API_URL to production backend
5. Enable HTTPS
6. Add authentication middleware

---

## 📖 Additional Resources

- Backend README: `backend/README.md`
- Frontend README: `frontend/README.md`
- **Troubleshooting**: `TROUBLESHOOTING.md` 🔧
- Postman Collection: `backend/POSTMAN_COLLECTION.json`
- MongoDB Docs: https://docs.mongodb.com
- Express Docs: https://expressjs.com
- React Docs: https://react.dev

---

Happy Coding! 🚀

This is a clean, simplified MERN setup with all backend code in server.js!
