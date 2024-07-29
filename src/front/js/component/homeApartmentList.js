import React from 'react';

const HomeApartmentList = ({ apartments }) => {
  return (
    <div className="home-apartment-grid">
      {apartments.map((apartment, index) => (
        <div key={index} className="home-apartment-item">
          <img src={apartment.image_url} alt={apartment.address} />
          <h3>{apartment.address}</h3>
          <p>Price: ${apartment.price}</p>
          <p>Bedrooms: {apartment.bedrooms}</p>
          <p>Bathrooms: {apartment.bathrooms}</p>
          <p>Living Area: {apartment.living_area} sq ft</p>
        </div>
      ))}
    </div>
  );
};

export default HomeApartmentList;