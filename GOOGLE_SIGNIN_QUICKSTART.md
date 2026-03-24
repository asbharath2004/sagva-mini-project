# Google Sign-In Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB running locally or a MongoDB connection string
- A web browser with Google account (for testing)

## Installation Steps

### Step 1: Install Frontend Dependencies
```bash
cd frontend
npm install @react-oauth/google
```

### Step 2: Verify Backend is Updated
The backend has been automatically updated with:
- New Student schema fields (googleId, authMethod, profileCompleted)
- Two new API endpoints for Google authentication

### Step 3: Start MongoDB
```bash
# On Windows (if MongoDB is installed)
net start MongoDB

# Or run mongod directly
mongod
```

### Step 4: Start the Backend Server
```bash
cd backend
npm start
```
You should see: `Server running on http://localhost:5000`

### Step 5: Start the Frontend Application
```bash
# In a new terminal
cd frontend
npm start
```
The app will open at `http://localhost:3000`

## Testing the Implementation

### Test 1: Sign In with Google (New User)
1. Go to login page
2. Click the **"Sign in with Google"** button
3. Sign in with your Google account
4. A **"Complete Your Antigravity Profile"** modal will appear
5. Fill in:
   - Department: Select "CSE" (or any option)
   - Year: Select "2nd Year" (or any option)
6. Click **"Continue"**
7. You should be redirected to the student dashboard
8. ✅ Success! User is now registered

### Test 2: Sign In Again (Returning User)
1. Logout (if logged in)
2. Click the **"Sign in with Google"** button
3. Sign in with the **same Google account**
4. ✅ You should be logged in directly WITHOUT the modal
5. Redirected to student dashboard

### Test 3: Form Validation
1. Click "Sign in with Google"
2. Try to submit the modal WITHOUT selecting department or year
3. ✅ You should see error messages

## File Structure

**New Files Created:**
```
frontend/src/components/RegistrationModal.js       (Modal Component)
frontend/src/styles/RegistrationModal.css          (Modal Styling)
```

**Modified Files:**
```
frontend/src/pages/LoginPage.js                    (Added Google Button)
frontend/src/context/AuthContext.js                (Enhanced auth handling)
frontend/src/components/index.js                   (Added export)
backend/server.js                                  (Added auth routes)
```

## API Endpoints

### 1. Google Sign-In
**Endpoint:** `POST http://localhost:5000/api/auth/google-signin`

**Request Body:**
```json
{
  "googleId": "unique_google_id",
  "name": "User Name",
  "email": "user@gmail.com"
}
```

**Sample cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/google-signin \
  -H "Content-Type: application/json" \
  -d '{
    "googleId": "123456789",
    "name": "John Doe",
    "email": "john@gmail.com"
  }'
```

### 2. Complete Profile
**Endpoint:** `POST http://localhost:5000/api/auth/complete-profile`

**Request Body:**
```json
{
  "userId": "mongodb_user_id",
  "department": "CSE",
  "year": "2nd Year"
}
```

**Sample cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/complete-profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "65a1b2c3d4e5f6g7h8i9j0k",
    "department": "CSE",
    "year": "2nd Year"
  }'
```

## User Flow

```
1. User sees Login Page
   ↓
2. Clicks "Sign in with Google"
   ↓
3. Google OAuth Dialog appears
   ↓
4. User authenticates with Google
   ↓
5. System checks if user exists
   ├─ YES: Check if profile completed
   │  ├─ YES: Login directly → Dashboard
   │  └─ NO: Show Modal → Complete Profile → Dashboard
   └─ NO: Create User → Show Modal → Complete Profile → Dashboard
```

## Data Saved After Registration

When a user completes Google Sign-In, the following data is saved in MongoDB:

```
{
  "_id": "ObjectId",
  "name": "User's Name (from Google)",
  "email": "user@gmail.com",
  "googleId": "unique_google_id",
  "department": "CSE",
  "year": "2nd Year",
  "authMethod": "google",
  "profileCompleted": true,
  "role": "student",
  "currentGPA": 0,
  "previousGPA": 0,
  "velocityScore": 0,
  "createdAt": "2024-03-08T10:30:00Z",
  "updatedAt": "2024-03-08T10:35:00Z"
}
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Google button not showing | Ensure npm install was run for `@react-oauth/google` |
| Modal not appearing after Google login | Check browser console for errors; verify backend response |
| "Email already registered" error | You're trying to use a different Google account with the same email |
| CORS errors | Backend CORS is configured for localhost - update for production |
| MongoDB connection error | Ensure mongod is running |

## What's Next?

1. **Test with real Google accounts** (different accounts for new/returning user tests)
2. **Check MongoDB** to verify user data is being saved correctly
3. **Customize styling** if needed (modal colors, fonts, etc.)
4. **Add email verification** (optional enhancement)
5. **Deploy** to production (update Google OAuth credentials for your domain)

## Credentials Used

**Google Client ID:**
```
925260695247-s267hf78g9svcna7fm8n6ohc6qf3orip.apps.googleusercontent.com
```

## Support & Documentation

For detailed implementation info, see: `GOOGLE_SIGNIN_IMPLEMENTATION.md`

---

**Ready to test!** 🚀

Next Step: Open http://localhost:3000 and click "Sign in with Google"
