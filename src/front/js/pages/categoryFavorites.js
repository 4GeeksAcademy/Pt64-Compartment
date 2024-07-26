import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

export const CategoryFavorites = () => {
  
  const [listings, setListings] = useState([]);

  const { listing } = useParams();

  const fetchListings = async () => {
    const response = await fetch(process.env.BACKEND_URL + "api/get_listing_by_cat");
    if (response.ok) {
      const data = await response.json();
      const thisListing = data.find((list) => list.id == listing);
      if (thisListing) {
        setListings([thisListing]);
      }
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
                    {listing.map((listingName, index) => (
                      <li key={index}>{listingName}</li>
                    ))}
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

