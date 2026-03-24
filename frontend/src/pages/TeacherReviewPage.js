import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { CheckSquare, Check, X, Clock, UserCheck } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { taskAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const TeacherReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await taskAPI.getTeacherReviews();
      setReviews(data);
      setError(null);
    } catch (err) {
      setError('Failed to load pending reviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, status) => {
    try {
      await taskAPI.updateTaskReviewStatus(taskId, status);
      // Remove handled task from the list or change its status visually
      setReviews(reviews.filter(r => r._id !== taskId));
    } catch (err) {
      console.error('Error updating review status:', err);
      alert(`Failed to mark task as ${status}`);
    }
  };

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;
  if (error) return <DashboardLayout><EmptyState icon={CheckSquare} title="Error" description={error} /></DashboardLayout>;

  return (
    <DashboardLayout>
      <Container fluid className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="mb-4">
          <h1 className="h3 fw-bold text-dark d-flex align-items-center gap-2">
            <CheckSquare size={28} className="text-primary" /> Task Reviews
          </h1>
          <p className="text-secondary">Approve or reject tasks submitted by students.</p>
        </div>

        {reviews.length > 0 ? (
          <Row className="g-4">
            {reviews.map((task) => (
              <Col lg={12} key={task._id}>
                <Card className="shadow-sm border-0 rounded-4">
                  <Card.Body className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div className="d-flex align-items-center gap-4 flex-grow-1">
                      <div 
                        className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center fs-5 fw-bold flex-shrink-0"
                        style={{ width: '50px', height: '50px' }}
                      >
                         {task.studentId?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <h5 className="mb-1 fw-bold text-dark">{task.title}</h5>
                        <p className="mb-1 text-secondary">{task.description}</p>
                        <div className="d-flex align-items-center gap-3 mt-2">
                          <small className="text-muted d-flex align-items-center gap-1"><UserCheck size={14}/> Student: <strong>{task.studentId?.name}</strong></small>
                          <small className="text-muted d-flex align-items-center gap-1"><Clock size={14}/> Submitted: {task.submissionDate ? new Date(task.submissionDate).toLocaleString() : 'Recently'}</small>
                          <Badge bg="info" className="px-2" style={{fontSize: '0.75rem'}}>Under Review</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center gap-2 mt-3 mt-md-0 border-start ps-md-4">
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        className="px-3 d-flex align-items-center gap-1 rounded-pill"
                        onClick={() => handleUpdateStatus(task._id, 'rejected')}
                      >
                        <X size={16} /> Reject
                      </Button>
                      <Button 
                        variant="success" 
                        size="sm" 
                        className="px-3 d-flex align-items-center gap-1 rounded-pill shadow-sm text-white"
                        onClick={() => handleUpdateStatus(task._id, 'approved')}
                      >
                        <Check size={16} /> Approve
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <EmptyState icon={CheckSquare} title="No Reviews Pending" description="Awesome! You have cleared all pending task reviews." />
        )}
      </Container>
    </DashboardLayout>
  );
};

export default TeacherReviewPage;
