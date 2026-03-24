import React from 'react';
import { Form } from 'react-bootstrap';

export const InputField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder = '',
  error = '',
  required = false,
  disabled = false,
  helperText = '',
  ...props
}) => {
  return (
    <Form.Group className="mb-3">
      {label && (
        <Form.Label htmlFor={name}>
          {label}
          {required && <span className="text-danger">*</span>}
        </Form.Label>
      )}
      <Form.Control
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        isInvalid={!!error}
        {...props}
      />
      {error && <Form.Control.Feedback type="invalid" className="d-block">{error}</Form.Control.Feedback>}
      {helperText && !error && <Form.Text className="text-muted">{helperText}</Form.Text>}
    </Form.Group>
  );
};

export default InputField;
