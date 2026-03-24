# 🚀 Deployment Guide for Render

This project is now configured for deployment on **Render**. Follow these steps to take your project online.

## 1. Prepare your GitHub Repository
Ensure your project is uploaded to a GitHub repository with the following structure:
```
Your-Repo-Name/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── ...
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
└── ...
```

---

## 2. Deploy Backend (Node.js Web Service)
1. Log in to [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Configure the service:
   - **Name**: `sagva-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Add Environment Variables**:
   Under the "Environment" tab, add:
   - `MONGODB_URI`: `mongodb+srv://asbharath13_db_user:Bharath_2004@cluster0.megsqkd.mongodb.net/analytics_db`
   - `JWT_SECRET`: `something_random_and_secure`
   - `NODE_ENV`: `production`

---

## 3. Deploy Frontend (Static Site)
1. Click **New +** and select **Static Site**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name**: `sagva-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `build`
4. **Add Environment Variables**:
   Under the "Environment" tab, add:
   - `REACT_APP_API_URL`: `https://YOUR-BACKEND-NAME.onrender.com/api`
   - `REACT_APP_GOOGLE_CLIENT_ID`: `925260695247-s267hf78g9svcna7fm8n6ohc6qf3orip.apps.googleusercontent.com`

---

## 4. Final Verification
- Once both are deployed, open your frontend URL.
- Try logging in with:
  - **Email**: `student1@example.com`
  - **Password**: `password123`
- Check the **Health Check** endpoint: `https://YOUR-BACKEND.onrender.com/api/health`

**Note**: Render's free tier "sleeps" when inactive. The first load after a period of inactivity may take ~30 seconds.
