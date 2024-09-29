import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { Context } from "../store/appContext";
import newLogo from "../../../assets/newLogo.png";

export const Navbar = () => {
    const { store, actions } = useContext(Context);

    return (
        <nav
            className="navbar navbar-expand-lg"
            style={{
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                padding: "10px 20px",
                borderRadius: "8px",
                transition: "all 0.3s ease",
            }}
        >
            <div className="container">
            <Link to="/searchpage">
                    <img
                        src={newLogo}
                        alt="Find Your Nest"
                        className="nest-image img-fluid"
                        style={{ maxHeight: '120px', maxWidth: '100%', marginBottom: '20px', cursor: 'pointer' }}
                    />
                </Link>
                {/* <Link to="/" className="navbar-brand d-flex align-items-center" style={{ color: "#77d0d3", fontWeight: "bold", fontSize: "1.5rem" }}>
                    Nestify.AI
                </Link> */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                    style={{
                        borderColor: "#77d0d3",
                        transition: "border-color 0.3s ease",
                    }}
                >
                    <span className="navbar-toggler-icon" style={{ filter: "invert(30%) sepia(80%) saturate(500%) hue-rotate(180deg)", }}></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        {/* <li className="nav-item">
                            <NavLink
                                to="/homeSearchPage"
                                className="nav-link"
                                activeclassname="active"
                                style={({ isActive }) => ({
                                    color: isActive ? "#77d0d3" : "#333333",
                                    fontWeight: isActive ? "bold" : "normal",
                                    transition: "color 0.3s ease",
                                })}
                            >
                                Buy
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/searchPage"
                                className="nav-link"
                                activeclassname="active"
                                style={({ isActive }) => ({
                                    color: isActive ? "#77d0d3" : "#333333",
                                    fontWeight: isActive ? "bold" : "normal",
                                    transition: "color 0.3s ease",
                                })}
                            >
                                Rent
                            </NavLink>
                        </li> */}
                    </ul>
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link to="/categories" className="nav-link">
                                <button
                                    className="btn"
                                    style={{
                                        border: "2px solid #77d0d3",
                                        color: "#77d0d3",
                                        backgroundColor: "transparent",
                                        borderRadius: "20px",
                                        padding: "8px 16px",
                                        transition: "all 0.3s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = "#77d0d3";
                                        e.target.style.color = "#ffffff";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = "transparent";
                                        e.target.style.color = "#77d0d3";
                                    }}
                                >
                                    Categories
                                </button>
                            </Link>
                        </li>
                        {!store.token ? (
                            <>
                                <li className="nav-item">
                                    <Link to="/signin" className="nav-link">
                                        <button
                                            className="btn"
                                            style={{
                                                backgroundColor: "#77d0d3",
                                                color: "#ffffff",
                                                border: "none",
                                                borderRadius: "20px",
                                                padding: "8px 16px",
                                                marginLeft: "10px",
                                                transition: "background-color 0.3s ease",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = "#5fb8bb";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = "#77d0d3";
                                            }}
                                        >
                                            Sign In
                                        </button>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/signup" className="nav-link">
                                        <button
                                            className="btn"
                                            style={{
                                                backgroundColor: "#77d0d3",
                                                color: "#ffffff",
                                                border: "none",
                                                borderRadius: "20px",
                                                padding: "8px 16px",
                                                marginLeft: "10px",
                                                transition: "background-color 0.3s ease",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = "#5fb8bb";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = "#77d0d3";
                                            }}
                                        >
                                            Sign Up
                                        </button>
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item">
                                <Link to="/signin" className="nav-link">
                                    <button
                                        className="btn"
                                        style={{
                                            backgroundColor: "#77d0d3",
                                            color: "#ffffff",
                                            border: "none",
                                            borderRadius: "20px",
                                            padding: "8px 16px",
                                            transition: "background-color 0.3s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = "#e60000";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = "#ff4d4d";
                                        }}
                                        onClick={() => actions.logOut()}
                                    >
                                        Logout
                                    </button>
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};
