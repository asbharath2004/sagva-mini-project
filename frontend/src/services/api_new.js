import axios from 'axios';

// For development, use dummy data. In production, update to your API URL
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

// ==================== ATTENDANCE API ====================
export const attendanceAPI = {
  // Mark attendance
  markAttendance: async (attendanceData) => {
    try {
      const response = await apiClient.post('/attendance/mark', attendanceData);
      return response.data.data;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  },

  // Get student attendance
  getStudentAttendance: async (studentId, semester, year) => {
    try {
      const response = await apiClient.get(`/attendance/student/${studentId}`, {
        params: { semester, year }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  },

  // Get attendance summary
  getAttendanceSummary: async (studentId, semester, year) => {
    try {
      const response = await apiClient.get(`/attendance/summary/${studentId}`, {
        params: { semester, year }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching summary:', error);
      throw error;
    }
  },

  // Get low attendance students
  getLowAttendanceStudents: async (threshold = 75) => {
    try {
      const response = await apiClient.get('/attendance/low-attendance', {
        params: { threshold }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching low attendance:', error);
      throw error;
    }
  },

  // Get daily summary
  getDailySummary: async (date) => {
    try {
      const response = await apiClient.get('/attendance/daily-summary', {
        params: { date }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching daily summary:', error);
      throw error;
    }
  },

  // Get weekly trend
  getWeeklyTrend: async (startDate) => {
    try {
      const response = await apiClient.get('/attendance/weekly-trend', {
        params: { startDate }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching weekly trend:', error);
      throw error;
    }
  },

  // Get monthly average
  getMonthlyAverage: async (year, month) => {
    try {
      const response = await apiClient.get('/attendance/monthly-avg', {
        params: { year, month }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching monthly average:', error);
      throw error;
    }
  },

  // Get department comparison
  getDepartmentComparison: async (days = 7) => {
    try {
      const response = await apiClient.get('/attendance/department-comparison', {
        params: { days }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching department comparison:', error);
      throw error;
    }
  },

  // Create daily summary
  createDailySummary: async (summaryData) => {
    try {
      const response = await apiClient.post('/attendance/create-daily-summary', summaryData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating summary:', error);
      throw error;
    }
  }
};

// ==================== MESSAGE API ====================
export const messageAPI = {
  // Send message
  sendMessage: async (messageData) => {
    try {
      const response = await apiClient.post('messages', messageData);
      return response.data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get user messages
  getUserMessages: async (userId, isRead, messageType) => {
    try {
      const response = await apiClient.get(`messages/${userId}`, {
        params: { isRead, messageType }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Get conversations
  getUserConversations: async (userId) => {
    try {
      const response = await apiClient.get(`messages/conversations/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  // Get inbox
  getInbox: async (userId, unreadOnly = false) => {
    try {
      const response = await apiClient.get(`/messages/inbox/${userId}`, {
        params: { unreadOnly }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching inbox:', error);
      throw error;
    }
  },

  // Get conversation thread
  getConversation: async (conversationId) => {
    try {
      const response = await apiClient.get(`messages/conversation/${conversationId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  },

  // Get unread count
  getUnreadCount: async (userId) => {
    try {
      const response = await apiClient.get(`messages/unread-count/${userId}`);
      return response.data.data.unreadCount;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  // Mark as read
  markAsRead: async (messageId) => {
    try {
      const response = await apiClient.put(`/messages/${messageId}/read`);
      return response.data.data;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  },

  // Mark conversation as read
  markConversationAsRead: async (senderId, receiverId) => {
    try {
      const response = await apiClient.put(`messages/sender/${senderId}/receiver/${receiverId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  },

  // Delete message
  deleteMessage: async (messageId) => {
    try {
      const response = await apiClient.delete(`/messages/${messageId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  // Get high priority messages
  getHighPriorityMessages: async (userId) => {
    try {
      const response = await apiClient.get(`/messages/priority/high/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching high priority messages:', error);
      throw error;
    }
  }
};

// ==================== RISK ANALYTICS API ====================
export const riskAnalyticsAPI = {
  // Calculate risk score
  calculateRiskScore: async (studentId, riskData) => {
    try {
      const response = await apiClient.post(`/risk-analytics/calculate/${studentId}`, riskData);
      return response.data.data;
    } catch (error) {
      console.error('Error calculating risk:', error);
      throw error;
    }
  },

  // Get student risk
  getStudentRisk: async (studentId) => {
    try {
      const response = await apiClient.get(`/risk-analytics/${studentId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching student risk:', error);
      throw error;
    }
  },

  // Get students by risk level
  getStudentsByRiskLevel: async (riskLevel) => {
    try {
      const response = await apiClient.get(`/risk-analytics/level/${riskLevel}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching students by risk level:', error);
      throw error;
    }
  },

  // Get at-risk students
  getAtRiskStudents: async () => {
    try {
      const response = await apiClient.get('/risk-analytics/at-risk/all');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching at-risk students:', error);
      throw error;
    }
  },

  // Get students needing review
  getStudentsNeedingReview: async () => {
    try {
      const response = await apiClient.get('/risk-analytics/needs-review');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching students needing review:', error);
      throw error;
    }
  },

  // Start intervention
  startIntervention: async (studentId, notes = '') => {
    try {
      const response = await apiClient.put(`/risk-analytics/${studentId}/intervention`, { notes });
      return response.data.data;
    } catch (error) {
      console.error('Error starting intervention:', error);
      throw error;
    }
  },

  // Get institution overview
  getInstitutionOverview: async () => {
    try {
      const response = await apiClient.get('/risk-analytics/institution/overview');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching institution overview:', error);
      throw error;
    }
  },

  // Update teacher notes
  updateTeacherNotes: async (studentId, notes) => {
    try {
      const response = await apiClient.put(`/risk-analytics/${studentId}/notes`, { notes });
      return response.data.data;
    } catch (error) {
      console.error('Error updating notes:', error);
      throw error;
    }
  },

  // Get full risk profile
  getFullRiskProfile: async (studentId) => {
    try {
      const response = await apiClient.get(`/risk-analytics/${studentId}/full-profile`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching full risk profile:', error);
      throw error;
    }
  },

  // Batch calculate risk
  batchCalculateRisk: async () => {
    try {
      const response = await apiClient.post('/risk-analytics/batch-calculate');
      return response.data.data;
    } catch (error) {
      console.error('Error batch calculating risk:', error);
      throw error;
    }
  }
};

// ==================== TEACHER API ====================
export const teacherAPI = {
  // Get teacher dashboard
  getDashboard: async (semester, year, sortBy = 'name', orderBy = 'asc') => {
    try {
      const response = await apiClient.get('/teacher/dashboard', {
        params: { semester, year, sortBy, orderBy }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching teacher dashboard:', error);
      throw error;
    }
  },

  // Get at-risk students
  getAtRiskStudents: async (semester, year) => {
    try {
      const response = await apiClient.get('/teacher/students/at-risk', {
        params: { semester, year }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching at-risk students:', error);
      throw error;
    }
  },

  // Get low attendance students
  getLowAttendanceStudents: async (threshold = 75, semester, year) => {
    try {
      const response = await apiClient.get('/teacher/students/low-attendance', {
        params: { threshold, semester, year }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching low attendance:', error);
      throw error;
    }
  },

  // Get performance analytics
  getPerformanceAnalytics: async (semester, year) => {
    try {
      const response = await apiClient.get('/teacher/performance-analytics', {
        params: { semester, year }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching performance analytics:', error);
      throw error;
    }
  },

  // Get unread message count
  getUnreadMessageCount: async (teacherId) => {
    try {
      const response = await apiClient.get(`/teacher/messages/unread/${teacherId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  // Get student summary
  getStudentSummary: async (studentId, semester, year) => {
    try {
      const response = await apiClient.get(`/teacher/student/${studentId}/summary`, {
        params: { semester, year }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching student summary:', error);
      throw error;
    }
  }
};

// ==================== ADMIN API ====================
export const adminAPI = {
  // Get dashboard
  getDashboard: async (year) => {
    try {
      const response = await apiClient.get('/admin/dashboard', {
        params: { year }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
      throw error;
    }
  },

  // Get department ranking
  getDepartmentRanking: async (year) => {
    try {
      const response = await apiClient.get('/admin/department-ranking', {
        params: { year }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching department ranking:', error);
      throw error;
    }
  },

  // Get attendance overview
  getAttendanceOverview: async (year, semester) => {
    try {
      const response = await apiClient.get('/admin/attendance-overview', {
        params: { year, semester }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching attendance overview:', error);
      throw error;
    }
  },

  // Get semester comparison
  getSemesterComparison: async (year) => {
    try {
      const response = await apiClient.get('/admin/semester-comparison', {
        params: { year }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching semester comparison:', error);
      throw error;
    }
  },

  // Get subject performance
  getSubjectPerformance: async (year) => {
    try {
      const response = await apiClient.get('/admin/subject-performance', {
        params: { year }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching subject performance:', error);
      throw error;
    }
  },

  // Get top performers
  getTopPerformers: async (limit = 10, year) => {
    try {
      const response = await apiClient.get('/admin/top-performers', {
        params: { limit, year }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching top performers:', error);
      throw error;
    }
  },

  // Get growth analysis
  getGrowthAnalysis: async (year) => {
    try {
      const response = await apiClient.get('/admin/growth-analysis', {
        params: { year }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching growth analysis:', error);
      throw error;
    }
  }
};

export default apiClient;
