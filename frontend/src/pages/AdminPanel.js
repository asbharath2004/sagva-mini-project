import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Users, TrendingUp, BookOpen } from 'lucide-react';
import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import DashboardLayout from '../layouts/DashboardLayout';
import Loading from '../components/Loading';
import { analyticsAPI, studentAPI } from '../services/api';

const COLORS = [
  '#0d6efd',
  '#198754',
  '#dc3545',
  '#ffc107',
  '#8B5CF6',
];

export const AdminPanel = () => {
  const [adminStats, setAdminStats] = useState(null);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await analyticsAPI.getAdminStats();
        const students = await studentAPI.getAllStudents();

        setAdminStats(stats);

        // Calculate department statistics
        const deptMap = {};
        students.forEach((student) => {
          if (!deptMap[student.department]) {
            deptMap[student.department] = {
              name: student.department,
              students: 0,
              avgGPA: 0,
              totalGPA: 0,
              avgVelocity: 0,
              totalVelocity: 0,
            };
          }
          deptMap[student.department].students += 1;
          deptMap[student.department].totalGPA += student.currentGPA;
          deptMap[student.department].totalVelocity += student.velocityScore;
        });

        // Calculate averages
        const deptStats = Object.values(deptMap).map((dept) => ({
          ...dept,
          avgGPA: (dept.totalGPA / dept.students).toFixed(2),
          avgVelocity: (dept.totalVelocity / dept.students).toFixed(2),
        }));

        setDepartmentStats(deptStats);
      } catch (error) {
        console.error('Failed to load admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  const pieData = departmentStats.map((dept) => ({
    name: dept.name,
    value: dept.students,
  }));



  return (
    <DashboardLayout>
      <Container fluid className="p-4">
        {/* Page Header */}
        <div className="mb-4">
          <h1 className="h3 fw-bold">Admin Dashboard</h1>
          <p className="text-muted">System-wide analytics and institutional performance metrics</p>
        </div>

        {/* Section 1: System Statistics Cards */}
        <Row className="mb-4 g-3">
          {/* Total Students */}
          <Col md={3} sm={6} xs={12}>
            <Card className="shadow-sm h-100 border-0 rounded">
              <Card.Body className="text-center p-4">
                <div className="mb-3 text-primary">
                  <Users size={32} />
                </div>
                <p className="text-muted small mb-2">Total Students</p>
                <h2 className="fw-bold">{adminStats?.totalStudents || 0}</h2>
              </Card.Body>
            </Card>
          </Col>

          {/* Total Teachers */}
          <Col md={3} sm={6} xs={12}>
            <Card className="shadow-sm h-100 border-0 rounded">
              <Card.Body className="text-center p-4">
                <div className="mb-3 text-info">
                  <BookOpen size={32} />
                </div>
                <p className="text-muted small mb-2">Total Teachers</p>
                <h2 className="fw-bold">{adminStats?.totalTeachers || 0}</h2>
              </Card.Body>
            </Card>
          </Col>

          {/* Institution Average GPA */}
          <Col md={3} sm={6} xs={12}>
            <Card className="shadow-sm h-100 border-0 rounded">
              <Card.Body className="text-center p-4">
                <div className="mb-3 text-warning">
                  <TrendingUp size={32} />
                </div>
                <p className="text-muted small mb-2">Avg Institution GPA</p>
                <h2 className="fw-bold">{adminStats?.avgInstitutionGPA?.toFixed(2) || '0.00'}</h2>
              </Card.Body>
            </Card>
          </Col>

          {/* Overall Velocity */}
          <Col md={3} sm={6} xs={12}>
            <Card className="shadow-sm h-100 border-0 rounded">
              <Card.Body className="text-center p-4">
                <div className="mb-3 text-success">
                  <TrendingUp size={32} />
                </div>
                <p className="text-muted small mb-2">Overall Velocity</p>
                <h2 className="fw-bold">{adminStats?.avgGrowthVelocity?.toFixed(2) || '0.00'}</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Section 2: Distribution Charts */}
        <Row className="mt-4 g-3">
          {/* Department Distribution Pie Chart */}
          <Col md={6} xs={12}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-light border-bottom">
                <Card.Title className="mb-0 fw-bold">Department Distribution</Card.Title>
                <small className="text-muted">Student count per department</small>
              </Card.Header>
              <Card.Body>
                {departmentStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e0e0e0',
                          borderRadius: '0.5rem',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted text-center py-5">No data available</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Department Performance Bar Chart */}
          <Col md={6} xs={12}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-light border-bottom">
                <Card.Title className="mb-0 fw-bold">Department Performance</Card.Title>
                <small className="text-muted">Average GPA by department</small>
              </Card.Header>
              <Card.Body>
                {departmentStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis
                        dataKey="name"
                        stroke="#6c757d"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        style={{ fontSize: '0.75rem' }}
                      />
                      <YAxis stroke="#6c757d" style={{ fontSize: '0.875rem' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e0e0e0',
                          borderRadius: '0.5rem',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="avgGPA" fill="#0d6efd" name="Avg GPA" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted text-center py-5">No data available</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Section 3: Department Performance Table */}
        <Row className="mt-4">
          <Col md={12}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-light border-bottom">
                <Card.Title className="mb-0 fw-bold">Department Statistics</Card.Title>
              </Card.Header>
              <Card.Body className="p-0">
                {departmentStats.length > 0 ? (
                  <div className="table-responsive">
                    <Table striped bordered hover className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Department</th>
                          <th className="text-center">Students</th>
                          <th className="text-center">Avg GPA</th>
                          <th className="text-center">Avg Velocity</th>
                          <th className="text-center">Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departmentStats.map((dept, index) => {
                          const avgGPA = parseFloat(dept.avgGPA);
                          const performanceLevel =
                            avgGPA >= 3.5
                              ? { label: 'Excellent', variant: 'success' }
                              : avgGPA >= 3.0
                                ? { label: 'Good', variant: 'info' }
                                : { label: 'Needs Improvement', variant: 'warning' };

                          return (
                            <tr key={index}>
                              <td className="fw-bold">{dept.name}</td>
                              <td className="text-center">
                                <Badge bg="secondary">{dept.students}</Badge>
                              </td>
                              <td className="text-center">
                                <Badge bg="primary">{dept.avgGPA}</Badge>
                              </td>
                              <td className="text-center">
                                <Badge bg={parseFloat(dept.avgVelocity) > 0 ? 'success' : 'danger'}>
                                  {parseFloat(dept.avgVelocity) > 0 ? '+' : ''}
                                  {dept.avgVelocity}
                                </Badge>
                              </td>
                              <td className="text-center">
                                <Badge bg={performanceLevel.variant}>{performanceLevel.label}</Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-muted">No department data available</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </DashboardLayout>
  );
};

export default AdminPanel;
