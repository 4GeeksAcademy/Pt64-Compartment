import React from 'react';

const ApartmentList = ({ apartments }) => {
  const handleImageError = (e, apartment) => {
    console.error(`Error loading image for apartment: ${apartment.address}`);
    console.error(`Image URL: ${apartment.imageUrl || apartment.image_url}`);
    e.target.src = 'https://via.placeholder.com/150?text=No+Image'; 
  };

  const handleContactAgent = (apartment) => {
    if (apartment.zpid) {
      const zillowUrl = `https://www.zillow.com/homes/${apartment.zpid}_zpid/`;
      window.open(zillowUrl, '_blank');
    } else {
      console.error("No ZPID available for this property");
    }
  };

  return (
    <div className="apartment-list">
      {apartments.map((apartment, index) => {
        const imageUrl = apartment.imageUrl || apartment.image_url;
        return (
          <div key={index} className="house-info">
            <div className="house-image">
              <img
                src={imageUrl || 'https://via.placeholder.com/150?text=No+Image'}
                alt={`Apartment ${index + 1}`}
                onError={(e) => handleImageError(e, apartment)}
              />
              <div className="house-status">
                <span className="status-dot"></span>
                House for Sale
              </div>
            </div>
            <div className="house-meta">
              <div className="house-price">${apartment.price.toLocaleString()}</div>
              <div className="house-details">
                {apartment.bedrooms} bd | {apartment.bathrooms} ba | {apartment.livingArea || apartment.living_area} sqft
              </div>
              <div className="house-address">{apartment.address}</div>
              <div className="button-wrapper">
                <button className="contact-button" onClick={() => handleContactAgent(apartment)}>Zillow</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ApartmentList;