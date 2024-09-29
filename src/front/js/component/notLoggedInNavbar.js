import React from "react";
import { Link } from "react-router-dom";

export const NonLoggedInNavbar = () => {
  return (
    <nav className="navbar navbar-light custom-navbar">
      <div className="container">
        <Link to="/" className="navbar-brand-link">
          {/* <img 
            src="/homeai.jpg"
            alt="Nestify.ai" 
            className="navbar-brand-image" 
          /> */}
        </Link>
        <div className="ml-auto">
          <Link to="/signin">
            <button className="btn btn-primary">Sign In</button>
          </Link>
        </div>
        <div className="ml-auto">
          <Link to="/signup">
            <button className="btn btn-primary">Sign Up</button>
          </Link>
        </div>
      </div>
    </nav>
  );
};