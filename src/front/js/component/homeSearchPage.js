import React, { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import HomeMapComponent from "./homeMap";
import HomeSearch from "./homeSearch";
import ApartmentList from "./apartmentList";

export const HomeSearchPage = () => {
  const [mapData, setMapData] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearchResults = (results) => {
    console.log("Raw search results:", JSON.stringify(results, null, 2));
    setIsLoading(false);
    setError(null);
    
    if (results && results.apartments) {
      // Add unique identifiers to each apartment
      const processedResults = {
        ...results,
        apartments: results.apartments.map(apt => ({
          ...apt,
          id: uuidv4() // Add a unique ID to each apartment
        }))
      };
      
      setSearchResults(processedResults);
      
      const newMapData = processedResults.apartments.map(apt => {
        console.log(`Apartment ${apt.address} image_url:`, apt.image_url);
        return {
          id: apt.id, // Include the unique ID in map data
          latitude: apt.latitude,
          longitude: apt.longitude,
          address: apt.address,
          price: apt.price,
          bedrooms: apt.bedrooms,
          bathrooms: apt.bathrooms,
          living_area: apt.living_area,
          image_url: apt.image_url
        };
      });
      console.log("First map data item:", JSON.stringify(newMapData[0], null, 2));
      setMapData(newMapData);
    } else {
      setSearchResults(results);
    }
  };

  const startSearch = () => {
    setIsLoading(true);
    setError(null);
    setSearchResults(null);
  };

  const handleSearchError = (errorMessage) => {
    setIsLoading(false);
    setError(errorMessage);
    setSearchResults(null);
  };

  return (
    <div className="search-page">
      <div className="map-column">
        <div className="map-container map-card">
          <div className="map-title">Property Locations</div>
          <div className="map-component">
            <HomeMapComponent searchResults={mapData} />
          </div>
        </div>
      </div>
      <div className="search-column">
        <div className="search-input">
          <HomeSearch 
            onSearchResults={handleSearchResults} 
            onStartSearch={startSearch}
            onSearchError={handleSearchError}
          />
        </div>
        <div className="search-results">
          {isLoading && <p className="loading-message">Loading...</p>}
          {error && <p className="error-message">{error}</p>}
          {!isLoading && !error && searchResults && (
            <>
              {searchResults.apartments && searchResults.apartments.length > 0 ? (
                <ApartmentList apartments={searchResults.apartments} />
              ) : (
                <p>No apartments found. Try adjusting your search criteria.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeSearchPage;


// import React, { useState } from "react";
// import MapComponent from "./homeMap";
// import HomeSearch from "./homeSearch";
// import ApartmentList from "./apartmentList";
// import HomePropertyListing from "./homePropertyListing";

// export const HomeSearchPage = () => {
//   const [mapData, setMapData] = useState([]);
//   const [searchResults, setSearchResults] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [categories, setCategories] = useState(['Favorites', 'To Visit']);

//   const handleSearchResults = (results) => {
//     setIsLoading(false);
//     setError(null);
//     setSearchResults(results);
//     if (results && results.apartments) {
//       const newMapData = results.apartments.map(apt => ({
//         latitude: apt.latitude,
//         longitude: apt.longitude,
//         address: apt.address,
//         price: apt.price,
//         bedrooms: apt.bedrooms,
//         bathrooms: apt.bathrooms,
//         living_area: apt.livingArea,
//         image_url: apt.image_url
//       }));
//       console.log("Map Data:", newMapData);
//       setMapData(newMapData);
//     }
//   };

//   const startSearch = () => {
//     setIsLoading(true);
//     setError(null);
//     setSearchResults(null);
//   };

//   const handleSearchError = (errorMessage) => {
//     setIsLoading(false);
//     setError(errorMessage);
//     setSearchResults(null);
//   };

//   const handleSaveToCategory = (property, categoryId) => {
//     // Implement the logic to save the property to the selected category
//     console.log(`Saving property to category ${categoryId}:`, property);
//   };

//   const handleAddCategory = (newCategory) => {
//     setCategories([...categories, newCategory]);
//   };

//   return (
//     <div className="search-page">
//       <div className="map-column">
//         <div className="map-container map-card">
//           <div className="map-title">Property Locations</div>
//           <div className="map-component">
//             <MapComponent 
//               searchResults={mapData} 
//               categories={categories}
//               onSaveToCategory={handleSaveToCategory}
//               onAddCategory={handleAddCategory}
//             />
//           </div>
//         </div>
//       </div>
//       <div className="search-column">
//         <div className="search-input">
//           <HomeSearch 
//             onSearchResults={handleSearchResults} 
//             onStartSearch={startSearch}
//             onSearchError={handleSearchError}
//           />
//         </div>
//         <div className="search-results">
//           {isLoading && <p className="loading-message">Loading...</p>}
//           {error && <p className="error-message">{error}</p>}
//           {!isLoading && !error && searchResults && (
//             <>
//               <h2>Search Results</h2>
//               {searchResults.apartments && searchResults.apartments.length > 0 ? (
//                 <ApartmentList apartments={searchResults.apartments} />
//               ) : (
//                 <p>No apartments found. Try adjusting your search criteria.</p>
//               )}
//               {searchResults.properties && searchResults.properties.length > 0 && (
//                 searchResults.properties.map((property, index) => (
//                   <HomePropertyListing 
//                     key={index} 
//                     property={property} 
//                     categories={categories}
//                     onSaveToCategory={handleSaveToCategory}
//                     onAddCategory={handleAddCategory}
//                   />
//                 ))
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HomeSearchPage;