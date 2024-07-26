import React, { useEffect, useState, useContext } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Context } from '../store/appContext';
import HomePropertyListing from './homePropertyListing';

const containerStyle = {
  width: '100%',
  height: '100vh'
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
};

const HomeMapComponent = ({ searchResults }) => {
  const { actions } = useContext(Context);
  const [apartments, setApartments] = useState([]);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [error, setError] = useState(null);
  const [propertyCategories, setPropertyCategories] = useState(['Favorites', 'To Visit']);

  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      console.log("Search results received:", JSON.stringify(searchResults, null, 2));
      searchResults.forEach((apt, index) => {
        console.log(`Apartment ${index} image_url:`, apt.image_url);
      });
      setApartments(searchResults);
      setCenter({
        lat: Number(searchResults[0].latitude),
        lng: Number(searchResults[0].longitude)
      });
    }
  }, [searchResults]);

  const handleSaveToCategory = (property, category) => {
    console.log(`Saving property to category: ${category}`);
    // Implement the logic to save the property to the selected category
  };

  const handleAddCategory = (newCategory) => {
    setPropertyCategories([...propertyCategories, newCategory]);
  };

  const handleMarkerClick = (apartment) => {
    console.log("Selected apartment data:", JSON.stringify(apartment, null, 2));
    console.log("Selected apartment image_url:", apartment.image_url);
    setSelectedApartment(apartment);
  };

  console.log("Rendering HomeMapComponent with apartments:", JSON.stringify(apartments, null, 2));

  return (
    <>
      <LoadScript googleMapsApiKey="AIzaSyA78pBoItwl17q9g5pZPNUYmLuOnTDPVo8">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
        >
          {apartments.map((apartment, idx) => {
            console.log("Apartment for marker:", JSON.stringify(apartment, null, 2));
            const position = {
              lat: Number(apartment.latitude),
              lng: Number(apartment.longitude)
            };
            console.log("Marker position:", position);
            return (
              <Marker
                key={idx}
                position={position}
                onClick={() => handleMarkerClick(apartment)}
              />
            );
          })}
          {selectedApartment && (
            <InfoWindow
              position={{
                lat: Number(selectedApartment.latitude),
                lng: Number(selectedApartment.longitude)
              }}
              onCloseClick={() => setSelectedApartment(null)}
            >
              <div>
                {console.log("InfoWindow selectedApartment:", JSON.stringify(selectedApartment, null, 2))}
                <HomePropertyListing
                  property={selectedApartment}
                  categories={propertyCategories}
                  onSaveToCategory={handleSaveToCategory}
                  onAddCategory={handleAddCategory}
                />
                {selectedApartment.image_url && (
                  <img
                    src={selectedApartment.image_url}
                    alt="Property"
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      console.error(`Error loading image: ${selectedApartment.image_url}`);
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                    }}
                  />
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </>
  );
};

export default HomeMapComponent;
