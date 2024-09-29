import React, { useState, useContext } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { actions } = useContext(Context);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    const success = await actions.signUp(email, password);
    if (success) {
      alert('User signed up successfully');
      navigate('/signin');
    } else {
      alert('Signup failed. Please try again.');
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(to right, #77d0d3, #e6c994)',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="shadow-lg" style={{ borderRadius: '15px' }}>
              <Card.Body style={{ padding: '40px' }}>
                <h2 className="text-center mb-4" style={{ color: '#77d0d3', fontWeight: 'bold' }}>
                  Create an Account
                </h2>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label style={{ fontWeight: '500', color: '#333' }}>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
                      }}
                      required
                    />
                    <Form.Text className="text-muted">
                      We'll never share your email with anyone else.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label style={{ fontWeight: '500', color: '#333' }}>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
                      }}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formBasicConfirmPassword">
                    <Form.Label style={{ fontWeight: '500', color: '#333' }}>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
                      }}
                      required
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    style={{
                      backgroundColor: '#77d0d3',
                      borderColor: '#77d0d3',
                      padding: '12px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      transition: 'background-color 0.3s ease',
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#5fb8bb')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = '#77d0d3')}
                  >
                    Sign Up
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default SignUp;