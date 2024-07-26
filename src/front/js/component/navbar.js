import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
import logo from "../../img/logo.png";


export const Navbar = () => {
    const { store, actions } = useContext(Context);

    const navbarClass = store.isLoggedIn ? 'navbar-logged-in' : 'navbar-logged-out';

    return (
        <nav className={`navbar navbar-expand-lg ${navbarClass}`}>
            <div className="container" id="alpha">
                <Link to="/" className="navbar-brand navbar-brand-link">
                    <img 
                        src={logo} 
                        alt="Compartments.com" 
                        className="navbar-brand-image" 
                        style={{ height: '50px' }} // Adjust the height as needed
                    />
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link to="/homeSearchPage" className="btn btn-outline-light me-2">Buy</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/searchPage" className="btn btn-outline-light me-2">Rent</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/categories" className="btn btn-outline-light me-2">Categories</Link>
                        </li>
                        {!store.token ? (
                            <>
                                <li className="nav-item">
                                    <Link to="/signin" className="btn btn-outline-light me-2">Sign In</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/signup" className="btn btn-outline-light">Sign Up</Link>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item">
                                <button className="btn btn-outline-light" onClick={() => actions.logOut()}>Logout</button>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};