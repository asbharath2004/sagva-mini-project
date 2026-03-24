import axios from 'axios';

// For development, use dummy data. In production, update to your API URL
// API URL configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      const { token } = JSON.parse(user);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API Methods
export const studentAPI = {
  // Get all students
  getAllStudents: async () => {
    try {
      const response = await apiClient.get('/students');
      return response.data.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Get single student
  getStudent: async (studentId) => {
    try {
      const response = await apiClient.get(`/students/${studentId}`);
      return response.data.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Create student
  createStudent: async (studentData) => {
    try {
      const response = await apiClient.post('/students', studentData);
      return response.data.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Update student
  updateStudent: async (studentId, studentData) => {
    try {
      const response = await apiClient.put(`/students/${studentId}`, studentData);
      return response.data.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Delete student
  deleteStudent: async (studentId) => {
    try {
      const response = await apiClient.delete(`/students/${studentId}`);
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Get student records
  getStudentRecords: async (studentId) => {
    try {
      const response = await apiClient.get(`/academic/student/${studentId}`);
      return response.data.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },
};

export const recordAPI = {
  // Get all records
  getAllRecords: async () => {
    try {
      const response = await apiClient.get('/academic');
      return response.data.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Add new record
  addRecord: async (recordData) => {
    try {
      const response = await apiClient.post('/academic', recordData);
      return response.data.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Update record
  updateRecord: async (recordId, recordData) => {
    try {
      const response = await apiClient.put(`/academic/${recordId}`, recordData);
      return response.data.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Delete record
  deleteRecord: async (recordId) => {
    try {
      const response = await apiClient.delete(`/academic/${recordId}`);
      return response.data.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },
};

export const analyticsAPI = {
  // Get leaderboard and peer data
  getLeaderboardAndPeerData: async () => {
    try {
      const response = await apiClient.get('/analytics/leaderboard');
      return response.data.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Get student analytics
  getStudentAnalytics: async (studentId) => {
    try {
      const response = await apiClient.get(`/academic/history/${studentId}`);
      if (response.data && response.data.data) {
        const { history, velocityScore } = response.data.data;
        return {
          gpaHistory: history.map(r => ({ semester: `Sem ${r.semester}`, gpa: r.gpa })),
          velocityScore: velocityScore || 0,
          trend: velocityScore > 0 ? 'Improving' : velocityScore < 0 ? 'Declining' : 'Stable',
        };
      }
      return null;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Get department statistics
  getDepartmentStats: async () => {
    try {
      const dummyDepartmentStats = [
        { department: 'Computer Science', avgGPA: 3.6, studentCount: 45 },
        { department: 'Information Technology', avgGPA: 3.5, studentCount: 38 },
        { department: 'Business Administration', avgGPA: 3.3, studentCount: 52 },
        { department: 'Mechanical Engineering', avgGPA: 3.4, studentCount: 40 },
      ];
      return Promise.resolve(dummyDepartmentStats);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Get admin dashboard stats
  getAdminStats: async () => {
    try {
      const [studentsRes] = await Promise.all([
        apiClient.get('/students')
      ]);
      
      const students = studentsRes.data.data || [];
      
      const avgGPA = students.length > 0 ? (students.reduce((acc, s) => acc + (s.currentGPA || 0), 0) / students.length) : 0;
      
      const dummyDepartmentStats = [
        { department: 'Computer Science', avgGPA: 3.6, studentCount: 45 },
        { department: 'Information Technology', avgGPA: 3.5, studentCount: 38 },
      ];

      return {
        totalStudents: students.length,
        avgInstitutionGPA: avgGPA,
        avgGrowthVelocity: 0.15,
        departmentStats: dummyDepartmentStats,
      };
    } catch (error) {
      return Promise.reject(error);
    }
  },
};

export const taskAPI = {
  createTask: async (taskData) => {
    try {
      const response = await apiClient.post('/tasks', taskData);
      return response.data.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getStudentTasks: async (studentId) => {
    try {
      const response = await apiClient.get(`/tasks/student/${studentId}`);
      return response.data.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  markTaskCompleted: async (taskId) => {
    try {
      const response = await apiClient.put(`/tasks/${taskId}/complete`);
      return response.data.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  applyForReview: async (taskId) => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/apply-review`);
      return response.data.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getTeacherReviews: async () => {
    try {
      const response = await apiClient.get('/tasks/teacher/reviews');
      return response.data.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  updateTaskReviewStatus: async (taskId, status) => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/update-status`, { status });
      return response.data.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
};

export default apiClient;
