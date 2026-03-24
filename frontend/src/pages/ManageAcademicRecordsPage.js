import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Badge, Row, Col } from 'react-bootstrap';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import InputField from '../components/InputField';
import { recordAPI, studentAPI } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';

export const ManageAcademicRecordsPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentRecord, setCurrentRecord] = useState({
    semester: '',
    year: new Date().getFullYear(),
    subjects: [{ subjectName: '', marks: '', grade: '' }]
  });

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const studentData = await studentAPI.getStudent(studentId);
      setStudent(studentData);

      const recordsData = await studentAPI.getStudentRecords(studentId);
      setRecords(recordsData || []);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to fetch data' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const calculateGPA = (subjects) => {
    if (subjects.length === 0) return 0;
    const avgMarks = subjects.reduce((sum, s) => sum + (parseInt(s.marks) || 0), 0) / subjects.length;
    return (avgMarks / 25).toFixed(2);
  };

  const handleOpenModal = (mode, record = null) => {
    setModalMode(mode);
    if (record) {
      setCurrentRecord({
        ...record,
        subjects: record.subjects.map(s => ({
          subjectName: s.subjectName || s.name,
          marks: s.marks,
          grade: s.grade || calculateGrade(s.marks)
        }))
      });
    } else {
      setCurrentRecord({
        semester: '',
        year: new Date().getFullYear(),
        subjects: [{ subjectName: '', marks: '', grade: '' }]
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSubjectChange = (index, field, value) => {
    const updated = [...currentRecord.subjects];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "marks") {
      updated[index].grade = calculateGrade(value);
    }
    setCurrentRecord({ ...currentRecord, subjects: updated });
  };

  const addSubject = () => {
    setCurrentRecord({
      ...currentRecord,
      subjects: [...currentRecord.subjects, { subjectName: '', marks: '', grade: '' }]
    });
  };

  const removeSubject = (index) => {
    if (currentRecord.subjects.length > 1) {
      const updated = currentRecord.subjects.filter((_, i) => i !== index);
      setCurrentRecord({ ...currentRecord, subjects: updated });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const gpa = parseFloat(calculateGPA(currentRecord.subjects));
      const recordPayload = {
        studentId,
        semester: parseInt(currentRecord.semester),
        year: parseInt(currentRecord.year),
        gpa,
        subjects: currentRecord.subjects.map(s => ({
          subjectName: s.subjectName,
          marks: parseInt(s.marks),
          grade: s.grade
        }))
      };

      if (modalMode === 'add') {
        await recordAPI.addRecord(recordPayload);
        setAlert({ type: 'success', message: 'Academic record added successfully!' });
      } else {
        await recordAPI.updateRecord(currentRecord._id || currentRecord.id, recordPayload);
        setAlert({ type: 'success', message: 'Academic record updated successfully!' });
      }
      
      setShowModal(false);
      fetchData();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Error saving record' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this academic record?')) {
      try {
        await recordAPI.deleteRecord(id);
        setAlert({ type: 'success', message: 'Record deleted successfully' });
        setRecords((prevRecords) => prevRecords.filter(record => (record._id || record.id) !== id));
      } catch (error) {
        setAlert({ 
          type: 'error', 
          message: error.response?.data?.message || 'Error deleting record' 
        });
      }
    }
  };

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <Container fluid className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <Button variant="light" onClick={() => navigate('/admin-students')} className="d-flex align-items-center justify-content-center p-2 rounded-circle shadow-sm">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="h3 fw-bold mb-0">Academic Records</h1>
              <p className="text-muted mb-0">{student?.name || 'Student'} ({student?.email || 'N/A'})</p>
            </div>
          </div>
          <Button variant="primary" onClick={() => handleOpenModal('add')} className="d-flex align-items-center gap-2">
            <Plus size={18} />
            Add Record
          </Button>
        </div>

        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            {records.length > 0 ? (
              <div className="table-responsive">
                <Table striped bordered hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Semester</th>
                      <th>Year</th>
                      <th>Subjects</th>
                      <th>GPA</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record._id || record.id}>
                        <td className="fw-bold">Semester {record.semester}</td>
                        <td>{record.year}</td>
                        <td>{record.subjects?.length || 0} subjects</td>
                        <td>
                          <Badge bg="primary">{record.gpa?.toFixed(2) || '0.00'}</Badge>
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <Button variant="outline-success" size="sm" onClick={() => handleOpenModal('edit', record)}>
                              <Edit size={16} />
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(record._id || record.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="p-5 text-center">
                <p className="text-muted mb-0">No academic records found for this student.</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === 'add' ? 'Add Academic Record' : 'Edit Academic Record'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <InputField label="Semester" type="number" value={currentRecord.semester} onChange={(e) => setCurrentRecord({ ...currentRecord, semester: e.target.value })} required />
              </Col>
              <Col md={6}>
                <InputField label="Year" type="number" value={currentRecord.year} onChange={(e) => setCurrentRecord({ ...currentRecord, year: e.target.value })} required />
              </Col>
            </Row>

            <h5 className="mt-4 mb-3 border-bottom pb-2">Subjects</h5>
            
            {currentRecord.subjects.map((subject, index) => (
              <Card key={index} className="mb-3 border bg-light">
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0 fw-bold">Subject {index + 1}</h6>
                    {currentRecord.subjects.length > 1 && (
                      <Button variant="outline-danger" size="sm" onClick={() => removeSubject(index)}><Trash2 size={14} /></Button>
                    )}
                  </div>
                  <Row>
                    <Col md={6}>
                      <InputField label="Subject Name" type="text" value={subject.subjectName} onChange={(e) => handleSubjectChange(index, "subjectName", e.target.value)} required />
                    </Col>
                    <Col md={3}>
                      <InputField label="Marks" type="number" value={subject.marks} onChange={(e) => handleSubjectChange(index, "marks", e.target.value)} required />
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Grade</Form.Label>
                        <div className="border rounded p-2 text-center bg-white">{subject.grade || "-"}</div>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}

            <Button type="button" variant="outline-primary" size="sm" onClick={addSubject} className="mb-4">
              <Plus size={16} className="me-2" /> Add Subject
            </Button>

            <div className="d-flex justify-content-end gap-2 border-top pt-3">
              <span className="me-auto my-auto fw-bold text-primary">Calculated GPA: {calculateGPA(currentRecord.subjects)}</span>
              <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
              <Button variant="primary" type="submit">{modalMode === 'add' ? 'Save Record' : 'Update Record'}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </DashboardLayout>
  );
};

export default ManageAcademicRecordsPage;
