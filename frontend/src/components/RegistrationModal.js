import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import '../styles/RegistrationModal.css';

export const RegistrationModal = ({ show, googleUser, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    department: '',
    year: '',
  });
  const [errors, setErrors] = useState({});

  const departments = ['CSE', 'IT', 'ECE', 'Mechanical', 'Civil', 'Other'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

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

  const handleInputChange = (e) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Call parent onSubmit with form data
    onSubmit({
      name: googleUser?.name || '',
      email: googleUser?.email || '',
      department: formData.department,
      year: formData.year,
    });
  };

  return (
    <Modal show={show} backdrop="static" keyboard={false} centered className="registration-modal">
      <Modal.Header className="registration-modal-header">
        <Modal.Title className="registration-modal-title">
          Complete Your Antigravity Profile
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="registration-modal-body">
        <div className="user-info-section">
          <div className="user-info-item">
            <label className="user-info-label">Name</label>
            <p className="user-info-value">{googleUser?.name || 'N/A'}</p>
          </div>
          <div className="user-info-item">
            <label className="user-info-label">Email</label>
            <p className="user-info-value">{googleUser?.email || 'N/A'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="department" className="form-label-custom">
              Department <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className={errors.department ? 'is-invalid' : ''}
              disabled={isLoading}
            >
              <option value="">Select your department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </Form.Select>
            {errors.department && (
              <Form.Control.Feedback type="invalid" className="d-block">
                {errors.department}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label htmlFor="year" className="form-label-custom">
              Year of Study <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className={errors.year ? 'is-invalid' : ''}
              disabled={isLoading}
            >
              <option value="">Select your year</option>
              {years.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </Form.Select>
            {errors.year && (
              <Form.Control.Feedback type="invalid" className="d-block">
                {errors.year}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Button
            type="submit"
            className="registration-continue-btn"
            disabled={isLoading}
            style={{
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Processing...' : 'Continue'}
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default RegistrationModal;
