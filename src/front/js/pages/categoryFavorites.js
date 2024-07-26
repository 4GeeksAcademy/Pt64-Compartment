import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

export const CategoryFavorites = () => {
  
  const [listings, setListings] = useState([]);

  const fetchListings = async () => {
    const response = await fetch(process.env.BACKEND_URL + "api/get_listing_by_cat");
    if (response.ok) {
      const data = await response.json();
      console.log('Listings successfully gotten');
      setListings(data);
  } else {
      console.error('Failed to fetch listings:', response.status);
  }
};

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <div>
      <div className="App">
        <div className="container mt-5">
          <div className="card-deck">
            yo
            {listings.map(listing => (
              <div className="card mb-3" key={listing.id}>
                <div className="card-body">
                  <h5 className="card-title">
                    <Link to={`/get_listing_by_cat/${listing.id}`}>
                    </Link>
                  </h5>
                </div>
                <div className="card-footer">
                  <ul className="list-unstyled">
                    {/* {listing.map((listingName, index) => (
                      <li key={index}>{listingName}</li>
                    ))} */}
                    {listing.listingName}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

