import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';
import { Users, AlertCircle, TrendingUp, CheckSquare } from 'lucide-react';
import { Container, Row, Col, Badge, Card, Table, Form, Alert, Button, Modal } from 'react-bootstrap';
import DashboardLayout from '../layouts/DashboardLayout';
import Loading from '../components/Loading';
import { studentAPI, taskAPI } from '../services/api';

export const TeacherDashboard = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('velocity');

  // Task Modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedStudentForTask, setSelectedStudentForTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', deadline: '' });
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [taskError, setTaskError] = useState('');
  const [taskSuccess, setTaskSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsData = await studentAPI.getAllStudents();
        setStudents(studentsData);
        filterAndSort(studentsData, 'all', 'velocity');
      } catch (error) {
        console.error('Failed to load students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filterAndSort = (data, dept, sort) => {
    let filtered = data;

    if (dept !== 'all') {
      filtered = filtered.filter((s) => s.department === dept);
    }

    if (sort === 'velocity') {
      filtered = [...filtered].sort((a, b) => a.velocityScore - b.velocityScore);
    } else if (sort === 'gpa') {
      filtered = [...filtered].sort((a, b) => a.currentGPA - b.currentGPA);
    } else if (sort === 'name') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredStudents(filtered);
  };

  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    setDepartmentFilter(value);
    filterAndSort(students, value, sortBy);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    filterAndSort(students, departmentFilter, value);
  };

  const handleOpenTaskModal = (student) => {
    setSelectedStudentForTask(student);
    setTaskForm({ title: '', description: '', deadline: '' });
    setTaskError('');
    setTaskSuccess('');
    setShowTaskModal(true);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.description || !taskForm.deadline) {
      setTaskError('Please fill out all fields.');
      return;
    }
    setTaskSubmitting(true);
    setTaskError('');
    
    try {
      const taskData = {
        ...taskForm,
        studentId: selectedStudentForTask.id || selectedStudentForTask._id
      };
      await taskAPI.createTask(taskData);
      setTaskSuccess('Task assigned successfully!');
      setTimeout(() => setShowTaskModal(false), 1500);
    } catch (error) {
      console.error('Failed to assign task:', error);
      setTaskError('Failed to assign task. Please try again.');
    } finally {
      setTaskSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  const departments = [...new Set(students.map((s) => s.department))];

  const departmentStats = departments.map((dept) => {
    const deptStudents = students.filter((s) => s.department === dept);
    const avgGPA =
      deptStudents.reduce((sum, s) => sum + s.currentGPA, 0) / deptStudents.length;
    return {
      name: dept,
      avgGPA: parseFloat(avgGPA.toFixed(2)),
      students: deptStudents.length,
    };
  });

  const scatterData = students.map((s) => ({
    x: s.currentGPA,
    y: s.velocityScore,
    name: s.name,
    department: s.department,
  }));

  const atRiskStudents = students.filter(
    (s) => s.velocityScore < 0 && s.currentGPA < 3.0
  );

  return (
    <DashboardLayout>
      <Container fluid className="p-4">
        <div className="mb-4">
          <h1 className="h3 fw-bold">Students Overview</h1>
          <p className="text-muted">Monitor student performance and identify those needing support</p>
        </div>

        {atRiskStudents.length > 0 && (
          <Alert variant="danger" className="mb-4 d-flex align-items-start gap-3">
            <AlertCircle size={24} className="mt-1 flex-shrink-0" />
            <div>
              <Alert.Heading className="mb-2">At-Risk Students</Alert.Heading>
              <p className="mb-0">{atRiskStudents.length} student(s) need immediate attention (low GPA + declining velocity)</p>
            </div>
          </Alert>
        )}

        <Row className="mb-4 g-3">
          <Col md={3} sm={6} xs={12}>
            <Card className="shadow-sm h-100 border-0 rounded">
              <Card.Body className="text-center p-4">
                <div className="mb-3 text-primary"><Users size={32} /></div>
                <p className="text-muted small mb-2">Total Students</p>
                <h2 className="fw-bold">{students.length}</h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} sm={6} xs={12}>
            <Card className="shadow-sm h-100 border-0 rounded">
              <Card.Body className="text-center p-4">
                <div className="mb-3 text-success"><TrendingUp size={32} /></div>
                <p className="text-muted small mb-2">Average GPA</p>
                <h2 className="fw-bold">
                  {students.length > 0
                    ? (students.reduce((sum, s) => sum + s.currentGPA, 0) / students.length).toFixed(2)
                    : '0.00'}
                </h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} sm={6} xs={12}>
            <Card className="shadow-sm h-100 border-0 rounded">
              <Card.Body className="text-center p-4">
                <div className="mb-3 text-info"><TrendingUp size={32} /></div>
                <p className="text-muted small mb-2">Average Velocity</p>
                <h2 className="fw-bold">
                  {students.length > 0
                    ? (students.reduce((sum, s) => sum + s.velocityScore, 0) / students.length).toFixed(2)
                    : '0.00'}
                </h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} sm={6} xs={12}>
            <Card className="shadow-sm h-100 border-0 rounded">
              <Card.Body className="text-center p-4">
                <div className="mb-3 text-danger"><AlertCircle size={32} /></div>
                <p className="text-muted small mb-2">At-Risk Students</p>
                <h2 className="fw-bold">{atRiskStudents.length}</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4 g-3">
          <Col md={6} xs={12}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-light border-bottom">
                <Card.Title className="mb-0 fw-bold">Department Average GPA</Card.Title>
              </Card.Header>
              <Card.Body>
                {departmentStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" stroke="#6c757d" angle={-45} textAnchor="end" height={100} style={{ fontSize: '0.75rem' }} />
                      <YAxis stroke="#6c757d" style={{ fontSize: '0.875rem' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '0.5rem' }} />
                      <Bar dataKey="avgGPA" fill="#0d6efd" name="Avg GPA" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted text-center py-5">No data available</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} xs={12}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-light border-bottom">
                <Card.Title className="mb-0 fw-bold">Growth Velocity vs GPA</Card.Title>
              </Card.Header>
              <Card.Body>
                {scatterData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="x" name="GPA" stroke="#6c757d" style={{ fontSize: '0.875rem' }} label={{ value: 'GPA', position: 'insideBottomRight', offset: -5 }} />
                      <YAxis dataKey="y" name="Velocity" stroke="#6c757d" style={{ fontSize: '0.875rem' }} label={{ value: 'Velocity Score', angle: -90, position: 'insideLeft' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '0.5rem' }} cursor={{ strokeDasharray: '3 3' }} 
                        content={(props) => {
                          if (props.active && props.payload && props.payload[0]) {
                            const data = props.payload[0].payload;
                            return (
                              <div style={{ backgroundColor: 'white', padding: '0.75rem', border: '1px solid #e0e0e0', borderRadius: '0.5rem' }}>
                                <p><strong>{data.name}</strong></p>
                                <p>GPA: {data.x.toFixed(2)}</p>
                                <p>Velocity: {data.y.toFixed(2)}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter name="Students" data={scatterData} fill="#0d6efd" fillOpacity={0.6} />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted text-center py-5">No data available</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4 g-3">
          <Col md={4} xs={12}>
            <Form.Group>
              <Form.Label className="fw-bold">Filter by Department</Form.Label>
              <Form.Select value={departmentFilter} onChange={handleDepartmentChange} className="rounded">
                <option value="all">All Departments</option>
                {departments.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4} xs={12}>
            <Form.Group>
              <Form.Label className="fw-bold">Sort by</Form.Label>
              <Form.Select value={sortBy} onChange={handleSortChange} className="rounded">
                <option value="velocity">Lowest Velocity</option>
                <option value="gpa">Lowest GPA</option>
                <option value="name">Name (A-Z)</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4} xs={12}>
            <Form.Group>
              <Form.Label className="fw-bold">Results</Form.Label>
              <div className="bg-light p-2 rounded text-center fw-bold" style={{ height: '38px', lineHeight: '24px' }}>
                {filteredStudents.length} student(s)
              </div>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={12}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-light border-bottom">
                <Card.Title className="mb-0 fw-bold">Students List</Card.Title>
              </Card.Header>
              <Card.Body className="p-0">
                {filteredStudents.length > 0 ? (
                  <div className="table-responsive">
                    <Table striped bordered hover className="mb-0 text-center align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Department</th>
                          <th>Current GPA</th>
                          <th>Velocity Score</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student) => {
                          const isAtRisk = student.velocityScore < 0 && student.currentGPA < 3.0;
                          const isImproving = student.velocityScore > 0.1;
                          return (
                            <tr key={student.id} className={isAtRisk ? 'table-danger' : ''}>
                              <td className="fw-bold text-start">{student.name}</td>
                              <td>{student.department}</td>
                              <td><Badge bg="primary">{student.currentGPA.toFixed(2)}</Badge></td>
                              <td>
                                <Badge bg={student.velocityScore > 0 ? 'success' : 'warning'}>
                                  {student.velocityScore > 0 ? '+' : ''}{student.velocityScore.toFixed(2)}
                                </Badge>
                              </td>
                              <td>
                                {isAtRisk ? (
                                  <Badge bg="danger">At Risk</Badge>
                                ) : isImproving ? (
                                  <Badge bg="success">Improving</Badge>
                                ) : (
                                  <Badge bg="warning">Stable</Badge>
                                )}
                              </td>
                              <td>
                                <Button 
                                  variant="outline-primary" 
                                  size="sm" 
                                  onClick={() => handleOpenTaskModal(student)}
                                  className="d-flex align-items-center gap-1 mx-auto"
                                >
                                  <CheckSquare size={14} /> Assign Task
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-muted">No students found matching the selected filters.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Task Assignment Modal */}
      <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Task to {selectedStudentForTask?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {taskSuccess && <Alert variant="success">{taskSuccess}</Alert>}
          {taskError && <Alert variant="danger">{taskError}</Alert>}
          
          <Form onSubmit={handleTaskSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Task Title</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter task title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                placeholder="Detailed instructions..."
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Deadline</Form.Label>
              <Form.Control 
                type="date" 
                value={taskForm.deadline}
                onChange={(e) => setTaskForm({...taskForm, deadline: e.target.value})}
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setShowTaskModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={taskSubmitting}>
                {taskSubmitting ? 'Assigning...' : 'Assign Task'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

    </DashboardLayout>
  );
};

export default TeacherDashboard;
