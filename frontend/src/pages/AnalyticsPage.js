import React, { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Row, Col, Card, Alert, Table, Badge } from 'react-bootstrap';
import DashboardLayout from '../layouts/DashboardLayout';
import ChartContainer from '../components/ChartContainer';
import Loading from '../components/Loading';
import { analyticsAPI, studentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AnalyticsPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || (!user.id && !user._id)) return;
      const userId = user._id || user.id;

      try {
        setLoading(true);
        const [analyticsData, recordsData] = await Promise.all([
          analyticsAPI.getStudentAnalytics(userId),
          studentAPI.getStudentRecords(userId),
        ]);

        setAnalytics(analyticsData);
        setRecords(Array.isArray(recordsData) ? recordsData : []);
        setError(null);
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError('Failed to load analytics data. Please try again.');
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
        <div className="p-4">
          <Alert variant="danger">{error}</Alert>
        </div>
      </DashboardLayout>
    );
  }

  const gpaHistory = analytics?.gpaHistory || [];

  const getTrendIcon = () => {
    const trend = analytics?.trend;
    if (trend === 'Improving') return TrendingUp;
    if (trend === 'Declining') return TrendingDown;
    return Activity;
  };

  const getTrendVariant = () => {
    const trend = analytics?.trend;
    if (trend === 'Improving') return 'success';
    if (trend === 'Declining') return 'danger';
    return 'warning';
  };

  const calculateVelocity = () => {
    if (gpaHistory.length < 2) return '0.00';
    const latest = gpaHistory[gpaHistory.length - 1].gpa;
    const previous = gpaHistory[0].gpa;
    return ((latest - previous) / gpaHistory.length).toFixed(2);
  };

  const calculateConsistency = () => {
    if (gpaHistory.length < 2) return '0.00';
    const gpas = gpaHistory.map((h) => h.gpa);
    const avg = gpas.reduce((a, b) => a + b, 0) / gpas.length;
    const variance =
      gpas.reduce((sum, gpa) => sum + Math.pow(gpa - avg, 2), 0) / gpas.length;
    return Math.sqrt(variance).toFixed(2);
  };

  const getHighestGPA = () => {
    if (!gpaHistory.length) return '0.00';
    return Math.max(...gpaHistory.map((h) => h.gpa)).toFixed(2);
  };

  const getLowestGPA = () => {
    if (!gpaHistory.length) return '0.00';
    return Math.min(...gpaHistory.map((h) => h.gpa)).toFixed(2);
  };

  const getAverageGPA = () => {
    if (!gpaHistory.length) return '0.00';
    const gpas = gpaHistory.map((h) => h.gpa);
    return (gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2);
  };

  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'success';
    if (grade === 'B+' || grade === 'B') return 'primary';
    if (grade === 'C+' || grade === 'C') return 'warning';
    if (grade === 'D') return 'danger';
    return 'secondary';
  };

  const noData = gpaHistory.length === 0 && records.length === 0;

  return (
    <DashboardLayout>
      <div className="p-4">
        {/* Page Header */}
        <div className="mb-4">
          <h1 className="h3 fw-bold">Growth Analytics</h1>
          <p className="text-muted">Track your academic performance trends and growth velocity</p>
        </div>

        {noData ? (
          <Alert variant="info">
            <Activity size={20} className="me-2" />
            No academic records found. Ask your administrator to add your records.
          </Alert>
        ) : (
          <>
            {/* Trend Status Banner */}
            <Alert className="mb-4 py-4" variant={getTrendVariant()}>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div className="d-flex gap-3 align-items-center">
                  <div>
                    {React.createElement(getTrendIcon(), { size: 40 })}
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1">Performance {analytics?.trend || 'Stable'}</h5>
                    <p className="mb-0">
                      {analytics?.trend === 'Improving' &&
                        'Your academic performance is showing positive growth. Keep up the great work!'}
                      {analytics?.trend === 'Declining' &&
                        'Your academic performance is declining. Consider reviewing your study methods.'}
                      {(analytics?.trend === 'Stable' || !analytics?.trend) &&
                        'Your academic performance is stable. Work on improving further.'}
                    </p>
                  </div>
                </div>
                <Badge bg={getTrendVariant()} className="fs-6 px-3 py-2">
                  Velocity: {analytics?.velocityScore?.toFixed(2) || '0.00'}
                </Badge>
              </div>
            </Alert>

            {/* Key Metrics Grid */}
            <Row className="mb-4 g-3">
              {[
                { label: 'Highest GPA', value: getHighestGPA() },
                { label: 'Lowest GPA', value: getLowestGPA() },
                { label: 'Average GPA', value: getAverageGPA() },
                { label: 'Growth Velocity', value: calculateVelocity() },
                { label: 'Performance Consistency (SD)', value: calculateConsistency() },
                { label: 'Total Semesters', value: records.length },
              ].map(({ label, value }) => (
                <Col lg={4} md={6} xs={12} key={label}>
                  <Card className="border-0 shadow-sm text-center h-100">
                    <Card.Body className="py-4">
                      <p className="text-muted mb-2 small text-uppercase fw-semibold">{label}</p>
                      <h3 className="fw-bold mb-0" style={{ fontSize: '2rem' }}>{value}</h3>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* GPA Trend Chart */}
            {gpaHistory.length > 0 && (
              <div className="mb-4">
                <ChartContainer
                  title="GPA Progression Over Time"
                  subtitle="Semester-wise GPA trend with growth analysis"
                >
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={gpaHistory}>
                      <defs>
                        <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#0d6efd" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="semester" stroke="#6c757d" style={{ fontSize: '0.875rem' }} />
                      <YAxis
                        stroke="#6c757d"
                        style={{ fontSize: '0.875rem' }}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e0e0e0',
                          borderRadius: '0.5rem',
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="gpa"
                        stroke="#0d6efd"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorGpa)"
                        name="GPA"
                        dot={{ fill: '#0d6efd', r: 6 }}
                        activeDot={{ r: 8 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            )}

            {/* Semester-wise Subject Breakdown */}
            {records.length > 0 && (
              <div className="mb-4">
                <h3 className="h5 fw-bold mb-3">Semester-wise Subject Breakdown</h3>
                {records.map((record) => (
                  <Card key={record._id || record.id} className="border-0 shadow-sm mb-3">
                    <Card.Header className="bg-light border-bottom d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Semester {record.semester} &mdash; Year {record.year}</span>
                      <Badge bg="primary">GPA: {record.gpa?.toFixed(2)}</Badge>
                    </Card.Header>
                    <Card.Body className="p-0">
                      {record.subjects && record.subjects.length > 0 ? (
                        <div className="table-responsive">
                          <Table striped hover className="mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>Subject</th>
                                <th className="text-center">Marks</th>
                                <th className="text-center">Grade</th>
                              </tr>
                            </thead>
                            <tbody>
                              {record.subjects.map((subject, idx) => (
                                <tr key={idx}>
                                  <td>{subject.subjectName}</td>
                                  <td className="text-center">
                                    <div
                                      className="d-inline-block"
                                      style={{ minWidth: '80px' }}
                                    >
                                      <div className="progress" style={{ height: '8px' }}>
                                        <div
                                          className={`progress-bar bg-${subject.marks >= 80 ? 'success' : subject.marks >= 60 ? 'warning' : 'danger'}`}
                                          style={{ width: `${subject.marks}%` }}
                                        />
                                      </div>
                                      <small className="text-muted">{subject.marks}/100</small>
                                    </div>
                                  </td>
                                  <td className="text-center">
                                    <Badge bg={getGradeColor(subject.grade)}>{subject.grade}</Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-muted p-3 mb-0">No subjects found for this semester.</p>
                      )}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}

            {/* Growth Analysis Summary */}
            <div>
              <h3 className="h5 fw-bold mb-3">Growth Analysis Summary</h3>
              <Row className="g-3">
                <Col lg={6}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                      <h6 className="fw-bold text-muted text-uppercase mb-2">Growth Trajectory</h6>
                      <p className="mb-0">
                        Your GPA has been trending{' '}
                        {analytics?.trend === 'Improving' ? (
                          <span className="text-success fw-bold">upward ↗</span>
                        ) : analytics?.trend === 'Declining' ? (
                          <span className="text-danger fw-bold">downward ↘</span>
                        ) : (
                          <span className="text-warning fw-bold">stable →</span>
                        )}{' '}
                        over the past semesters.
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={6}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                      <h6 className="fw-bold text-muted text-uppercase mb-2">Velocity Score</h6>
                      <p className="mb-0">
                        Your growth velocity score is{' '}
                        <strong>{analytics?.velocityScore?.toFixed(2) || '0.00'}</strong>,
                        indicating the rate of academic progress per semester.
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={6}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                      <h6 className="fw-bold text-muted text-uppercase mb-2">Performance Consistency</h6>
                      <p className="mb-0">
                        Standard deviation of{' '}
                        <strong>{calculateConsistency()}</strong> shows your grade
                        variability across semesters.
                        {parseFloat(calculateConsistency()) < 0.3
                          ? ' You are very consistent!'
                          : ' Work on maintaining more consistent performance.'}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={6}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                      <h6 className="fw-bold text-muted text-uppercase mb-2">Recommendation</h6>
                      <p className="mb-0">
                        {analytics?.trend === 'Improving' &&
                          'Maintain your current momentum and focus on areas needing improvement.'}
                        {analytics?.trend === 'Declining' &&
                          'Review your study habits and seek help in challenging subjects.'}
                        {(analytics?.trend === 'Stable' || !analytics?.trend) &&
                          'Set higher goals and implement new learning strategies.'}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
