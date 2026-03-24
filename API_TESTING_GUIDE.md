# Google Sign-In API Testing Guide

## Overview
This guide provides detailed test cases and cURL commands for testing the Google Sign-In authentication system.

## Prerequisites
- Backend running on `http://localhost:5000`
- MongoDB connected and running
- cURL installed (or use Postman)

---

## Test Case 1: New User Google Sign-In

### Description
Test registering a brand new user via Google Sign-In.

### Steps
1. Use a Google account that hasn't been registered yet
2. Call the Google Sign-In endpoint
3. Verify user is created with `profileCompleted: false`
4. Call Complete Profile endpoint
5. Verify user now has `profileCompleted: true`

### cURL Commands

**Step 1: Google Sign-In (New User)**
```bash
curl -X POST http://localhost:5000/api/auth/google-signin \
  -H "Content-Type: application/json" \
  -d '{
    "googleId": "110123456789012345678",
    "name": "Alex Johnson",
    "email": "alex.johnson@gmail.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "New user created. Please complete profile",
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Alex Johnson",
    "email": "alex.johnson@gmail.com",
    "token": "token_65a1b2c3d4e5f6g7h8i9j0k1_1234567890",
    "isNewUser": true
  }
}
```

**Step 2: Complete Profile**
```bash
curl -X POST http://localhost:5000/api/auth/complete-profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "department": "CSE",
    "year": "2nd Year"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Profile completed successfully",
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Alex Johnson",
    "email": "alex.johnson@gmail.com",
    "department": "CSE",
    "year": "2nd Year",
    "role": "student"
  }
}
```

---

## Test Case 2: Returning User Google Sign-In

### Description
Test that a returning user with completed profile is logged in directly.

### Steps
1. Use the same Google account from Test Case 1
2. Call Google Sign-In endpoint
3. Verify response returns `isNewUser: false`
4. Verify user data includes department and year
5. No modal should be shown to user

### cURL Command
```bash
curl -X POST http://localhost:5000/api/auth/google-signin \
  -H "Content-Type: application/json" \
  -d '{
    "googleId": "110123456789012345678",
    "name": "Alex Johnson",
    "email": "alex.johnson@gmail.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Sign in successful",
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Alex Johnson",
    "email": "alex.johnson@gmail.com",
    "department": "CSE",
    "year": "2nd Year",
    "role": "student",
    "token": "token_65a1b2c3d4e5f6g7h8i9j0k1_1234567890",
    "isNewUser": false
  }
}
```

---

## Test Case 3: Duplicate Email Error

### Description
Test that a user cannot register with an email already in the system.

### Steps
1. Create a user with email `test@example.com` via Google
2. Prevent registration with a different Google account using same email

### cURL Commands

**Step 1: First user registration**
```bash
curl -X POST http://localhost:5000/api/auth/google-signin \
  -H "Content-Type: application/json" \
  -d '{
    "googleId": "user1123456789",
    "name": "User One",
    "email": "test@example.com"
  }'
```

**Complete the profile:**
```bash
curl -X POST http://localhost:5000/api/auth/complete-profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "department": "IT",
    "year": "1st Year"
  }'
```

**Step 2: Try to register with different Google account, same email**
```bash
curl -X POST http://localhost:5000/api/auth/google-signin \
  -H "Content-Type: application/json" \
  -d '{
    "googleId": "user2987654321",
    "name": "User Two",
    "email": "test@example.com"
  }'
```

**Expected Response (Error):**
```json
{
  "success": false,
  "message": "Email already registered. Please use a different email or sign in with password."
}
```

---

## Test Case 4: Complete Profile - Missing Department

### Description
Test that complete profile endpoint validates required fields.

### cURL Command
```bash
curl -X POST http://localhost:5000/api/auth/complete-profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "year": "2nd Year"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Department and year are required"
}
```

---

## Student Management Endpoints

These routes are protected and require an admin token in the `Authorization: Bearer <token>` header.

### Test Case 5: Create a New Student

**Request**
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token_<adminId>_..." \
  -d '{
    "name": "Test Student",
    "email": "student1@example.com",
    "department": "CSE",
    "year": "1st Year"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "_id": "...",
    "name": "Test Student",
    "email": "student1@example.com",
    "department": "CSE",
    "year": "1st Year",
    "role": "student",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Test Case 6: List All Students

**Request**
```bash
curl -X GET http://localhost:5000/api/students \
  -H "Authorization: Bearer token_<adminId>_..."
```

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "name": "Test Student",
      "email": "student1@example.com",
      "department": "CSE",
      "year": "1st Year",
      "role": "student"
    }
  ]
}
```

### Test Case 7: Get Single Student

**Request**
```bash
curl -X GET http://localhost:5000/api/students/<studentId> \
  -H "Authorization: Bearer token_<adminId>_..."
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Test Student",
    "email": "student1@example.com",
    "department": "CSE",
    "year": "1st Year",
    "role": "student"
  }
}
```

### Test Case 8: Update Student

**Request**
```bash
curl -X PUT http://localhost:5000/api/students/<studentId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token_<adminId>_..." \
  -d '{
    "department": "IT",
    "year": "2nd Year"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": {
    "_id": "...",
    "name": "Test Student",
    "email": "student1@example.com",
    "department": "IT",
    "year": "2nd Year",
    "role": "student"
  }
}
```

### Test Case 9: Delete Student

**Request**
```bash
curl -X DELETE http://localhost:5000/api/students/<studentId> \
  -H "Authorization: Bearer token_<adminId>_..."
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Student deleted successfully",
  "data": {
    "_id": "...",
    "name": "Test Student",
    "email": "student1@example.com",
    "department": "IT",
    "year": "2nd Year",
    "role": "student"
  }
}
```

---

## Test Case 5: Complete Profile - Invalid User ID

### Description
Test that complete profile endpoint handles non-existent users.

### cURL Command
```bash
curl -X POST http://localhost:5000/api/auth/complete-profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "65fffffffffffffffffffff",
    "department": "ECE",
    "year": "3rd Year"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Test Case 6: Department Options Validation

