import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { Container, Row, Col, Form } from 'react-bootstrap';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    year: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.year) {
      newErrors.year = 'Year is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Simulate API call
      const userData = {
        id: String(Date.now()),
        name: formData.name,
        email: formData.email,
        department: formData.department,
        year: parseInt(formData.year),
        role: formData.role,
        token: 'dummy-token-' + Date.now(),
      };

      register(userData);
      setAlert({ type: 'success', message: 'Registration successful!' });

      setTimeout(() => {
        navigate('/student-dashboard');
      }, 1000);
    } catch (error) {
      setAlert({ type: 'error', message: 'Registration failed. Please try again.' });
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <Row className="w-100">
        <Col lg={5} md={8} sm={10} className="mx-auto">
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <div className="text-center mb-4">
              <h1 className="h3 fw-bold mb-2">Create Account</h1>
              <p className="text-muted">Sign up to get started with SAGVA</p>
            </div>

            {alert && (
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            )}

            <form onSubmit={handleSubmit}>
              <InputField
                label="Full Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                error={errors.name}
                required
              />

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

              <Row>
                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="department">
                      Department <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      isInvalid={!!errors.department}
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Business Administration">Business Administration</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                    </Form.Select>
                    {errors.department && (
                      <Form.Control.Feedback type="invalid" className="d-block">{errors.department}</Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>

                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="year">
                      Year <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      isInvalid={!!errors.year}
                    >
                      <option value="">Select Year</option>
                      <option value="1">First Year</option>
                      <option value="2">Second Year</option>
                      <option value="3">Third Year</option>
                      <option value="4">Fourth Year</option>
                    </Form.Select>
                    {errors.year && (
                      <Form.Control.Feedback type="invalid" className="d-block">{errors.year}</Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
              </Row>

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

              <InputField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.confirmPassword}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
              >
                Create Account
              </Button>
            </form>

            <div className="text-center mt-4 pt-3 border-top">
              <p className="mb-0">
                Already have an account?{' '}
                <Link to="/login" className="text-primary text-decoration-none fw-bold">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;
