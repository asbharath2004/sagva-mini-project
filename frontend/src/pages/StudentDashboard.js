import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Target,
  Activity,
  CheckCircle,
  List,
  AlertTriangle,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { Container, Row, Col, Table, Badge, Card, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { studentAPI, analyticsAPI, taskAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [records, setRecords] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [classAverage, setClassAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || (!user.id && !user._id)) return;
      const userId = user._id || user.id;

      try {
        setLoading(true);
        const studentData = await studentAPI.getStudent(userId);
        setStudent(studentData);

        const recordsData = await studentAPI.getStudentRecords(userId);
        setRecords(recordsData);

        const analyticsData = await analyticsAPI.getStudentAnalytics(userId);
        setAnalytics(analyticsData);

        const tasksData = await taskAPI.getStudentTasks(userId);
        setTasks(tasksData);

        const leaderData = await analyticsAPI.getLeaderboardAndPeerData();
        setLeaderboard(leaderData.topStudents);
        setClassAverage(leaderData.classAverageGPA);

        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);



  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;
  if (error) {
    return (
      <DashboardLayout>
        <EmptyState icon={Activity} title="Error Loading Data" description={error} />
      </DashboardLayout>
    );
  }

  // Derived Data Preparation
  const gpaHistory = analytics?.gpaHistory || records.map((r) => ({
    semester: `Sem ${r.semester}`,
    gpa: r.gpa,
  }));

  const peerComparisonData = [
    { name: 'You', GPA: parseFloat(student?.currentGPA?.toFixed(2) || 0), fill: '#0d6efd' },
    { name: 'Class Avg', GPA: parseFloat(classAverage?.toFixed(2) || 0), fill: '#6c757d' }
  ];

  let currentRiskLevel = 'Low';
  let currentRiskColor = 'success';

  const riskTimelineData = gpaHistory.map((h, i) => {
    let velocity = i > 0 ? h.gpa - gpaHistory[i - 1].gpa : 0;
    let riskLevel = 'Low';
    let riskScore = 1;

    if (h.gpa < 3.0 || velocity < -0.1) {
      riskLevel = h.gpa < 2.5 ? 'High' : 'Medium';
      riskScore = h.gpa < 2.5 ? 3 : 2;
    }

    if (i === gpaHistory.length - 1) {
      currentRiskLevel = riskLevel;
      currentRiskColor = riskLevel === 'High' ? 'danger' : riskLevel === 'Medium' ? 'warning' : 'success';
    }

    return { 
      semester: h.semester, 
      riskScore, 
      RiskLevel: riskLevel,
      fill: riskLevel === 'High' ? '#dc3545' : riskLevel === 'Medium' ? '#ffc107' : '#28a745'
    };
  });

  const getPerformanceStatus = () => {
    if (!student) return 'Stable';
    const diff = student.currentGPA - student.previousGPA;
    if (diff > 0.1) return 'Improving';
    if (diff < -0.1) return 'Declining';
    return 'Stable';
  };

  const getStatusColor = () => {
    const status = getPerformanceStatus();
    if (status === 'Improving') return 'success';
    if (status === 'Declining') return 'danger';
    return 'warning';
  };

  const predictedGPA = Math.min((student?.currentGPA || 0) + (analytics?.velocityScore || 0), 4.0).toFixed(2);
  const improvement = student?.previousGPA ? (((student.currentGPA - student.previousGPA) / student.previousGPA) * 100).toFixed(1) : 0;

  const latestSubjects = records.length > 0 ? (records[records.length - 1]?.subjects || []) : [];

  return (
    <DashboardLayout>
      <Container fluid className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        
        {/* Top: Header & Student Info */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h1 className="h3 fw-bold text-dark mb-1">Welcome back, {student?.name}!</h1>
            <p className="text-secondary mb-0">Here is your comprehensive academic overview.</p>
          </div>
          <div className="d-flex gap-2">
            <Badge bg="primary" className="p-2 fs-6 shadow-sm rounded-pill px-3">
              Predicted Next Sem GPA: {predictedGPA}
            </Badge>
          </div>
        </div>

        {/* Improvement Alert (if any) */}
        {improvement !== 0 && (
          <Alert variant={improvement > 0 ? 'success' : 'warning'} className="mb-4 border-0 shadow-sm rounded-4 d-flex align-items-center">
            <Activity size={20} className="me-2 flex-shrink-0" />
            <span>Your performance {improvement > 0 ? 'improved' : 'changed'} by <strong>{improvement}%</strong> compared to last semester.{improvement > 0 && " Keep up the great work!"}</span>
          </Alert>
        )}

        {/* Section 1: 4 Cards Grid */}
        <Row className="mb-4 g-4">
          <Col md={3} sm={6} xs={12}>
            <Card className="shadow-sm border-0 rounded-4 h-100">
              <Card.Body className="p-4 d-flex flex-column align-items-center justify-content-center">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle mb-3"><Award size={28} className="text-success" /></div>
                <p className="text-muted fw-semibold mb-1">Current GPA</p>
                <h2 className="fw-bold text-dark mb-0">{student?.currentGPA?.toFixed(2) || '0.00'}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} xs={12}>
            <Card className="shadow-sm border-0 rounded-4 h-100">
              <Card.Body className="p-4 d-flex flex-column align-items-center justify-content-center">
                <div className="bg-info bg-opacity-10 p-3 rounded-circle mb-3"><TrendingUp size={28} className="text-info" /></div>
                <p className="text-muted fw-semibold mb-1">Growth Velocity</p>
                <h2 className="fw-bold text-dark mb-0">{analytics?.velocityScore?.toFixed(2) || '0.00'}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} xs={12}>
            <Card className="shadow-sm border-0 rounded-4 h-100">
              <Card.Body className="p-4 d-flex flex-column align-items-center justify-content-center">
                <div className={`bg-${getStatusColor()} bg-opacity-10 p-3 rounded-circle mb-3`}><Target size={28} className={`text-${getStatusColor()}`} /></div>
                <p className="text-muted fw-semibold mb-1">Performance Status</p>
                <Badge bg={getStatusColor()} className="fs-6 px-3 py-2 rounded-pill shadow-sm">{getPerformanceStatus()}</Badge>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} xs={12}>
            <Card className="shadow-sm border-0 rounded-4 h-100">
              <Card.Body className="p-4 d-flex flex-column align-items-center justify-content-center">
                <div className={`bg-${currentRiskColor} bg-opacity-10 p-3 rounded-circle mb-3`}><AlertTriangle size={28} className={`text-${currentRiskColor}`} /></div>
                <p className="text-muted fw-semibold mb-1">Risk Level</p>
                <Badge bg={currentRiskColor} className="fs-6 px-3 py-2 rounded-pill shadow-sm">{currentRiskLevel}</Badge>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Section 1A: Tasks Summary */}
        <Row className="mb-4 g-4">
          <Col md={4}>
            <Card className="shadow-sm border-0 border-start border-4 border-warning rounded-4 h-100 cursor-pointer hover-shadow" onClick={() => navigate('/student-tasks')}>
              <Card.Body className="p-3 d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted fw-semibold mb-1">Pending Tasks</p>
                  <h3 className="fw-bold text-dark mb-0">{tasks.filter(t => t.status === 'pending').length}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle"><List size={24} className="text-warning" /></div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm border-0 border-start border-4 border-info rounded-4 h-100 cursor-pointer hover-shadow" onClick={() => navigate('/student-tasks')}>
              <Card.Body className="p-3 d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted fw-semibold mb-1">Tasks Under Review</p>
                  <h3 className="fw-bold text-dark mb-0">{tasks.filter(t => t.status === 'under_review').length}</h3>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded-circle"><Activity size={24} className="text-info" /></div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm border-0 border-start border-4 border-success rounded-4 h-100 cursor-pointer hover-shadow" onClick={() => navigate('/student-tasks')}>
              <Card.Body className="p-3 d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted fw-semibold mb-1">Tasks Approved</p>
                  <h3 className="fw-bold text-dark mb-0">{tasks.filter(t => ['completed', 'approved'].includes(t.status)).length}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded-circle"><CheckCircle size={24} className="text-success" /></div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Section 2: Middle Charts / Analytics (Row) */}
        <Row className="mb-4 g-4">
          <Col lg={6} md={12}>
            <Card className="shadow-sm border-0 rounded-4 h-100">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4 text-dark">GPA Trend Over Semesters</h5>
                {gpaHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={gpaHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="semester" stroke="#6c757d" tick={{ fontSize: 12 }} dy={10} />
                      <YAxis stroke="#6c757d" tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Line type="monotone" dataKey="gpa" stroke="#0d6efd" strokeWidth={4} name="GPA" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">No data available</div>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={6} md={12}>
            <Card className="shadow-sm border-0 rounded-4 h-100">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4 text-dark">Risk Timeline Visualization</h5>
                {riskTimelineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={riskTimelineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="semester" stroke="#6c757d" tick={{ fontSize: 12 }} dy={10} />
                      <YAxis domain={[0,3]} ticks={[1,2,3]} stroke="#6c757d" tick={{ fontSize: 12 }} tickFormatter={(val) => val === 1 ? 'Low' : val === 2 ? 'Medium' : 'High'} />
                      <Tooltip 
                        formatter={(value, name, props) => [props.payload.RiskLevel, "Risk Level"]} 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        cursor={{ fill: 'transparent' }}
                      />
                      <Bar dataKey="riskScore" radius={[6,6,0,0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">No data available</div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Section 3: Lower Middle Analytics (Peer & Leaderboard) */}
        <Row className="mb-4 g-4">
          <Col lg={8} md={12}>
            <Card className="shadow-sm border-0 rounded-4 h-100">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold text-dark mb-0">Peer Comparison</h5>
                  <Badge bg={student?.currentGPA >= classAverage ? 'success' : 'warning'} className="px-3 py-2 rounded-pill shadow-sm">
                    {student?.currentGPA >= classAverage ? 'Above Average' : 'Below Average'}
                  </Badge>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={peerComparisonData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0,4.0]} stroke="#6c757d" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" stroke="#6c757d" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="GPA" radius={[0,6,6,0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} md={12}>
            <Card className="shadow-sm border-0 rounded-4 h-100">
              <Card.Body className="p-4 d-flex flex-column">
                <h5 className="fw-bold mb-4 text-dark">Global Leaderboard</h5>
                <div className="table-responsive flex-grow-1">
                  <Table borderless hover className="align-middle mb-0">
                    <thead className="text-muted border-bottom">
                      <tr>
                        <th className="fw-medium pb-3">Rank</th>
                        <th className="fw-medium pb-3">Student</th>
                        <th className="fw-medium text-end pb-3">GPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((s, idx) => {
                        const isMe = (user.id || user._id) === s._id;
                        return (
                          <tr key={s._id} className={isMe ? 'bg-primary bg-opacity-10' : ''} style={isMe ? { borderRadius: '8px' } : {}}>
                            <td className="fw-bold">
                              {idx === 0 ? <span className="fs-5">🥇</span> : idx === 1 ? <span className="fs-5">🥈</span> : idx === 2 ? <span className="fs-5">🥉</span> : `#${idx + 1}`}
                            </td>
                            <td className="fw-semibold text-dark">
                              {s.name} {isMe && <Badge bg="primary" className="ms-2 shadow-sm">You</Badge>}
                            </td>
                            <td className="fw-bold text-primary text-end">{s.currentGPA.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>



        {/* Section 5: Messages */}
        <Row className="g-4 mb-4">
          <Col lg={12} md={12}>
             <Card className="shadow-sm border-0 rounded-4 h-100 bg-primary text-white overflow-hidden position-relative">
                {/* Decorative circle */}
                <div className="position-absolute bg-white opacity-10 rounded-circle" style={{ width: '200px', height: '200px', top: '-50px', right: '-50px' }}></div>
                <Card.Body className="p-5 d-flex flex-column align-items-center justify-content-center text-center position-relative z-1">
                  <div className="bg-white bg-opacity-25 p-4 rounded-circle mb-4 shadow-sm">
                    <MessageSquare size={48} className="text-white" />
                  </div>
                  <h4 className="fw-bold mb-3">Teacher Messages</h4>
                  <p className="mb-4 text-white-50 fs-6">
                    Connect with your teachers regarding your progress and assigned tasks.
                  </p>
                  <Button 
                    variant="light" 
                    className="text-primary fw-bold px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2"
                    onClick={() => navigate('/messages')}
                  >
                    Open Messages <ArrowRight size={18} />
                  </Button>
                </Card.Body>
             </Card>
          </Col>
        </Row>

      </Container>
    </DashboardLayout>
  );
};

export default StudentDashboard;