### Description
Test with all available department options.

### Valid Department Values
- CSE
- IT
- ECE
- Mechanical
- Civil
- Other

### cURL Commands

**Test with CSE:**
```bash
curl -X POST http://localhost:5000/api/auth/complete-profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "65a1b2c3d4e5f6g7h8i9j0k3",
    "department": "CSE",
    "year": "1st Year"
  }'
```

**Test with Mechanical:**
```bash
curl -X POST http://localhost:5000/api/auth/complete-profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "65a1b2c3d4e5f6g7h8i9j0k4",
    "department": "Mechanical",
    "year": "4th Year"
  }'
```

---

## Test Case 7: Year Options Validation

### Description
Test with all available year options.

### Valid Year Values
- 1st Year
- 2nd Year
- 3rd Year
- 4th Year

### cURL Examples

**Test with 1st Year:**
```bash
curl -X POST http://localhost:5000/api/auth/complete-profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "65a1b2c3d4e5f6g7h8i9j0k5",
    "department": "ECE",
    "year": "1st Year"
  }'
```

**Test with 4th Year:**
```bash
curl -X POST http://localhost:5000/api/auth/complete-profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "65a1b2c3d4e5f6g7h8i9j0k6",
    "department": "Civil",
    "year": "4th Year"
  }'
```

---

## Test Case 8: Missing Google ID

### Description
Test that Google Sign-In validates required fields.

### cURL Command
```bash
curl -X POST http://localhost:5000/api/auth/google-signin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@gmail.com"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Google ID, name, and email are required"
}
```

---

## Using Postman for Testing

### Alternative to cURL

1. **Open Postman**
2. **Create New Request**
3. **Set Method to POST**
4. **URL:** `http://localhost:5000/api/auth/google-signin`
5. **Headers:** 
   - Key: `Content-Type`
   - Value: `application/json`
6. **Body (Raw JSON):**
```json
{
  "googleId": "110123456789012345678",
  "name": "Test User",
  "email": "testuser@gmail.com"
}
```
7. **Click Send**

---

## Verification Checks

After each test, verify data in MongoDB:

```bash
# Connect to MongoDB
mongo

# Switch to database
use analytics_db

# View all student records
db.students.find()

# View specific user
db.students.findOne({ email: "alex.johnson@gmail.com" })
```

### Fields to Check
- `googleId` - Should be populated
- `authMethod` - Should be "google"
- `profileCompleted` - Should be true after profile completion
- `department` - Should match submitted value
- `year` - Should match submitted value

---

## Error Scenarios Summary

| Scenario | Status Code | Expected Error Message |
|----------|-------------|------------------------|
| Missing googleId | 400 | Google ID, name, and email are required |
| Missing name | 400 | Google ID, name, and email are required |
| Missing email | 400 | Google ID, name, and email are required |
| Duplicate email (different Google account) | 400 | Email already registered... |
| Invalid userId in complete-profile | 404 | User not found |
| Missing department in complete-profile | 400 | Department and year are required |
| Missing year in complete-profile | 400 | Department and year are required |

---

## Performance Testing

### Test Case: Bulk Registration
Create multiple users to test performance:

```bash
#!/bin/bash
# Save as test_bulk_registration.sh

for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/google-signin \
    -H "Content-Type: application/json" \
    -d "{
      \"googleId\": \"user_$i_123456789\",
      \"name\": \"Test User $i\",
      \"email\": \"testuser$i@gmail.com\"
    }"
  echo "User $i created"
done
```

Run with:
```bash
chmod +x test_bulk_registration.sh
./test_bulk_registration.sh
```

---

## Monitoring & Logging

Watch server logs while testing:

```bash
# Terminal 1 - Run Backend
cd backend
npm start

# Terminal 2 - Run Tests
# Run cURL commands here
```

Look for logs like:
- `📨 POST /api/auth/google-signin`
- `✅ Record saved` (for profile completion)

---

## Checklist for Complete Testing

- [ ] Test Case 1: New User Registration
- [ ] Test Case 2: Returning User Login
- [ ] Test Case 3: Duplicate Email Error
- [ ] Test Case 4: Missing Department Validation
- [ ] Test Case 5: Invalid User ID Error
- [ ] Test Case 6: All Department Options
- [ ] Test Case 7: All Year Options
- [ ] Test Case 8: Missing Google ID Validation
- [ ] Verify data in MongoDB for each test
- [ ] Test frontend modal appearance
- [ ] Test frontend modal submission
- [ ] Test redirect to dashboard after login
- [ ] Test returning user doesn't see modal
- [ ] Performance test with bulk registration

---

**All tests completed successfully? You're ready for production!** ✅
