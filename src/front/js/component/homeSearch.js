import React, { useState } from 'react';

function HomeSearch({ onSearchResults }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userPrompt, setUserPrompt] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Starting handleSubmit');

    setLoading(true);
    setError(null);

    try {
      const preferences = parsePreferences(userPrompt);
      console.log("Parsed preferences:", preferences);

      if (!preferences) {
        throw new Error('Could not parse input. Please describe your preferences clearly.');
      }

      const response = await fetch(process.env.BACKEND_URL + "/api/analyze_apartments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseBody = await response.json();
      console.log("Response received:", responseBody); // Log the entire response

      if (responseBody.apartments && responseBody.apartments.length > 0) {
        const processedApartments = processApartments(responseBody.apartments);
        onSearchResults({ ...responseBody, apartments: processedApartments });
      } else {
        console.log("No apartments found in the response");
        onSearchResults(responseBody);
      }

    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const processApartments = (apartments) => {
    return apartments.map(apt => {
      // Check if latitude and longitude are directly available
      let lat = apt.latitude;
      let lng = apt.longitude;

      // If not, check if they're nested under location.address.coordinate
      if (!lat && !lng && apt.location && apt.location.address && apt.location.address.coordinate) {
        lat = apt.location.address.coordinate.lat;
        lng = apt.location.address.coordinate.lon;
      }

      return {
        id: apt.zpid,
        latitude: lat,
        longitude: lng,
        address: apt.address,
        price: apt.price,
        bedrooms: apt.bedrooms,
        bathrooms: apt.bathrooms,
        livingArea: apt.living_area,
        imageUrl: apt.image_url || apt.imgSrc, // Include the image URL
        // Include any other relevant properties
      };
    }).filter(apt => apt.latitude && apt.longitude); // Only include apartments with valid coordinates
  };

  const parsePreferences = (input) => {
    const preferences = {};
    const locationMatch = input.match(/in (\w+(?:,?\s*\w+)*)/i);
    const homeTypeMatch = input.match(/(apartment|house|condo|townhouse)/i);
    const bedroomsMatch = input.match(/(\d+)\s*bedrooms?/i);
    const bathroomsMatch = input.match(/(\d+)\s*bathrooms?/i);
    const priceMatch = input.match(/(\d{1,3}(?:,\d{3})*)\s*to\s*(\d{1,3}(?:,\d{3})*)\s*(?:dollars|usd|$)/i);
    const lessThanPriceMatch = input.match(/less\s*than\s*(\d{1,3}(?:,\d{3})*)\s*(?:dollars|usd|$)/i);
    const moreThanPriceMatch = input.match(/more\s*than\s*(\d{1,3}(?:,\d{3})*)\s*(?:dollars|usd|$)/i);

    // Updated square feet matching
    const squareFeetMatch = input.match(/(\d+)\s*(?:sq(?:uare)?\s*f(?:ee)?t|sqft)/i);
    const lessThanSqftMatch = input.match(/less\s*than\s*(\d+)\s*(?:sq(?:uare)?\s*f(?:ee)?t|sqft)/i);
    const moreThanSqftMatch = input.match(/more\s*than\s*(\d+)\s*(?:sq(?:uare)?\s*f(?:ee)?t|sqft)/i);

    if (locationMatch) preferences.location = locationMatch[1];
    if (homeTypeMatch) preferences.home_type = homeTypeMatch[1].charAt(0).toUpperCase() + homeTypeMatch[1].slice(1);
    if (bedroomsMatch) preferences.bedrooms = parseInt(bedroomsMatch[1], 10);
    if (bathroomsMatch) preferences.bathrooms = parseInt(bathroomsMatch[1], 10);

    // Handle price preferences
    if (priceMatch) {
      preferences.min_price = parseInt(priceMatch[1].replace(/,/g, ''), 10);
      preferences.max_price = parseInt(priceMatch[2].replace(/,/g, ''), 10);
    } else if (lessThanPriceMatch) {
      preferences.max_price = parseInt(lessThanPriceMatch[1].replace(/,/g, ''), 10);
    } else if (moreThanPriceMatch) {
      preferences.min_price = parseInt(moreThanPriceMatch[1].replace(/,/g, ''), 10);
    } else if (input.includes('less') || input.includes('under') || input.includes('at most')) {
      preferences.max_price = parseInt(input.match(/(\d{1,3}(?:,\d{3})*)/)[1].replace(/,/g, ''), 10);
    } else if (input.includes('more') || input.includes('over') || input.includes('at least')) {
      preferences.min_price = parseInt(input.match(/(\d{1,3}(?:,\d{3})*)/)[1].replace(/,/g, ''), 10);
    }

    // Handle square footage preferences
    if (lessThanSqftMatch) {
      preferences.max_sqft = parseInt(lessThanSqftMatch[1], 10);
    } else if (moreThanSqftMatch) {
      preferences.min_sqft = parseInt(moreThanSqftMatch[1], 10);
    } else if (squareFeetMatch) {
      const sqft = parseInt(squareFeetMatch[1], 10);
      if (input.includes('less') || input.includes('under') || input.includes('at most')) {
        preferences.max_sqft = sqft;
      } else if (input.includes('more') || input.includes('over') || input.includes('at least')) {
        preferences.min_sqft = sqft;
      } else {
        // If no qualifier is provided, set both min and max to the same value
        preferences.min_sqft = sqft;
        preferences.max_sqft = sqft;
      }
    }

    preferences.sort = "Newest";

    return Object.keys(preferences).length > 0 ? preferences : null;
  };

  return (
    <div>
      <h2>Home Search</h2>
      <form onSubmit={handleSubmit}>
        <div className="ai-input-container mb-3">
          <input
            type="text"
            className="ai-input"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Describe your preferences (e.g., I want an apartment in San Diego)"
            required
            disabled={loading}
          />
        </div>
        <div className="d-grid">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search Homes'}
          </button>
        </div>
      </form>
      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

export default HomeSearch;