import React, { useState } from 'react';
import { Button, Modal, Form, Container, Row, Col } from 'react-bootstrap';

export const CreateCategory = () => {
    const [newCategory, setNewCategory] = useState('');
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleCreateCategory = () => {
        fetch(process.env.BACKEND_URL + "api/create_category", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: newCategory }),
        })
        .then(response => {
            if (response.ok) {
                console.log('Category created successfully');
                setNewCategory('');
                handleClose();
            } else {
                console.error('Failed to create category');
            }
        })
        .catch(error => {
            console.error('Error creating category:', error);
        });
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Button 
                        variant="primary" 
                        onClick={handleShow}
                        style={{ backgroundColor: '#77d0d3', borderColor: '#77d0d3' }}
                    >
                        Create New Category
                    </Button>

                    <Modal show={show} onHide={handleClose} centered>
                        <Modal.Header closeButton style={{ backgroundColor: '#77d0d3', color: 'white' }}>
                            <Modal.Title>Create New Category</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Form.Group className="mb-3" controlId="formCategoryName">
                                    <Form.Label>Category Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter category name"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                    />
                                </Form.Group>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={handleCreateCategory}
                                style={{ backgroundColor: '#77d0d3', borderColor: '#77d0d3' }}
                            >
                                Create Category
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Col>
            </Row>
        </Container>
    );
}



// front end for creating new entry in database
// import React, { useState } from 'react';

// const AddListingForm = () => {
//     const [listingName, setListingName] = useState('');
//     const [cid, setCid] = useState('');

//     const handleSubmit = async (event) => {
//         event.preventDefault();

//         try {
//             const response = await fetch('http://localhost:5000/add_listing', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     cid: cid,
//                     listingName: listingName
//                 }),
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to add listing');
//             }

//             const responseData = await response.json();
//             console.log(responseData.message);  // Success message

//         } catch (error) {
//             console.error('Error adding listing:', error);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit}>
//             <input
//                 type="text"
//                 value={listingName}
//                 onChange={(e) => setListingName(e.target.value)}
//                 placeholder="Listing Name"
//                 required
//             />
//             <input
//                 type="number"
//                 value={cid}
//                 onChange={(e) => setCid(e.target.value)}
//                 placeholder="Category ID"
//                 required
//             />
//             <button type="submit">Add Listing</button>
//         </form>
//     );
// };

// export default AddListingForm;