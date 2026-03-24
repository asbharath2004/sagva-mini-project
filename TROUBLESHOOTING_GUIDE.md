# Google Sign-In Troubleshooting Guide

## Common Issues & Solutions

### 1. Google Sign-In Button Not Appearing

#### Problem
The "Sign in with Google" button is not visible on the login page.

#### Possible Causes
- `@react-oauth/google` library not installed
- GoogleOAuthProvider not wrapping the component
- Client ID is incorrect

#### Solutions

**Solution 1: Reinstall the library**
```bash
cd frontend
npm uninstall @react-oauth/google
npm install @react-oauth/google
npm start
```

**Solution 2: Check that GoogleOAuthProvider is in place**
In `LoginPage.js`, verify:
```jsx
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

return (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    {/* Rest of component */}
  </GoogleOAuthProvider>
);
```

**Solution 3: Verify Client ID**
Ensure this line is present in `LoginPage.js`:
```javascript
const GOOGLE_CLIENT_ID = '925260695247-s267hf78g9svcna7fm8n6ohc6qf3orip.apps.googleusercontent.com';
```

---

### 2. Google Login Fails Silently

#### Problem
User clicks Google button, but nothing happens or error is not visible.

#### Solution

**Open Browser Console:**
1. Press `F12` or `Right-click → Inspect`
2. Go to "Console" tab
3. Look for error messages
4. Common errors:
   - "Failed to fetch" → Backend not running
   - "CORS error" → Backend CORS not configured
   - "Invalid client ID" → Client ID is wrong

**Check Backend is Running:**
```bash
curl http://localhost:5000/api/health
```

Should respond with:
```json
{
  "success": true,
  "message": "Server is running",
  "mongodbConnected": true
}
```

---

### 3. Modal Doesn't Appear After Google Login

#### Problem
User successfully authenticates with Google but the registration modal is not shown.

#### Possible Causes
- `isNewUser` flag not properly set by backend
- Modal component not imported correctly
- Backend not returning user ID

#### Solutions

**Check Backend Response:**
1. Open browser DevTools → Network tab
2. Look for POST request to `/api/auth/google-signin`
3. Check response in "Response" tab
4. Verify `isNewUser: true` is in response

**Check Modal Component:**
Verify in `LoginPage.js`:
```jsx
import RegistrationModal from '../components/RegistrationModal';
// And later in component:
<RegistrationModal
  show={showRegistrationModal}
  googleUser={googleUser}
  onSubmit={handleRegistrationSubmit}
  isLoading={modalLoading}
/>
```

**Check if User Already Has Profile:**
If you're testing with an existing user:
```bash
# In MongoDB shell
use analytics_db
db.students.findOne({ email: "test@example.com" })
```

Check the `profileCompleted` field:
- If `true`: Modal won't show (this is correct behavior)
- If `false`: Modal should show

---

### 4. "Email Already Registered" Error

#### Problem
User tries to sign in with a different Google account using an email that's already registered.

#### Explanation
This is **expected behavior** to prevent email duplication. Each email can only be registered once.

#### Solution
**Use a different email address** for testing. For example:
- First test: `alex.johnson@gmail.com`
- Second test: `alex.smith@gmail.com`

If you need to test with the same email:
1. Delete the user from MongoDB:
```bash
use analytics_db
db.students.deleteOne({ email: "test@example.com" })
```
2. Try signing in again with a different Google account

---

### 5. MongoDB Connection Error

#### Problem
Backend shows: `❌ MongoDB connection error`

#### Solution

**Check if MongoDB is Running:**

**Windows:**
```bash
# Check if MongoDB service is running
sc query MongoDB

# Start MongoDB service
net start MongoDB

# Or start mongod directly
mongod
```

**macOS/Linux:**
```bash
# Start MongoDB
brew services start mongodb-community

# Or explicitly run
mongod
```

**Verify Connection String:**
Check `.env` file in backend folder:
```plaintext
MONGODB_URI=mongodb://localhost:27017/analytics_db
```

**Test Connection:**
```bash
# In another terminal
mongo mongodb://localhost:27017/analytics_db
```

---

### 6. CORS Error

#### Problem
Browser shows: `Access to XMLHttpRequest blocked by CORS policy`

#### Solution

**Verify Backend CORS Configuration:**
In `backend/server.js`, check:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

**If you're running on a different port:**
Add your port to the `origin` array:
```javascript
origin: ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000', 'http://localhost:3001'],
```

**Restart the backend:**
```bash
npm start
```

---

### 7. Form Validation Not Working

#### Problem
User can click "Continue" without selecting department or year.

#### Solution

**Check RegistrationModal Component:**
Verify validation logic exists:
```jsx
const validateForm = () => {
  const newErrors = {};
  if (!formData.department) {
    newErrors.department = 'Department is required';
  }
  if (!formData.year) {
    newErrors.year = 'Year of Study is required';
  }
  return newErrors;
};
```

**Check if Errors Display:**
Look for this in the modal:
```jsx
{errors.department && (
  <Form.Control.Feedback type="invalid" className="d-block">
    {errors.department}
  </Form.Control.Feedback>
)}
```

