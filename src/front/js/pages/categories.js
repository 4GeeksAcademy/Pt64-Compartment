import React, { useState, useContext } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form } from 'react-bootstrap';
import { Context } from '../store/appContext';
import { Link } from 'react-router-dom';
import '../../styles/category.css';

export const Category = () => {
    const { store, actions } = useContext(Context);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showModal, setShowModal] = useState(false);

    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);

    const handleCreateCategory = () => {
        actions.handleCreateCategory(newCategoryName);
        setNewCategoryName('');
        handleClose();
    };

    const handleDeleteCategory = async (categoryId) => {
        const response = await fetch(process.env.BACKEND_URL + "api/delete_category", {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: categoryId })
        });
        if (response.ok) {
            actions.fetchCategories();
        } else {
            console.error('Failed to delete category:', response.status);
        }
    };

    return (
        <div
            style={{
                background: 'linear-gradient(to right, #77d0d3, #e6c994)',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 0'
            }}
        >
            <Container>
                <h2
                    className="text-center mb-4"
                    style={{ color: '#007bff', fontWeight: 'bold', fontSize: '2rem' }}
                >
                    Categories
                </h2>
                <Row className="d-flex justify-content-center">
                    {store.categories.map(category => (
                        <Col
                            md={3}
                            key={category.id}
                            className="mb-4 d-flex justify-content-center"
                            style={{ padding: '15px' }}
                        >
                            <Card
                                className="h-100 shadow-lg text-center"
                                style={{
                                    borderRadius: '15px',
                                    width: '100%',
                                    height: '130px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#fff',
                                    transition: 'transform 0.3s ease box- shadow 0.3s ease',
                                    border: '1px solid #ddd',
                                    backgroundColor: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0px 10px 15px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
                                }}
                            >
                                <Card.Body className="d-flex justify-content-between align-items-center" style={{ width: '100%' }}>
                                    <Link
                                        to={`/categories/${category.id}`}
                                        className="text-decoration-none"
                                        style={{
                                            color: '#333',
                                            fontWeight: '500',
                                            fontSize: '1.2rem',
                                            flex: '1'
                                        }}
                                    >
                                        {category.categoryName}
                                    </Link>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDeleteCategory(category.id)}
                                        style={{
                                            backgroundColor: '#ff6b6b',
                                            borderColor: '#ff6b6b',
                                            borderRadius: '50%',
                                            padding: '5px 12px',
                                            fontWeight: 'bold',
                                            fontSize: '1.2rem'
                                        }}
                                    >
                                        &times;
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <div className="text-center mt-4">
                    <Button
                        variant="primary"
                        onClick={handleShow}
                        style={{
                            backgroundColor: '#77d0d3',
                            borderColor: '#77d0d3',
                            padding: '12px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            transition: 'background-color 0.3s ease',
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = '#5fb8bb')}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = '#77d0d3')}
                    >
                        Create New Category
                    </Button>
                </div>

                <Modal show={showModal} onHide={handleClose} centered>
                    <Modal.Header
                        closeButton
                        style={{ backgroundColor: '#77d0d3', color: 'white', borderRadius: '8px 8px 0 0' }}
                    >
                        <Modal.Title>Create New Category</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="formCategoryName">
                                <Form.Label style={{ fontWeight: '500', color: '#333' }}>
                                    Category Name
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter category name"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ccc',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
                                    }}
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={handleClose}
                            style={{ borderRadius: '8px', fontWeight: 'bold' }}
                        >
                            Close
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleCreateCategory}
                            style={{
                                backgroundColor: '#77d0d3',
                                borderColor: '#77d0d3',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                transition: 'background-color 0.3s ease',
                            }}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = '#5fb8bb')}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = '#77d0d3')}
                        >
                            Create Category
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div >
    );
};