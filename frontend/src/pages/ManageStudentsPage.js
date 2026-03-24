import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Badge } from 'react-bootstrap';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import { studentAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const ManageStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentStudent, setCurrentStudent] = useState({
    name: '',
    email: '',
    department: '',
    year: '',
    role: 'student'
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentAPI.getAllStudents();
      setStudents(data);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to fetch students' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, student = null) => {
    setModalMode(mode);
    if (student) {
      setCurrentStudent(student);
    } else {
      setCurrentStudent({ name: '', email: '', department: '', year: '', role: 'student' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentStudent({ ...currentStudent, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await studentAPI.createStudent(currentStudent);
        setAlert({ type: 'success', message: 'Student created successfully' });
      } else {
        await studentAPI.updateStudent(currentStudent._id || currentStudent.id, currentStudent);
        setAlert({ type: 'success', message: 'Student updated successfully' });
      }
      setShowModal(false);
      fetchStudents();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Error saving student' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student and all their academic records?')) {
      try {
        await studentAPI.deleteStudent(id);
        setAlert({ type: 'success', message: 'Student deleted successfully' });
        fetchStudents();
      } catch (error) {
        setAlert({ type: 'error', message: 'Error deleting student' });
      }
    }
  };

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <Container fluid className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold">Manage Students</h1>
            <p className="text-muted">Add, edit, or delete student profiles</p>
          </div>
          <Button variant="primary" onClick={() => handleOpenModal('add')} className="d-flex align-items-center gap-2">
            <Plus size={18} />
            Add Student
          </Button>
        </div>

        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table striped bordered hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Year</th>
                    <th>GPA</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length > 0 ? (
                    students.map((student) => (
                      <tr key={student._id || student.id}>
                        <td className="fw-bold">{student.name}</td>
                        <td>{student.email}</td>
                        <td>{student.department || '-'}</td>
                        <td>{student.year || '-'}</td>
                        <td>
                          <Badge bg="info">{student.currentGPA?.toFixed(2) || '0.00'}</Badge>
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <Button variant="outline-primary" size="sm" onClick={() => navigate(`/admin-academic/${student._id || student.id}`)} title="Manage Academic Records">
                              <Eye size={16} />
                            </Button>
                            <Button variant="outline-success" size="sm" onClick={() => handleOpenModal('edit', student)} title="Edit Student">
                              <Edit size={16} />
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(student._id || student.id)} title="Delete Student">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">No students found</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Container>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === 'add' ? 'Add New Student' : 'Edit Student'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={currentStudent.name} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={currentStudent.email} onChange={handleInputChange} required disabled={modalMode === 'edit'} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Department</Form.Label>
              <Form.Control type="text" name="department" value={currentStudent.department} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Year</Form.Label>
              <Form.Select name="year" value={currentStudent.year} onChange={handleInputChange} required>
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </Form.Select>
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
              <Button variant="primary" type="submit">{modalMode === 'add' ? 'Add Student' : 'Save Changes'}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </DashboardLayout>
  );
};

export default ManageStudentsPage;