---

### 8. User Data Not Saving to Database

#### Problem
Profile completed but data doesn't appear in MongoDB.

#### Solution

**Check API Response:**
1. Open browser DevTools → Network tab
2. Complete the profile in the modal
3. Look for POST to `/api/auth/complete-profile`
4. Check Response - should show `success: true`

**Verify MongoDB:**
```bash
use analytics_db
db.students.find().pretty()
```

**Check Fields Saved:**
```bash
db.students.findOne({ email: "your-email@gmail.com" })
```

Should show:
```json
{
  "department": "CSE",
  "year": "2nd Year",
  "profileCompleted": true,
  "authMethod": "google"
}
```

**If Missing:**
1. Check backend console for errors
2. Verify MongoDB connection is active
3. Ensure User ID passed to backend is valid

---

### 9. Redirect Not Working

#### Problem
After completing profile, user is not redirected to dashboard.

#### Solution

**Check Navigation Logic:**
In `LoginPage.js`, verify:
```jsx
setTimeout(() => {
  navigate('/student-dashboard');
}, 1500);
```

**Verify Route Exists:**
Check `App.js` for:
```jsx
<Route path="/student-dashboard" element={<StudentDashboard />} />
```

**Check Console Errors:**
- Open DevTools → Console
- Look for navigation errors
- May need to log the redirect attempt for debugging

---

### 10. "Continue" Button Keeps Loading

#### Problem
Button shows "Processing..." and never completes.

#### Solution

**Check Network Tab:**
1. Open DevTools → Network
2. Complete the profile form
3. Look for the `/api/auth/complete-profile` request
4. Check if request is hanging or failing

**If Request Hangs:**
- Verify backend is running
- Check if MongoDB is responsive
- Restart backend server

**If Request Fails:**
- Check error response in Network tab
- Verify User ID is correct
- Check all required fields are sent

**Manual Test with cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/complete-profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID_HERE",
    "department": "CSE",
    "year": "2nd Year"
  }'
```

---

### 11. Logout Not Working

#### Problem
Logout doesn't clear user data or redirect.

#### Solution

**Check Logout Function:**
In `AuthContext.js`, verify:
```jsx
const logout = () => {
  setUser(null);
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};
```

**Clear Browser Storage Manually:**
1. Open DevTools → Application
2. Storage → Local Storage
3. Clear all entries for localhost
4. Refresh page

---

### 12. Multiple Modals Appearing

#### Problem
Registration modal appears multiple times.

#### Possible Cause
Modal state is not being properly closed.

#### Solution

**Check Modal Close Logic:**
In `LoginPage.js`:
```jsx
setShowRegistrationModal(false);
```

**Verify State Reset:**
```jsx
setTimeout(() => {
  setShowRegistrationModal(false);
  navigate('/student-dashboard');
}, 1500);
```

---

## Diagnostic Checklist

When troubleshooting, check these in order:

1. **Frontend Running?**
   - [ ] Can access http://localhost:3000
   - [ ] No JavaScript errors in console

2. **Backend Running?**
   - [ ] Can access http://localhost:5000/api/health
   - [ ] Shows `mongodbConnected: true`

3. **MongoDB Running?**
   - [ ] `mongod` is running
   - [ ] Can connect via `mongo` command

4. **Google Library Installed?**
   - [ ] `npm list @react-oauth/google` shows package
   - [ ] No import errors in console

5. **Components Exist?**
   - [ ] RegistrationModal.js exists
   - [ ] RegistrationModal.css exists
   - [ ] Both are imported correctly

6. **API Routes Exist?**
   - [ ] Backend has `/api/auth/google-signin` route
   - [ ] Backend has `/api/auth/complete-profile` route

7. **Data Structure Correct?**
   - [ ] MongoDB student schema updated
   - [ ] New fields: googleId, authMethod, profileCompleted

---

## Getting Help

If issues persist:

1. **Check Browser Console:**
   - Right-click → Inspect → Console tab
   - Screenshot any red errors

2. **Check Backend logs:**
   ```bash
   cd backend
   npm start 2>&1 | tee backend.log
   ```
   - Look for error messages

3. **Check MongoDB:**
   ```bash
   use analytics_db
   db.students.find().count()
   ```
   - Verify data exists

4. **Re-read Documentation:**
   - GOOGLE_SIGNIN_IMPLEMENTATION.md
   - GOOGLE_SIGNIN_QUICKSTART.md
   - API_TESTING_GUIDE.md

---

## Clean Start (If All Else Fails)

```bash
# 1. Stop all running services
# (Press Ctrl+C in all terminals)

# 2. Clear browser data
# DevTools → Application → Storage → Clear All

# 3. Clear MongoDB
mongo
use analytics_db
db.students.deleteMany({})
exit

# 4. Reinstall dependencies
cd frontend
rm -rf node_modules
npm install @react-oauth/google

cd ../backend
npm install

# 5. Restart everything
# Terminal 1
mongod

# Terminal 2
cd backend && npm start

# Terminal 3
cd frontend && npm start
```

---

**Still stuck?** Review the error message carefully and cross-reference with this guide! 🚀
