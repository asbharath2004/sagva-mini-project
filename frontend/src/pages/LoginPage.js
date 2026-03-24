import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import Alert from '../components/Alert';
import InputField from '../components/InputField';
import RegistrationModal from '../components/RegistrationModal';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student',
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Google Sign-In states
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      if (response.data.success) {
        login(response.data.data);
        setAlert({ type: 'success', message: 'Login successful!' });

        // Redirect based on role
        setTimeout(() => {
          if (response.data.data.role === 'teacher') {
            navigate('/teacher-dashboard');
          } else if (response.data.data.role === 'admin') {
            navigate('/admin-panel');
          } else {
            navigate('/student-dashboard');
          }
        }, 1000);
      }
    } catch (error) {
      setLoading(false);
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      });
    }
  };

  // Google Sign-In handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const token = credentialResponse.credential;
      
      // Decode JWT to get user info (simple decode without verification)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const googleData = JSON.parse(jsonPayload);

      // Send to backend for verification and user creation/check
      const response = await axios.post(`${API_BASE_URL}/auth/google-signin`, {
        googleId: googleData.sub,
        name: googleData.name,
        email: googleData.email,
      });

      const { data } = response;

      if (data.success) {
        if (data.data.isNewUser) {
          // Show registration modal for new users
          setGoogleUser({
            name: data.data.name,
            email: data.data.email,
          });
          setUserId(data.data.id);
          setShowRegistrationModal(true);
        } else {
          // Directly log in existing users
          const userData = {
            id: data.data.id,
            email: data.data.email,
            name: data.data.name,
            department: data.data.department,
            year: data.data.year,
            role: data.data.role,
            token: data.data.token,
            authMethod: 'google',
          };

          login(userData);
          setAlert({ type: 'success', message: 'Welcome back!' });

          setTimeout(() => {
            navigate('/student-dashboard');
          }, 1000);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error('Google Sign-In Error:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Google sign-in failed. Please try again.',
      });
    }
  };

  const handleGoogleError = () => {
    setAlert({
      type: 'error',
      message: 'Google Sign-In failed. Please try again.',
    });
  };

  // Handle registration modal submission
  const handleRegistrationSubmit = async (profileData) => {
    try {
      setModalLoading(true);

      // Send profile completion to backend
      const response = await axios.post(`${API_BASE_URL}/auth/complete-profile`, {
        userId,
        department: profileData.department,
        year: profileData.year,
      });

      if (response.data.success) {
        const userData = {
          id: response.data.data.id,
          email: response.data.data.email,
          name: response.data.data.name,
          department: response.data.data.department,
          year: response.data.data.year,
          role: response.data.data.role,
          authMethod: 'google',
        };

        login(userData);
        setAlert({ type: 'success', message: 'Profile completed! Welcome to Antigravity!' });

        // Close modal and redirect
        setShowRegistrationModal(false);
        setModalLoading(false);

        setTimeout(() => {
          navigate('/student-dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Profile Completion Error:', error);
      setModalLoading(false);
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Error completing profile. Please try again.',
      });
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
        <Row className="w-100">
          <Col lg={5} md={8} sm={10} className="mx-auto">
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="text-center mb-4">
                <h1 className="h3 fw-bold mb-2">Welcome Back</h1>
                <p className="text-muted">Sign in to your account to continue</p>
              </div>

              {alert && (
                <Alert
                  type={alert.type}
                  message={alert.message}
                  onClose={() => setAlert(null)}
                />
              )}

              {/* Google Sign-In Button */}
              <div className="mb-4">
                <div className="d-flex justify-content-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    size="large"
                    width="100%"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="d-flex align-items-center my-4">
                <hr className="flex-grow-1" />
                <span className="mx-3 text-muted text-sm">OR</span>
                <hr className="flex-grow-1" />
              </div>

              {/* Email/Password Sign-In */}
              <form onSubmit={handleSubmit}>
                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  error={errors.email}
                  required
                />

                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  error={errors.password}
                  required
                />

                <Form.Group className="mb-3">
                  <Form.Label htmlFor="role">
                    Role <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="admin">Admin</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </Form.Select>
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="text-center mt-4 pt-3 border-top">
                <p className="mb-0">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary text-decoration-none fw-bold">
                    Create one now
                  </Link>
                </p>
              </div>

              {/* Demo credentials info */}
              <div className="mt-4 p-3 bg-light rounded">
                <p className="mb-2 fw-bold text-sm">Demo Credentials:</p>
                <ul className="mb-0 ps-3">
                  <li>Email: demo@example.com</li>
                  <li>Password: password123</li>
                </ul>
              </div>
            </div>
          </Col>
        </Row>

        {/* Registration Modal */}
        <RegistrationModal
          show={showRegistrationModal}
          googleUser={googleUser}
          onSubmit={handleRegistrationSubmit}
          isLoading={modalLoading}
        />
      </Container>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;

