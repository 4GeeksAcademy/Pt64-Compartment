import React, { useState, useRef, useEffect } from "react";
import MapComponent from "./homeMap";
import ApartmentList from "./apartmentList";
import { Container, Row, Col } from 'react-bootstrap'
import HomeMapSearchBar from "./homeMapSearchBar";


export const HomeSearchPage = () => {
  const [mapData, setMapData] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedApartmentIndex, setSelectedApartmentIndex] = useState(null);
  const apartmentRefs = useRef([]);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://backend-nestify-5c7b2f6794c9.herokuapp.com/";

  const handleSearch = async (searchCriteria) => {
    console.log('Starting handleSearch');
    setIsLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const preferences = {
        location: searchCriteria.location,
        bedrooms: searchCriteria.beds,
        bathrooms: searchCriteria.baths,
        sort: "Newest"
      };

      console.log("Search preferences:", preferences);
      console.log("Backend URL:", process.env.REACT_APP_BACKEND_URL);

      const response = await fetch (`https://verbose-space-acorn-7vjq4wxrxwfpv5w-3001.app.github.dev/api/analyze_apartments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response received:", data);

      if (data.apartments && data.apartments.length > 0) {
        const processedApartments = processApartments(data.apartments);
        handleSearchResults({ ...data, apartments: processedApartments });
      } else {
        console.log("No apartments found in the response");
        handleSearchResults(data);
      }
    } catch (error) {
      console.error("Error in handleSearch:", error);
      handleSearchError("An error occurred while fetching results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const processApartments = (apartments) => {
    return apartments.map(apt => {
      let lat = apt.latitude;
      let lng = apt.longitude;

      if (!lat && !lng && apt.location && apt.location.address && apt.location.address.coordinate) {
        lat = apt.location.address.coordinate.lat;
        lng = apt.location.address.coordinate.lon;
      }

      return {
        id: apt.zpid,
        zpid: apt.zpid, // Added this line to ensure zpid is included
        latitude: lat,
        longitude: lng,
        address: apt.address,
        price: apt.price,
        bedrooms: apt.bedrooms,
        bathrooms: apt.bathrooms,
        livingArea: apt.living_area,
        imageUrl: apt.image_url || apt.imgSrc,
      };
    }).filter(apt => apt.latitude && apt.longitude);
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
    if (results && results.apartments) {
      const newMapData = results.apartments.map(apt => ({
        latitude: apt.latitude,
        longitude: apt.longitude,
        address: apt.address,
        price: apt.price,
        bedrooms: apt.bedrooms,
        bathrooms: apt.bathrooms,
        living_area: apt.livingArea,
        image_url: apt.imageUrl
      }));
      console.log("Map Data:", newMapData);
      setMapData(newMapData);
    }
  };

  const handleSearchError = (errorMessage) => {
    setError(errorMessage);
    setSearchResults(null);
  };

  const handleMarkerClick = (index) => {
    setSelectedApartmentIndex(index);
    if (apartmentRefs.current[index]) {
      apartmentRefs.current[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  };

  useEffect(() => {
    setSelectedApartmentIndex(null);
  }, [searchResults]);

  useEffect(() => {
    apartmentRefs.current.forEach(ref => {
      if (ref) ref.classList.remove('highlighted');
    });

    if (selectedApartmentIndex !== null && apartmentRefs.current[selectedApartmentIndex]) {
      apartmentRefs.current[selectedApartmentIndex].classList.add('highlighted');
    }
  }, [selectedApartmentIndex]);

  return (
    <div className="search-page">
      <Container fluid>
        <Row>
          <Col md={6} lg={7} className="map-column">
            <div className="map-container">
              <div className="map-component">
                <MapComponent
                  searchResults={mapData}
                  onMarkerClick={handleMarkerClick}
                />
              </div>
            </div>
          </Col>

          <Col md={6} lg={5} className="search-column">
            <Container fluid className="">
              <Row className="justify-content-center">
                <Col xs={12} md={6} className="d-flex flex-column align-items-center">

                  <div className=" mt-3">
                    <HomeMapSearchBar onSearch={handleSearch} />
                  </div>
                </Col>
              </Row>
            </Container>
            <div className="search-results">
              {isLoading && <p className="loading-message">Loading...</p>}
              {error && <p className="error-message">{error}</p>}
              {!isLoading && !error && searchResults && (
                <>
                  {searchResults.apartments && searchResults.apartments.length > 0 ? (
                    <Container fluid>
                      <Row>
                        {searchResults.apartments.map((apartment, index) => (
                          <Col key={apartment.id} xs={12} md={6} lg={4} className="mb-4">
                            <div
                              ref={el => apartmentRefs.current[index] = el}
                              className="apartment-wrapper h-100"
                            >
                              <ApartmentList apartments={[apartment]} />
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </Container>
                  ) : (
                    <p>No apartments found. Try adjusting your search criteria.</p>
                  )}
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HomeSearchPage;