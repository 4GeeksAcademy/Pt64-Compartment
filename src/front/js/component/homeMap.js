import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Context } from '../store/appContext';

const containerStyle = {
  width: '100%',
  height: '80vh'
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
};

const markerSVG = {
  default: encodeURIComponent(`
    <svg width="32" height="48" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.16344 0 0 7.16344 0 16C0 28 16 48 16 48C16 48 32 28 32 16C32 7.16344 24.8366 0 16 0Z" fill="#77d0d3"/>
      <circle cx="16" cy="16" r="8" fill="white"/>
    </svg>
  `),
  selected: encodeURIComponent(`
    <svg width="32" height="48" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.16344 0 0 7.16344 0 16C0 28 16 48 16 48C16 48 32 28 32 16C32 7.16344 24.8366 0 16 0Z" fill="#5fb8bb"/>
      <circle cx="16" cy="16" r="8" fill="white"/>
    </svg>
  `)
};

const HomeMapComponent = ({ searchResults, onMarkerClick }) => {
  const {isLoaded} = useJsApiLoader({id:"google-map-script", googleMapsApiKey:process.env.REACT_APP_GOOGLE_MAPS_API_KEY, libraries:["geometry", "places", "drawing"]}) 
  const { actions } = useContext(Context);
  const [apartments, setApartments] = useState([]);
  const [selectedApartmentIndex, setSelectedApartmentIndex] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [error, setError] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);
  const mapRef = useRef(null);

  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      console.log("Search results received:", searchResults);
      setApartments(searchResults);
      setCenter({
        lat: Number(searchResults[0].latitude) || defaultCenter.lat,
        lng: Number(searchResults[0].longitude) || defaultCenter.lng
      });
    }
  }, [searchResults]);

  const handleMarkerClick = (apartment, index) => {
    console.log("Selected apartment data:", apartment);
    setSelectedApartmentIndex(index);
    setAnimationKey(prevKey => prevKey + 1);
    onMarkerClick(index);
  };

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    // You can perform any operations that require the google object here
  }, []);

  console.log("Rendering HomeMapComponent with apartments:", apartments);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      console.log(process.env.REACT_APP_GOOGLE_MAPS_API_KEY)
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places,geometry,drawing&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    window.initMap = () => {
      // The map is now loaded and ready to use
      console.log("Google Maps API loaded");
    };
  }, []);

  return isLoaded && <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          onLoad={onMapLoad}
          options={{
            styles: [
              {
                featureType: "all",
                elementType: "labels.text.fill",
                stylers: [{ color: "#7c93a3" }, { lightness: "-10" }]
              },
              // ... (rest of your map styles)
            ]
          }}
        >
          {apartments.map((apartment, idx) => {
            console.log("Apartment for marker:", apartment);
            const position = {
              lat: Number(apartment.latitude) || defaultCenter.lat,
              lng: Number(apartment.longitude) || defaultCenter.lng
            };
            console.log("Marker position:", position);
            return (
              <Marker
                key={`${idx}-${selectedApartmentIndex === idx ? animationKey : ''}`}
                position={position}
                onClick={() => handleMarkerClick(apartment, idx)}
                icon={{
                  url: `data:image/svg+xml;charset=UTF-8,${selectedApartmentIndex === idx ? markerSVG.selected : markerSVG.default}`,
                  scaledSize: new window.google.maps.Size(32, 48),
                  anchor: new window.google.maps.Point(16, 48),
                }}
                animation={selectedApartmentIndex === idx ? window.google.maps.Animation.DROP : null}
              />
            );
          })}
        </GoogleMap>
      
    // </LoadScript>
 
};

export default HomeMapComponent;