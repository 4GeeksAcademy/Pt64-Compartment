import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { Context } from '../store/appContext';
import { PropertyListing } from './propertyListing';
import PropertyCarousel from './propertyCarousal';
import '../../styles/map.css';
import MapSearchBar from './mapSearchbar';

const containerStyle = {
  width: '120vh',
  marginLeft: '130px',
  height: '80vh'
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
};

export const AptMapComponent = () => {
  const { actions } = useContext(Context);
  const [apartments, setApartments] = useState([]);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [error, setError] = useState(null);
  const [propertyCategories, setPropertyCategories] = useState(['Favorites', 'To Visit']);
  const markersRef = useRef(new Map()); // Use useRef to store markers
  const mapRef = useRef(null); // Reference to the map instance


  const fetchCategories = () => {
    //const token = sessionStorage.getItem('token'); // Retrieve the JWT token from sessionStorage

    return fetch(process.env.BACKEND_URL + "api/categories", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
           // 'Authorization': `Bearer ${token}` // Include the JWT token in the Authorization header
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || 'Failed to fetch categories');
            });
        }
        return response.json();
    })
    .then(data => {
        setPropertyCategories(data);
        console.log('Fetched categories:', data);
        return data; // Return the fetched categories data
    })
    .catch(error => {
        console.error('Error fetching categories:', error.message);
        // Optionally, you can handle the error by displaying a message to the user
    });
  };










  const fetchCoordinates = useCallback(async (address) => {
    try {
      const response = await fetch(process.env.BACKEND_URL + `api/geocode?address=${encodeURIComponent(address)}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      throw error;
    }
  }, []);

  const fetchApartments = useCallback(async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(process.env.BACKEND_URL + `api/apartments?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();
      const updatedApartments = await Promise.all(data.data.results.map(async (apartment) => {
        if (!apartment.location.address.coordinate) {
          const address = `${apartment.location.address.line} ${apartment.location.address.city} ${apartment.location.address.state} ${apartment.location.address.postal_code} ${apartment.location.address.country}`;
          const coordinates = await fetchCoordinates(address);
          if (coordinates && coordinates.latitude && coordinates.longitude) {
            apartment.location.address.coordinate = {
              lat: coordinates.latitude,
              lon: coordinates.longitude,
            };
          }
        }
        return apartment;
      }));
      setApartments(updatedApartments);
    } catch (error) {
      setError(error);
      console.error('Error fetching apartments:', error);
    }
  }, [fetchCoordinates]);

  useEffect(() => {
    fetchApartments();
  }, [fetchApartments]);

  useEffect(() => {
    fetchCategories()
      .then(data => {
        if (data) {
          setPropertyCategories(data);
        }
      })
      .catch(err => setError(err.message));
  }, []);

  const handleSaveToCategory = (property, category) => {
    console.log(`Saving property to category: ${category}`);
  };

  // const handleAddCategory = (newCategory) => {
  //   setPropertyCategories(prevCategories => [...prevCategories, newCategory]);
  // };

  const handleSearch = async (filters) => {
    await fetchApartments(filters);
    if (filters.location) {
      const coordinates = await fetchCoordinates(filters.location);
      if (coordinates && coordinates.latitude && coordinates.longitude) {
        setCenter({ lat: coordinates.latitude, lng: coordinates.longitude });
        if (mapRef.current) {
          mapRef.current.panTo({ lat: coordinates.latitude, lng: coordinates.longitude });
        }
      }
    }
  };

  const addOrUpdateMarker = (id, position) => {
    if (markersRef.current.has(id)) {
      markersRef.current.get(id).setPosition(position);
    } else {
      const newMarker = new google.maps.Marker({
        position: position,
        map: mapRef.current
      });
      markersRef.current.set(id, newMarker);
    }
  };

  useEffect(() => {
    if (mapRef.current) {
      apartments.forEach(apartment => {
        if (apartment.location.address.coordinate) {
          addOrUpdateMarker(apartment.id, {
            lat: apartment.location.address.coordinate.lat,
            lng: apartment.location.address.coordinate.lon
          });
        }
      });

      // Adjust the map to fit all markers
      const bounds = new window.google.maps.LatLngBounds();
      apartments.forEach(apartment => {
        if (apartment.location.address.coordinate) {
          bounds.extend({
            lat: apartment.location.address.coordinate.lat,
            lng: apartment.location.address.coordinate.lon
          });
        }
      });
      mapRef.current.fitBounds(bounds);
    }
  }, [apartments]);

  const handleAddCategory = async (newCategory) => {
    try {
      // Add the new category to the backend
      const response = await fetch(process.env.BACKEND_URL + "api/create_category", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategory }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create category');
      }
  
      const data = await response.json();
      console.log('Category created successfully', data);
      const newCategoryObject = {
        id: Date.now().toString(),
        categoryName: newCategory
      };

      setPropertyCategories(prevCategories => [...prevCategories, newCategoryObject]);
  
      // No need to fetch categories again, as we've already updated the state
    } catch (error) {
      console.error('Error adding category:', error);
      setError(error.message);
    }
  };

  
  return (
    <div className="apt-map-container">
      <MapSearchBar onSearch={handleSearch} />
      <div className="apt-map-and-carousel">
        <div className="apt-map">
          <LoadScript googleMapsApiKey="AIzaSyA78pBoItwl17q9g5pZPNUYmLuOnTDPVo8">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={13}
              onLoad={mapInstance => {
                mapRef.current = mapInstance;
                apartments.forEach(apartment => {
                  if (apartment.location.address.coordinate) {
                    addOrUpdateMarker(apartment.id, {
                      lat: apartment.location.address.coordinate.lat,
                      lng: apartment.location.address.coordinate.lon
                    });
                  }
                });
              }}
            >
              {apartments.map(apartment => (
                apartment.location.address.coordinate && (
                  <MarkerF
                    key={apartment.id}
                    position={{
                      lat: apartment.location.address.coordinate.lat,
                      lng: apartment.location.address.coordinate.lon
                    }}
                    onClick={() => setSelectedApartment(apartment)}
                  />
                )
              ))}
              {selectedApartment && (
                <InfoWindowF
                  position={{
                    lat: selectedApartment.location.address.coordinate.lat,
                    lng: selectedApartment.location.address.coordinate.lon
                  }}
                  onCloseClick={() => setSelectedApartment(null)}
                >
                  <PropertyListing
                    property={selectedApartment}
                    categories={propertyCategories}
                    onSaveToCategory={handleSaveToCategory}
                    onAddCategory={handleAddCategory}
                  />
                </InfoWindowF>
              )}
            </GoogleMap>
          </LoadScript>
        </div>
        <div className="carousel">
          <PropertyCarousel
            apartments={apartments}
            categories={propertyCategories}
            onSaveToCategory={handleSaveToCategory}
            onAddCategory={handleAddCategory}
          />
        </div>
      </div>
    </div>
  );
};

export default AptMapComponent;