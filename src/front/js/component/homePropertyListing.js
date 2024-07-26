import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup, FormControl, Carousel, Alert } from 'react-bootstrap';

const HomePropertyListing = ({ property, categories, onSaveToCategory, onAddCategory }) => {
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState(null);
  const [photoUrls, setPhotoUrls] = useState([]);

  useEffect(() => {
    console.log('Full property data in HomePropertyListing:', JSON.stringify(property, null, 2));
    
    if (property) {
      console.log('Raw image_url:', property.image_url);
      console.log('Type of image_url:', typeof property.image_url);

      if (property.image_url) {
        let urls;
        if (typeof property.image_url === 'string') {
          urls = [property.image_url];
        } else if (Array.isArray(property.image_url)) {
          urls = property.image_url;
        } else {
          console.error('Unexpected image_url format:', property.image_url);
          urls = [];
        }
        console.log('Processed photoUrls:', urls);
        setPhotoUrls(urls);
      } else {
        console.log('No image_url found in property data');
        setPhotoUrls([]);
      }
    } else {
      console.log('Property is null or undefined');
    }
  }, [property]);

  if (!property) {
    console.log('No property data received');
    return <div>No property data available</div>;
  }

  const handleSave = async () => {
    setError(null);
    if (selectedCategory) {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/add_listing`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            cid: selectedCategory,
            listingName: property.address
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Listing added successfully');
        onSaveToCategory(property, selectedCategory);
        setShowModal(false);
      } catch (error) {
        console.error('Error adding listing:', error);
        setError(error.message);
      }
    } else {
      setError('Please select a category');
    }
  };

  const getBedsDescription = (beds) => {
    return beds === 0 ? 'Studio' : `${beds} beds`;
  };

  const handleAddCategory = async () => {
    setError(null);
    const token = sessionStorage.getItem('token');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/create_category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCategory }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data) {
        console.log('Category created successfully');
        onAddCategory(data.name || newCategory);
        setSelectedCategory(data.id || data.name);
        setNewCategory('');
      } else {
        console.error('Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setError(error.message);
    }
  };

  const {
    address,
    price,
    bedrooms,
    bathrooms,
    living_area,
  } = property;

  console.log('Rendering with photoUrls:', photoUrls);

  return (
    <div className="property-listing">
      <h3>{address || 'Address not available'}</h3>
      <p>Price: ${typeof price === 'number' ? price.toLocaleString() : (price || 'N/A')}</p>
      <p>{getBedsDescription(bedrooms)}, {bathrooms} baths</p>
      {photoUrls.length > 0 ? (
        <Carousel>
          {photoUrls.map((url, index) => (
            <Carousel.Item key={index}>
              <img
                className="d-block w-100"
                src={url}
                alt={`Property photo ${index + 1}`}
                onError={(e) => {
                  console.error(`Error loading image: ${url}`);
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      ) : (
        <div>
         
        </div>
      )}
      <Button onClick={() => setShowModal(true)}>Add to Category</Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add to Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group controlId="formCategorySelect">
              <Form.Label>Select Category</Form.Label>
              <Form.Control
                as="select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select a category</option>
                {categories?.map((category, index) => (
                  <option key={category.id || index} value={category.id}>
                    {category.categoryName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <hr />
            <InputGroup className="mb-3">
              <FormControl
                placeholder="New Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Button variant="outline-secondary" onClick={handleAddCategory}>
                Add
              </Button>
            </InputGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HomePropertyListing;