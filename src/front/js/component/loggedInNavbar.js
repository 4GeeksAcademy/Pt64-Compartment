import React from "react";
import { Link } from "react-router-dom";

export const LoggedInNavbar = ({ onLogout }) => {
  return (
    <nav className="navbar navbar-light custom-navbar">
      <div className="container">
        <Link to="/" className="navbar-brand-link">
          {/* <img 
            src="/homeai.jpg"
            alt="NestifyAI" 
            className="navbar-brand-image" 
          /> */}
        </Link>
        <div className="ml-auto d-flex">
          <Link to="/categories" className="mr-2">
            <button className="btn btn-turquoise">Categories</button>
          </Link>
          <Link to="/city-finder" className="mr-2">
            <button className="btn btn-turquoise">City Finder</button>
          </Link>
          <button className="btn btn-turquoise" onClick={onLogout}>Sign Out</button>
        </div>
      </div>
    </nav>
  );
};