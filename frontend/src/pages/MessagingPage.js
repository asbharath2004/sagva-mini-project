import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle, Search } from 'lucide-react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Badge, Alert, InputGroup } from 'react-bootstrap';
import DashboardLayout from '../layouts/DashboardLayout';
import Loading from '../components/Loading';
import { messageAPI } from '../services/api_new';
import { studentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const MessagingPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Data
  const [contacts, setContacts] = useState([]); 
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Filters
  const [filterType, setFilterType] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');

  const { user: currentUser } = useAuth();
  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      if (isTeacher) {
        fetchStudents();
      } else {
        fetchConversations();
      }
      fetchUnreadCount();
    }
  }, [currentUser, isTeacher, fetchStudents, fetchConversations, fetchUnreadCount]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchStudents = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await studentAPI.getAllStudents();
      setContacts(data);
      applyFilters(data, 'all', '');
    } catch (err) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [isTeacher]);

  const fetchConversations = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await messageAPI.getUserConversations(currentUser.id || currentUser._id);
      setContacts(data);
      setFilteredContacts(data);
    } catch (err) {
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const applyFilters = (data, type, query) => {
    let result = data;
    
    if (isTeacher) {
      if (type === 'atRisk') {
        result = result.filter(s => s.velocityScore < 0 || s.currentGPA < 3.0);
      } else if (type === 'highPerformer') {
        result = result.filter(s => s.currentGPA >= 3.5);
      }
      
      if (query) {
        result = result.filter(s => s.name?.toLowerCase().includes(query.toLowerCase()));
      }
    } else {
      if (query) {
        result = result.filter(c => c._id?.toLowerCase().includes(query.toLowerCase()));
      }
    }
    
    setFilteredContacts(result);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    applyFilters(contacts, type, searchQuery);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    applyFilters(contacts, filterType, e.target.value);
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    const contactId = isTeacher ? (contact.id || contact._id) : contact._id;
    fetchConversationMessages(contactId);
  };

  const fetchConversationMessages = async (contactId) => {
    try {
      const currentId = currentUser.id || currentUser._id;
      const conversationId = [currentId, contactId].sort().join('-');
      const data = await messageAPI.getConversation(conversationId);
      setMessages(data);
      await messageAPI.markConversationAsRead(contactId, currentId);
      fetchUnreadCount();
    } catch (err) {
      console.error('Error fetching conversation:', err);
    }
  };

  const fetchUnreadCount = React.useCallback(async () => {
    try {
      const count = await messageAPI.getUnreadCount(currentUser.id || currentUser._id);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [currentUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedContact) {
      return;
    }

    const receiverId = isTeacher ? (selectedContact.id || selectedContact._id) : selectedContact._id;

    try {
      const messageData = {
        senderId: currentUser.id || currentUser._id,
        senderRole: currentUser.role,
        receiverId: receiverId,
        receiverRole: isTeacher ? 'student' : 'teacher',
        subject: '',
        messageText: newMessage,
        messageType: 'text',
        priority: 'low'
      };

      await messageAPI.sendMessage(messageData);
      setNewMessage('');
      
      // Refresh conversation
      fetchConversationMessages(receiverId);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const useSuggestion = () => {
    setNewMessage("You are falling behind, let's work together to improve your performance.");
  };

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <Container fluid className="mt-4 pb-4">
        <h2 className="mb-4">Messages</h2>

        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

        <Row style={{ height: 'calc(100vh - 180px)', minHeight: '500px' }}>
          <Col md={4} className="mb-3 h-100">
            <Card className="shadow-sm h-100" style={{ display: 'flex', flexDirection: 'column' }}>
              <Card.Header className="bg-light">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">{isTeacher ? 'Students' : 'Conversations'}</h5>
                  {unreadCount > 0 && <Badge bg="danger">{unreadCount} unread</Badge>}
                </div>
                
                {isTeacher && (
                  <Form.Group className="mb-2">
                    <Form.Select size="sm" value={filterType} onChange={(e) => handleFilterChange(e.target.value)}>
                      <option value="all">All Students</option>
                      <option value="atRisk">At Risk</option>
                      <option value="highPerformer">High Performers</option>
                    </Form.Select>
                  </Form.Group>
                )}
                
                <InputGroup size="sm">
                  <InputGroup.Text><Search size={14} /></InputGroup.Text>
                  <Form.Control
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </InputGroup>
              </Card.Header>
              
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <ListGroup variant="flush">
                  {filteredContacts.length === 0 ? (
                    <div className="p-4 text-muted text-center">
                      No {isTeacher ? 'students' : 'conversations'} found
                    </div>
                  ) : (
                    filteredContacts.map((contact) => {
                      const id = isTeacher ? (contact.id || contact._id) : contact._id;
                      const contactName = isTeacher ? contact.name : (contact.name || `Teacher (${id.substring(0, 6)}...)`);
                      const isSelected = selectedContact && (isTeacher ? ((selectedContact.id || selectedContact._id) === id) : (selectedContact._id === id));
                      const isAtRisk = isTeacher && (contact.velocityScore < 0 || contact.currentGPA < 3.0);
                      const isHighPerformer = isTeacher && (contact.currentGPA >= 3.5);
                      
                      return (
                        <ListGroup.Item
                          key={id}
                          onClick={() => handleContactSelect(contact)}
                          style={{
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#e7f3ff' : 'transparent',
                            borderLeft: isSelected ? '4px solid #0d6efd' : '4px solid transparent'
                          }}
                          className="px-3 py-3"
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="text-truncate flex-grow-1 me-2">
                              <div className="d-flex align-items-center mb-1">
                                <div 
                                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                  style={{ width: '32px', height: '32px', fontSize: '14px', fontWeight: 'bold' }}
                                >
                                  {contactName?.charAt(0)?.toUpperCase()}
                                </div>
                                <strong className="text-dark text-truncate">{contactName}</strong>
                              </div>
                              
                              {isTeacher && (
                                <div className="mt-1 ps-5">
                                  {isAtRisk ? (
                                    <Badge bg="danger" className="me-1">At Risk</Badge>
                                  ) : isHighPerformer ? (
                                    <Badge bg="success" className="me-1">High Performer</Badge>
                                  ) : (
                                    <Badge bg="secondary" className="me-1">Stable</Badge>
                                  )}
                                  <small className="text-muted" style={{fontSize: '0.75rem'}}>GPA: {contact.currentGPA?.toFixed(2)}</small>
                                </div>
                              )}
                              
                              {!isTeacher && contact.lastMessage && (
                                <p className="text-muted small mb-0 text-truncate ps-5">
                                  {contact.lastMessage}
                                </p>
                              )}
                            </div>
                            
                            {!isTeacher && contact.unreadCount > 0 && (
                              <Badge bg="primary" pill className="mt-2">{contact.unreadCount}</Badge>
                            )}
                          </div>
                        </ListGroup.Item>
                      );
                    })
                  )}
                </ListGroup>
              </div>
            </Card>
          </Col>

          <Col md={8} className="h-100">
            {selectedContact ? (
              <Card className="shadow-sm h-100" style={{ display: 'flex', flexDirection: 'column' }}>
                <Card.Header className="bg-white border-bottom py-3">
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                      style={{ width: '40px', height: '40px', fontSize: '16px', fontWeight: 'bold' }}
                    >
                      {isTeacher 
                        ? selectedContact.name?.charAt(0)?.toUpperCase() 
                        : 'T'}
                    </div>
                    <div>
                      <h5 className="mb-0">
                        {isTeacher ? selectedContact.name : `Teacher (${selectedContact._id.substring(0, 8)}...)`}
                      </h5>
                      {isTeacher && (
                        <small className="text-muted">
                          {selectedContact.department || 'General'} | Year {selectedContact.year}
                        </small>
                      )}
                    </div>
                  </div>
                </Card.Header>

                <Card.Body
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1.5rem'
                  }}
                >
                  {messages.length === 0 ? (
                    <div className="text-center text-muted m-auto opacity-75">
                      <div className="mb-3">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                      <p className="fs-5">No messages yet.</p>
                      <p className="small">Start the conversation by sending a message below.</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                       const isMe = msg.senderId === (currentUser.id || currentUser._id);
                       const showSender = index === 0 || messages[index - 1].senderId !== msg.senderId;
                       
                       return (
                      <div
                        key={msg._id}
                        className={`mb-3 d-flex flex-column ${isMe ? 'align-items-end' : 'align-items-start'}`}
                      >
                        {showSender && (
                          <small className="text-muted mb-1 px-1 fw-bold" style={{ fontSize: '0.75rem' }}>
                            {isMe ? 'You' : (isTeacher ? selectedContact.name : 'Teacher')}
                          </small>
                        )}
                        <div
                          style={{
                             maxWidth: '75%',
                             backgroundColor: isMe ? '#0d6efd' : '#ffffff',
                             color: isMe ? 'white' : '#212529',
                             padding: '10px 16px',
                             borderRadius: '16px',
                             borderBottomRightRadius: isMe ? '4px' : '16px',
                             borderBottomLeftRadius: isMe ? '16px' : '4px',
                             boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                             border: isMe ? 'none' : '1px solid rgba(0,0,0,0.05)'
                          }}
                        >
                          <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{msg.messageText}</p>
                        </div>
                        <div className="mt-1 px-1 d-flex align-items-center">
                          <small className="text-muted" style={{ fontSize: '0.65rem' }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </small>
                          {isMe && (
                              <span className="ms-1 d-flex align-items-center">
                                {msg.isRead ? <CheckCircle size={12} className="text-primary ms-1" /> : <CheckCircle size={12} className="text-muted ms-1" />}
                              </span>
                          )}
                        </div>
                      </div>
                    )})
                  )}
                  <div ref={messagesEndRef} />
                </Card.Body>

                <Card.Footer className="bg-white border-top p-3 p-md-4">
                  {isTeacher && (selectedContact.velocityScore < 0 || selectedContact.currentGPA < 3.0) && (
                    <div className="mb-3">
                       <Badge 
                         bg="primary" 
                         className="px-3 py-2 cursor-pointer shadow-sm hover-overlay"
                         style={{ cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #0d6efd', backgroundColor: '#e7f3ff', color: '#0d6efd' }}
                         onClick={useSuggestion}
                       >
                         💡 Suggested: "You are falling behind, let's work together to improve your performance."
                       </Badge>
                    </div>
                  )}
                  <Form onSubmit={handleSendMessage}>
                    <InputGroup size="lg" className="shadow-sm">
                      <Form.Control
                        type="text"
                        placeholder="Type your message here..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        style={{ fontSize: '0.95rem' }}
                      />
                      <Button variant="primary" type="submit" disabled={!newMessage.trim()} className="px-4">
                        <Send size={20} />
                      </Button>
                    </InputGroup>
                  </Form>
                </Card.Footer>
              </Card>
            ) : (
              <Card className="shadow-sm h-100 text-center d-flex justify-content-center align-items-center bg-light">
                <div className="text-muted opacity-75">
                  <MessageCircleIcon />
                  <p className="fs-5 mt-3">Select a {isTeacher ? 'student' : 'conversation'}</p>
                  <p className="small">Choose someone from the list to start messaging</p>
                </div>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </DashboardLayout>
  );
};

const MessageCircleIcon = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

export default MessagingPage;
