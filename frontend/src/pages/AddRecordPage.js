import React, { useState } from "react";
import axios from "axios";
import { Plus, Trash2 } from "lucide-react";
import { Row, Col, Card, Form } from "react-bootstrap";
import DashboardLayout from "../layouts/DashboardLayout";
import InputField from "../components/InputField";
import Button from "../components/Button";
import Alert from "../components/Alert";
import { useAuth } from "../context/AuthContext";

export const AddRecordPage = () => {
  const { user } = useAuth(); // Get user from auth context
  const [semester, setSemester] = useState("");
  const [subjects, setSubjects] = useState([
    { name: "", marks: "", grade: "" },
  ]);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 🔹 GPA Calculation
  const calculateGPA = (subjects) => {
    if (subjects.length === 0) return 0;

    const avgMarks =
      subjects.reduce((sum, s) => sum + (parseInt(s.marks) || 0), 0) /
      subjects.length;

    return (avgMarks / 25).toFixed(2); // 4.0 scale
  };

  // 🔹 Grade Calculation
  const calculateGrade = (marks) => {
    const m = parseInt(marks) || 0;
    if (m >= 90) return "A+";
    if (m >= 85) return "A";
    if (m >= 80) return "B+";
    if (m >= 75) return "B";
    if (m >= 70) return "C+";
    if (m >= 65) return "C";
    if (m >= 60) return "D";
    return "F";
  };

  const handleSubjectChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "marks") {
      updated[index].grade = calculateGrade(value);
    }

    setSubjects(updated);
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: "", marks: "", grade: "" }]);
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      const updated = subjects.filter((_, i) => i !== index);
      setSubjects(updated);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!semester) {
      newErrors.semester = "Semester is required";
    }

    subjects.forEach((subject, index) => {
      if (!subject.name) {
        newErrors[`subject_${index}_name`] = "Subject name is required";
      }
      if (!subject.marks) {
        newErrors[`subject_${index}_marks`] = "Marks are required";
      } else if (
        parseInt(subject.marks) < 0 ||
        parseInt(subject.marks) > 100
      ) {
        newErrors[`subject_${index}_marks`] =
          "Marks must be between 0-100";
      }
    });

    return newErrors;
  };

  // 🔥 CORRECT SUBMIT FUNCTION
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      const gpa = calculateGPA(subjects);

      // ✅ Get studentId from user object
      if (!user || !user.id) {
        setAlert({
          type: "error",
          message: "User not authenticated. Please login again.",
        });
        return;
      }

      const recordData = {
        studentId: user.id, // ✅ Now using authenticated user ID
        semester: parseInt(semester),
        year: new Date().getFullYear(),
        gpa: parseFloat(gpa),
        subjects: subjects.map((s) => ({
          subjectName: s.name, // ✅ Matches backend schema
          marks: parseInt(s.marks),
          grade: s.grade,
        })),
      };

      console.log("📤 Sending Data to Backend:", recordData);

      const response = await axios.post(
        "http://localhost:5000/api/academic",
        recordData
      );

      console.log("✅ Saved Successfully:", response.data);

      setAlert({
        type: "success",
        message: `Record added successfully! GPA: ${gpa}`,
      });

      // Reset form
      setSemester("");
      setSubjects([{ name: "", marks: "", grade: "" }]);
      setErrors({});

      // Optional: Redirect after 2 seconds
      setTimeout(() => {
        // window.location.href = '/student-dashboard';
      }, 2000);
    } catch (error) {
      console.error("❌ Error Details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config?.url,
      });

      // Better error messages
      let errorMessage = "Failed to add record. ";
      
      if (!error.response) {
        errorMessage += "Backend server not running. Make sure to start backend with: npm run dev";
      } else if (error.response?.status === 400) {
        errorMessage += error.response.data?.message || "Invalid data. Please check all fields.";
      } else if (error.response?.status === 404) {
        errorMessage += "Student not found in database.";
      } else if (error.response?.status === 500) {
        errorMessage += "Backend server error: " + (error.response.data?.error || "Unknown error");
      } else {
        errorMessage += error.response?.data?.message || error.message;
      }

      setAlert({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const gpa = calculateGPA(subjects);

  return (
    <DashboardLayout>
      <div className="mb-4">
        <h1 className="h3 fw-bold">Add Academic Record</h1>
        <p className="text-muted">
          Add a new semester record with your subject marks
        </p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <Row>
        <Col lg={8}>
          <form onSubmit={handleSubmit}>
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-light">
                <Card.Title className="h6 mb-0">
                  Semester Details
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <InputField
                  label="Semester Number"
                  type="number"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  error={errors.semester}
                  required
                />
              </Card.Body>
            </Card>

            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-light">
                <Card.Title className="h6 mb-0">
                  Subject Details
                </Card.Title>
              </Card.Header>
              <Card.Body>
                {subjects.map((subject, index) => (
                  <Card key={index} className="mb-3 border">
                    <Card.Header className="bg-light d-flex justify-content-between">
                      <span>Subject {index + 1}</span>
                      {subjects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSubject(index)}
                          className="btn btn-sm btn-outline-danger"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </Card.Header>
                    <Card.Body>
                      <InputField
                        label="Subject Name"
                        type="text"
                        value={subject.name}
                        onChange={(e) =>
                          handleSubjectChange(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        error={errors[`subject_${index}_name`]}
                        required
                      />

                      <Row>
                        <Col md={8}>
                          <InputField
                            label="Marks"
                            type="number"
                            value={subject.marks}
                            onChange={(e) =>
                              handleSubjectChange(
                                index,
                                "marks",
                                e.target.value
                              )
                            }
                            error={errors[`subject_${index}_marks`]}
                            required
                          />
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Grade</Form.Label>
                            <div className="border rounded p-2 text-center bg-light">
                              {subject.grade || "-"}
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline-primary"
                  onClick={addSubject}
                >
                  <Plus size={16} className="me-2" />
                  Add Subject
                </Button>
              </Card.Body>
            </Card>

            <Card className="mb-4 bg-primary text-white border-0">
              <Card.Body className="text-center py-4">
                <h2>{gpa}</h2>
                <p>Calculated GPA</p>
              </Card.Body>
            </Card>

            <Button type="submit" variant="primary" size="lg" fullWidth>
              {loading ? "Saving..." : "Submit Record"}
            </Button>
          </form>
        </Col>
      </Row>
    </DashboardLayout>
  );
};

export default AddRecordPage;
