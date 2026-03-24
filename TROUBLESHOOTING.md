# 🔧 Frontend-Backend Connection Troubleshooting Guide

## ✅ Quick Verification Checklist

### 1. **MongoDB is Running**
```bash
mongod
# Should show: waiting for connections on port 27017
```

### 2. **Backend is Running**
```bash
cd backend
npm run dev
# Should show:
# 🚀 Server running on: http://localhost:5000
# ✅ MongoDB connected successfully
```

### 3. **Frontend is Running**
```bash
cd frontend
npm start
# Should open http://localhost:3000
```

---

## 🧪 Test Connection

### Test 1: Check Backend Health
Open browser or terminal:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "mongodbConnected": true
}
```

### Test 2: Test Frontend-Backend Connection
In your browser console (F12):
```javascript
fetch('http://localhost:5000/api/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: 'data' })
})
.then(r => r.json())
.then(data => console.log('✅ Connection works!', data))
.catch(err => console.error('❌ Connection failed:', err));
```

---

## 🐛 Troubleshooting Errors

### Error: "Backend server not running"
**Solution:**
1. Open new terminal
2. Run `mongod`
3. Open another terminal
4. Go to `backend` folder
5. Run `npm run dev`
6. Wait for: `✅ MongoDB connected successfully`
7. Refresh frontend (Ctrl+R)

---

### Error: "Failed to add record"
**Check these in order:**

#### Step 1: Verify Backend is Running
```bash
# In backend folder, check if you see:
🚀 Server running on: http://localhost:5000
✅ MongoDB connected successfully
```

#### Step 2: Check Browser Console (F12)
Look for detailed error:
- `Connect ECONNREFUSED` = Backend not running
- `CORS blocked` = CORS issue
- `Student not found` = StudentId invalid
- `validation error` = Data format issue

#### Step 3: Check Backend Console
Look for logs like:
```
📨 POST /api/academic
📝 AddRecord Request Body: {...}
✅ Record saved: ObjectId(...)
```

---

### Error: "CORS blocked"
**Solution:** Backend CORS is already configured. Just make sure:
1. Backend is running on `http://localhost:5000`
2. Frontend is running on `http://localhost:3000`
3. Both URLs match in backend CORS config

---

### Error: "Student not found"
**Solutions:**
1. **Get Valid StudentId**: First create a student in MongoDB
   ```bash
   mongosh
   use sagva
   db.students.find()
   # Copy the _id field
   ```

2. **Update Frontend**: Use that ID when logged in
   - Login creates a user object with `id` field
   - Make sure this `id` is a valid MongoDB ObjectId

3. **Or**: Update backend to auto-create students (already configured)

---

## 📋 Complete Data Flow

```
Frontend (AddRecordPage)
    ↓
[Validates form data]
    ↓
[Gets user.id from AuthContext]
    ↓
[Sends POST to http://localhost:5000/api/academic]
    ↓
Backend (server.js - addRecord function)
    ↓
[Logs: 📨 POST /api/academic]
[Logs: 📝 AddRecord Request Body]
    ↓
[Validates all fields]
    ↓
[Saves to MongoDB]
    ↓
[Logs: ✅ Record saved]
    ↓
[Returns: {success: true, data: {...}}]
    ↓
Frontend
    ↓
[Shows: "Record added successfully!"]
[Resets form]
```

---

## 🧠 Debug Mode

### Frontend Debugging
Open browser console (F12) to see:
- Request URL
- Request body
- Response status
- Error messages

### Backend Debugging
Check terminal output for logs like:
```
📨 POST /api/academic
📝 AddRecord Request Body: {...}
✅ Record saved: ...
```

---

## 🎯 Complete Working Setup

**Terminal 1 - MongoDB:**
```bash
mongod
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
# Wait for: ✅ MongoDB connected successfully
# You should see:
# 🚀 Server running on: http://localhost:5000
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm start
# Wait for: Compiled successfully!
# Browser opens at http://localhost:3000
```

**Terminal 4 - Test (Optional):**
```bash
curl http://localhost:5000/api/health
# Should return: {"success":true,"message":"Server is running",...}
```

---

## ✅ When Everything Works

You should see:

**Frontend Console:**
```
📤 Sending Data to Backend: {studentId: "...", semester: 1, ...}
✅ Saved Successfully: {success: true, data: {...}}
```

**Backend Console:**
```
📨 POST /api/academic
📝 AddRecord Request Body: {studentId: "...", ...}
✅ Record saved: ObjectId(...)
```

**Browser Alert:**
```
✅ Record added successfully! GPA: 3.8
Form resets
```

**MongoDB:**
```bash
db.academicrecords.findOne() 
# Shows your record with all data
```

---

## 📞 Quick Fixes

| Problem | Fix |
|---------|-----|
| Backend won't start | Install deps: `npm install` |
| Port 5000 in use | Kill process: `lsof -ti:5000 \| xargs kill -9` |
| MongoDB won't connect | Start mongod in separate terminal |
| CORS errors | Restart backend server |
| Blank response | Check if MongoDB is running |
| Form won't submit | Check browser console for errors |

---

## 🚀 Success Indicators

✅ Backend console shows request logs
✅ Frontend console shows success message  
✅ Alert in UI says "Record added successfully!"
✅ MongoDB contains new record
✅ Form resets after submission

If all these happen = **Connection is working perfectly!** 🎉

---

## Need Help?

Check:
1. All three processes running (mongod, backend, frontend)
2. Terminal output for exact error
3. Browser console (F12)
4. Backend terminal logs
5. MongoDB data: `mongosh → use sagva → db.academicrecords.find()`
