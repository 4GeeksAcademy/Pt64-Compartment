import React from 'react';
import { CarouselPropertyListing } from './carousalPropertyListing';

const PropertyCarousel = ({ apartments, categories, onSaveToCategory, onAddCategory }) => {
  return (
    <div className="property-carousel">
      {apartments.map((apartment, index) => (
        <div key={index} className="property-carousel-item">
          <CarouselPropertyListing
            property={apartment}
            categories={categories}
            onSaveToCategory={onSaveToCategory}
            onAddCategory={onAddCategory}
          />
        </div>
      ))}
    </div>
  );
};

export default PropertyCarousel;