// // src/components/MapComponent.jsx
// import React, { useEffect, useState, useContext } from 'react';
// import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
// import { Context } from '../store/appContext';

// const containerStyle = {
//   width: '100%',
//   height: '100vh'
// };

// const center = {
//   lat: 37.7749,
//   lng: -122.4194
// };

// export const MapComponent = () => {
//   const { actions } = useContext(Context); 
//   const [apartments, setApartments] = useState([]);
//   const [selectedApartment, setSelectedApartment] = useState(null);
//   const [location, setLocation] = useState('San Francisco, CA'); 
//   const [beds, setBeds] = useState(null);
//   const [baths, setBaths] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     async function fetchApartments() {
//       try {
//         const response = await fetch(process.env.BACKEND_URL + 'api/apartments');
//         if (!response.ok) {
//           throw new Error(`Network response was not ok: ${response.statusText}`);
//         }
//         const contentType = response.headers.get("content-type");
//         if (contentType && contentType.indexOf("application/json") !== -1) {
//           const data = await response.json();

//           setApartments(data.data.results);

//           for (let i = 0; i < apartments.length; i++) {

//             if (apartments[i].description.beds == null) {
//               setBeds(apartments[i].description.beds_max);
//             } else {
//               setBeds(apartments[i].description.beds)
//             }

//             if (apartments[i].description.baths == null) {
//               setBaths(apartments[i].description.baths_max);
//             } else {
//               setBaths(apartments[i].description.baths);
//             }

//           }


//         }
//       } catch (error) {
//         setError(error);
//         console.error('Error fetching apartments:', error);
//       }
//     }


//     fetchApartments();
//   }, []);



//   return (
//     <LoadScript googleMapsApiKey="AIzaSyA78pBoItwl17q9g5pZPNUYmLuOnTDPVo8">
//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         center={center}
//         zoom={13}
//       >
//         {apartments && apartments.map && apartments.map((apartment, idx) => (
//           <Marker
//             key={idx}
//             position={{ lat: apartment.location.address.coordinate.lat, lng: apartment.location.address.coordinate.lon }}
//             onClick={() => setSelectedApartment(apartment)}
//           />
//         ))}
//         {selectedApartment && (
//           <InfoWindow
//             position={{ lat: selectedApartment.location.address.coordinate.lat, lng: selectedApartment.location.address.coordinate.lon }}
//             onCloseClick={() => setSelectedApartment(null)}
//           >
//             <div>
//               <h3>{selectedApartment.location.address.line} {selectedApartment.location.address.postal_code} , {selectedApartment.location.address.state_code} </h3>


//               <p>{selectedApartment.list_price}</p>
//               <p>{selectedApartment.description.beds || selectedApartment.description.beds_max} beds, {selectedApartment.description.baths || selectedApartment.description.baths_max} baths</p>
//             </div>
//           </InfoWindow>
//         )}
//       </GoogleMap>
//     </LoadScript>
//   );
// };

// export default MapComponent;


import React, { useEffect, useState, useContext } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Context } from '../store/appContext';

const containerStyle = {
  width: '100%',
  height: '100vh'
};

const center = {
  lat: 37.7749,
  lng: -122.4194
};

export const MapComponent = ({ onMarkerClick }) => {
  const { actions } = useContext(Context);
  const [apartments, setApartments] = useState([]);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [location, setLocation] = useState('San Francisco, CA');
  const [beds, setBeds] = useState(null);
  const [baths, setBaths] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchApartments() {
      try {
        const response = await fetch(process.env.BACKEND_URL + 'api/apartments');
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await response.json();

          setApartments(data.data.results);

          for (let i = 0; i < data.data.results.length; i++) {
            const apartment = data.data.results[i];
            if (apartment.description.beds == null) {
              setBeds(apartment.description.beds_max);
            } else {
              setBeds(apartment.description.beds)
            }

            if (apartment.description.baths == null) {
              setBaths(apartment.description.baths_max);
            } else {
              setBaths(apartment.description.baths);
            }
          }
        }
      } catch (error) {
        setError(error);
        console.error('Error fetching apartments:', error);
      }
    }

    fetchApartments();
  }, []);

  const handleMarkerClick = (apartment, index) => {
    setSelectedApartment(apartment);
    onMarkerClick(index);
  };

  return (
    <LoadScript async defer MapsApiKey="AIzaSyA78pBoItwl17q9g5pZPNUYmLuOnTDPVo8">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
      >
        {apartments && apartments.map && apartments.map((apartment, idx) => (
          <Marker
            key={idx}
            position={{ lat: apartment.location.address.coordinate.lat, lng: apartment.location.address.coordinate.lon }}
            onClick={() => handleMarkerClick(apartment, idx)}
          />
        ))}
        {selectedApartment && (
          <InfoWindow
            position={{ lat: selectedApartment.location.address.coordinate.lat, lng: selectedApartment.location.address.coordinate.lon }}
            onCloseClick={() => setSelectedApartment(null)}
          >
            <div>
              <h3>{selectedApartment.location.address.line} {selectedApartment.location.address.postal_code} , {selectedApartment.location.address.state_code} </h3>
              <p>{selectedApartment.list_price}</p>
              <p>{selectedApartment.description.beds || selectedApartment.description.beds_max} beds, {selectedApartment.description.baths || selectedApartment.description.baths_max} baths</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;