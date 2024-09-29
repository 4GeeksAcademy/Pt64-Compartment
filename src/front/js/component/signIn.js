import React, { useState, useContext } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';

function SignIn() {
  const { actions } = useContext(Context);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !email) {
      alert('Missing field');
      return;
    }
    const success = await actions.logIn(email, password);
    if (success) {
      console.log('User signed in successfully');
      navigate('/searchPage');
    } else {
      console.log('Signin failed');
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(to right, #77d0d3, #e6c994) ',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="shadow-sm" style={{ borderRadius: '15px' }}>
              <Card.Body style={{ padding: '40px' }}>
                <h2 className="text-center mb-4" style={{ color: '#77d0d3', fontWeight: 'bold' }}>Sign In</h2>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label style={{ fontWeight: '500', color: '#333' }}>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        boxShadow: '0px 4px 6px rgba(0,0,0,0.3)'
                      }}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        boxShadow: '0px 4px 6px rgba(0,0,0,0.3)'
                      }}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    style={{ backgroundColor: '#77d0d3', borderColor: '#77d0d3', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', transition: 'background-color 0.3s ease' }}
                  >
                    Sign In
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

export default SignIn;