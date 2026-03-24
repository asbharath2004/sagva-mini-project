import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Tabs, Tab } from 'react-bootstrap';
import { List, CheckCircle, Clock, XCircle } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { taskAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const StudentTasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const userId = user._id || user.id;
        const tasksData = await taskAPI.getStudentTasks(userId);
        setTasks(tasksData);
        setError(null);
      } catch (err) {
        setError('Failed to load tasks');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user]);

  const handleApplyReview = async (taskId) => {
    try {
      await taskAPI.applyForReview(taskId);
      setTasks(tasks.map((t) => (t._id === taskId ? { ...t, status: 'under_review' } : t)));
    } catch (err) {
      console.error('Error applying for review:', err);
      alert('Failed to apply for review');
    }
  };

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;
  if (error) return <DashboardLayout><EmptyState icon={List} title="Error" description={error} /></DashboardLayout>;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning" className="text-dark">Pending</Badge>;
      case 'completed':
        return <Badge bg="secondary">Completed</Badge>;
      case 'under_review':
        return <Badge bg="info">Under Review</Badge>;
      case 'approved':
        return <Badge bg="success">Approved</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="light" className="text-dark">{status}</Badge>;
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const reviewTasks = tasks.filter(t => ['under_review', 'approved', 'rejected'].includes(t.status));
  const completedTasks = tasks.filter(t => t.status === 'completed'); // Kept for legacy compatibility if needed

  return (
    <DashboardLayout>
      <Container fluid className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="mb-4">
          <h1 className="h3 fw-bold text-dark d-flex align-items-center gap-2">
            <List size={28} className="text-primary" /> My Tasks
          </h1>
          <p className="text-secondary">View and submit your assignments and tasks for review.</p>
        </div>

        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
          <Tab eventKey="pending" title={`Pending (${pendingTasks.length})`}>
            {pendingTasks.length > 0 ? (
              <Row className="g-4">
                {pendingTasks.map((task) => (
                  <Col lg={4} md={6} key={task._id}>
                    <Card className="shadow-sm border-0 rounded-4 h-100">
                      <Card.Body className="p-4 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <strong className="d-block text-dark h5 mb-0">{task.title}</strong>
                          {getStatusBadge(task.status)}
                        </div>
                        <p className="text-secondary mb-4 flex-grow-1">{task.description}</p>
                        <div className="d-flex justify-content-between align-items-center mt-auto">
                          <small className="text-muted">
                            Due: {new Date(task.deadline).toLocaleDateString()}
                          </small>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="rounded-pill px-3 shadow-sm"
                            onClick={() => handleApplyReview(task._id)}
                          >
                            Apply for Review
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <EmptyState icon={CheckCircle} title="All Caught Up!" description="You have no pending tasks." />
            )}
          </Tab>
          
          <Tab eventKey="reviews" title={`Reviews History (${reviewTasks.length})`}>
            {reviewTasks.length > 0 ? (
              <Row className="g-4">
                {reviewTasks.map((task) => (
                  <Col lg={4} md={6} key={task._id}>
                    <Card className="shadow-sm border-0 rounded-4 h-100">
                      <Card.Body className="p-4 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <strong className="d-block text-dark h5 mb-0">{task.title}</strong>
                          {getStatusBadge(task.status)}
                        </div>
                        <p className="text-secondary mb-4 flex-grow-1">{task.description}</p>
                        <div className="mt-auto d-flex align-items-center gap-2 text-muted">
                           {task.status === 'under_review' && <><Clock size={16} /> <small>Awaiting teacher response</small></>}
                           {task.status === 'approved' && <><CheckCircle size={16} className="text-success" /> <small className="text-success">Task Approved</small></>}
                           {task.status === 'rejected' && <><XCircle size={16} className="text-danger" /> <small className="text-danger">Task Rejected</small></>}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <EmptyState icon={Clock} title="No Reviews Yet" description="You haven't submitted any tasks for review recently." />
            )}
          </Tab>

          {/* Legacy Completed - just in case */}
          {completedTasks.length > 0 && (
             <Tab eventKey="completed" title={`Legacy Completed (${completedTasks.length})`}>
                <Row className="g-4">
                  {completedTasks.map((task) => (
                    <Col lg={4} md={6} key={task._id}>
                      <Card className="shadow-sm border-0 bg-light rounded-4 h-100">
                        <Card.Body className="p-4">
                          <div className="d-flex justify-content-between mb-3">
                            <strong className="d-block text-muted h5 mb-0">{task.title}</strong>
                            {getStatusBadge(task.status)}
                          </div>
                          <p className="text-muted">{task.description}</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
             </Tab>
          )}
        </Tabs>
      </Container>
    </DashboardLayout>
  );
};

export default StudentTasksPage;
