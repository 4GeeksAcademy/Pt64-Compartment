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
            {/* {listings.map(listing => ( */}
              <div className="card mb-3">
                {/* key={listing.id} */}
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title">
                      2558-62 Sutter St, San Francisco, CA 94115
                    </h5>
                    <h5>Price: $3595</h5>
                    <h5>3 beds, 1 baths</h5>
                  </div>
                  <button type="button" className="btn btn-danger" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};